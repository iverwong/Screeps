import GlobalContext from "@/global/context";
import { CreepState, CreepType, C_Creep } from "./types";

export default class Carrier extends C_Creep {
  /**
   * 搬运，负责定点搬运和转运能量
   */
  constructor(id: string) {
    super(id);
  }

  changeState(): CreepState {
    const creep = this.creep;
    const freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);
    const usedCapacity = creep.store.getUsedCapacity(RESOURCE_ENERGY);

    switch (this.state.getEnum()) {
      case CarrierStateEnum.GET:
        /**
         * 获取能量状态
         *
         * 当自身储存空间满时，根据孵化池能量是否已满切换筑巢或运输状态
         */
        if (freeCapacity === 0) {
          if (
            creep.room.energyCapacityAvailable === creep.room.energyAvailable
          ) {
            // 切换到运输状态
            return new Carrier_CarryState(this);
          } else {
            return new Carrier_NestState(this);
          }
        }
        return this.state;
      case CarrierStateEnum.NEST:
        /**
         * 筑巢状态
         *
         * 如果孵化池已无空间，则转换到运输状态
         * 如自身空间已空，则转换到获取能量状态
         */
        if (usedCapacity === 0) {
          return new Carrier_GetState(this);
        } else {
          if (
            creep.room.energyAvailable === creep.room.energyCapacityAvailable
          ) {
            return new Carrier_CarryState(this);
          }
        }
        return this.state;

      case CarrierStateEnum.CARRY:
        /**
         * 运输状态
         *
         * 如果自身空了，则转换到获取能量状态
         * 优先查看是否有需要补充的能量容器，如果没有则检查
         * 如果孵化池有空间，则转换到筑巢状态
         */
        if (usedCapacity === 0) {
          return new Carrier_GetState(this);
        }

        const towers = GlobalContext.getTowers(creep.room);
        if (towers.length !== 0) {
          const tower = towers.filter((tower) => {
            return tower.store.getFreeCapacity(RESOURCE_ENERGY) !== 0;
          })[0];
          if (tower) return new Carrier_FillState(this, tower);
        }

        if (creep.room.energyCapacityAvailable !== creep.room.energyAvailable) {
          return new Carrier_NestState(this);
        }
        return this.state;

      case CarrierStateEnum.FILL:
        /**
         * 能量补充状态
         *
         * 如果自身空了，则转换到获取能量状态
         * 如果目标满了，则根据情况转换到筑巢或运输状态
         */
        if (usedCapacity === 0) {
          return new Carrier_GetState(this);
        }
        const state = this.state as Carrier_FillState;
        const target = state.target;
        if (target) {
          // 如果存在目标，则检查目标是否满了
          if (target.store.getFreeCapacity() === 0) {
            // 重设目标
            creep.memory.carrier.fillTarget = null;
            if (
              creep.room.energyAvailable === creep.room.energyCapacityAvailable
            ) {
              return new Carrier_CarryState(this);
            }
            return new Carrier_NestState(this);
          }
        } else {
          // 如果不存在目标，则根据情况转换状态
          if (
            creep.room.energyAvailable === creep.room.energyCapacityAvailable
          ) {
            return new Carrier_CarryState(this);
          }
          return new Carrier_NestState(this);
        }
        // 存在且未满，则继续补充
        return this.state;
    }
  }
  getCreepTypeState(): CreepState {
    const creep = this.creep;
    switch (creep.memory.carrier.state) {
      case CarrierStateEnum.CARRY:
        return new Carrier_CarryState(this);
      case CarrierStateEnum.GET:
        return new Carrier_GetState(this);
      case CarrierStateEnum.NEST:
        return new Carrier_NestState(this);
      case CarrierStateEnum.FILL:
        return new Carrier_FillState(
          this,
          Game.getObjectById(creep.memory.carrier.fillTarget) as StructureTower
        );
    }
  }
  getType(): CreepType {
    return CreepType.CARRIER;
  }
}

export enum CarrierStateEnum {
  GET,
  NEST,
  CARRY,
  FILL,
}

class Carrier_GetState extends CreepState {
  /**
   * 获取能量状态
   *
   * 前往指定位置获取能量
   *
   * @param c_creep C_Creep对象
   */
  constructor(c_creep: C_Creep) {
    super(c_creep);
  }

  doWork(): void {
    const creep = this.c_creep.creep;
    const input = creep.memory.carrier.input;
    const inputStructure = Game.getObjectById(input);
    if (creep.withdraw(inputStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(inputStructure);
    }
  }
  getEnum(): number {
    return CarrierStateEnum.GET;
  }
}

class Carrier_NestState extends CreepState {
  /**
   * 筑巢状态
   *
   * 如果spawn或extention存在空缺，则搬运能量至spawn或extention
   *
   * @param creep C_Creep对象
   */

  constructor(creep: C_Creep) {
    super(creep);
  }
  doWork(): void {
    const creep = this.c_creep.creep;
    const storage = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return (
          (structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_EXTENSION) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      },
    });
    if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(storage);
    }
  }
  getEnum(): number {
    return CarrierStateEnum.NEST;
  }
}

class Carrier_CarryState extends CreepState {
  c_creep: C_Creep;

  /**
   * 运输状态
   *
   * 向指定位置进行搬运
   *
   * @param c_creep C_Creep对象
   */
  constructor(c_creep: C_Creep) {
    super(c_creep);
  }

  doWork(): void {
    const creep = this.c_creep.creep;
    const output = creep.memory.carrier.output;
    const outputStructure = Game.getObjectById(output);
    if (creep.transfer(outputStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(outputStructure);
    }
  }
  getEnum(): number {
    return CarrierStateEnum.CARRY;
  }
}

class Carrier_FillState extends CreepState {
  c_creep: C_Creep;
  target: StructureTower;

  /**
   * 填充状态
   *
   * 为Tower和其他需要填充能量的结构体填充能量
   *
   * @param c_creep C_Creep对象
   */
  constructor(c_creep: C_Creep, target: StructureTower) {
    super(c_creep);
    this.target = target;
  }

  doWork(): void {
    if (!this.target) return;
    const creep = this.c_creep.creep;
    if (creep.transfer(this.target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(this.target);
    }
  }
  getEnum(): number {
    return CarrierStateEnum.FILL;
  }
}
