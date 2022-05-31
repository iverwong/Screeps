import { CreepState, CreepType, C_Creep } from "./types";

export default class Upgrader extends C_Creep {
  /**
   * 升级，在定点获取能量并完成升级操作
   *
   * @param id creepid
   */
  constructor(id: string) {
    super(id);
  }

  changeState(): CreepState {
    const creep = this.creep;
    const inputStructure = Game.getObjectById(
      this.creep.memory.upgrader.input
    ) as Structure;
    const { positionX, positionY, positionRoom } = this.creep.memory.upgrader;
    const location = new RoomPosition(positionX, positionY, positionRoom);
    const freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);
    const usedCapacity = creep.store.getUsedCapacity(RESOURCE_ENERGY);
    switch (this.state.getEnum()) {
      case UpgraderStateEnum.GET:
        /**
         * 获取能量状态
         *
         * 当自身储存空间满时，切换到升级状态
         */
        if (freeCapacity === 0) {
          return new Upgrader_UpgradeState(this);
        }
        return this.state;

      case UpgraderStateEnum.UPGRADE:
        /**
         * 升级状态
         *
         * 当自身能量空时，切换到获取能量状态
         */
        if (usedCapacity === 0) {
          return new Upgrader_GetState(this);
        }
        return this.state;
    }
  }
  getCreepTypeState(): CreepState {
    const creep = this.creep;
    switch (creep.memory.upgrader.state) {
      case UpgraderStateEnum.GET:
        return new Upgrader_GetState(this);
      case UpgraderStateEnum.UPGRADE:
        return new Upgrader_UpgradeState(this);
    }
  }
  getType(): CreepType {
    return CreepType.UPGRADER;
  }
}

export enum UpgraderStateEnum {
  GET,
  UPGRADE,
}

class Upgrader_GetState extends CreepState {
  /**
   * 获取能量状态
   *
   * 从指定位置获取能量
   *
   * @param c_creep C_Creep对象
   */

  constructor(c_creep: C_Creep) {
    super(c_creep);
  }

  doWork(): void {
    const creep = this.c_creep.creep;
    const inputStructure = Game.getObjectById(
      creep.memory.upgrader.input
    ) as Structure;
    const { positionX, positionY, positionRoom } = creep.memory.upgrader;
    const position = new RoomPosition(positionX, positionY, positionRoom);
    if (!creep.pos.isEqualTo(position)) {
      creep.moveTo(position);
    } else {
      if (
        creep.withdraw(inputStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
      ) {
        throw new Error("指定位置有误，无法获取能量");
      }
    }
  }
  getEnum(): number {
    return UpgraderStateEnum.GET;
  }
}

class Upgrader_UpgradeState extends CreepState {
  /**
   * 升级状态
   *
   * 对房间控制器进行升级操作
   *
   * @param c_creep C_Creep对象
   */
  constructor(c_creep: C_Creep) {
    super(c_creep);
  }

  doWork(): void {
    const creep = this.c_creep.creep;
    const inputStructure = Game.getObjectById(
      creep.memory.upgrader.input
    ) as Structure;
    const { positionX, positionY, positionRoom } = creep.memory.upgrader;
    const position = new RoomPosition(positionX, positionY, positionRoom);
    if (!creep.pos.isEqualTo(position)) {
      creep.moveTo(position);
    } else {
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        throw new Error("指定位置有误，无法进行升级");
      }
    }
  }
  getEnum(): number {
    return UpgraderStateEnum.UPGRADE;
  }
}
