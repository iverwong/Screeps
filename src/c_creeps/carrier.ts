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
    const inputStructure = Game.getObjectById(
      this.creep.memory.carrier.input
    ) as Structure;
    const outputStructure = Game.getObjectById(
      this.creep.memory.carrier.output
    ) as Structure;
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
          if (creep.room.energyAvailable === creep.room.energyAvailable) {
            return new Carrier_CarryState(this);
          }
        }
        return this.state;

      case CarrierStateEnum.CARRY:
        /**
         * 运输状态
         *
         * 如果自身空了，则转换到获取能量状态
         */
        if (usedCapacity === 0) {
          return new Carrier_GetState(this);
        }
        return this.state;
    }
  }
  getCreepTypeState(): CreepState {
    throw new Error("Method not implemented.");
  }
  getType(): CreepType {
    return CreepType.CARRIER;
  }
}

export enum CarrierStateEnum {
  GET,
  NEST,
  CARRY,
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
