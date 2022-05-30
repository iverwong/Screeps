import { C_Creep, CreepType, CreepState } from "./types";

export default class Aborigine extends C_Creep {
  state: CreepState;
  id: string;
  creep: Creep;

  /**
   * 土著，在最开始完成基本构造的工人，提供[CARRY,WORK,MOVE]的能力。主要用于在Spawn周边完成采矿、建造和升级任务。
   *
   * 工作任务：
   *      1.收集能量资源并建造一个将资源返回至孵化该土著的Spawn
   *      2.当Spawn能量满时，建造任意类型的结构
   *      3.如无任何结构可建造，则对房间控制器进行升级
   *
   * @param id creep id
   */
  constructor(id: string) {
    super(id);
  }

  getCreepTypeState(): CreepState {
    const creep = this.creep;
    switch (creep.memory.aborigine.state) {
      case AborigineStateEnum.MINE:
        return new Aborigine_MineState(this);
      case AborigineStateEnum.BUILD:
        return new Aborigine_BuildState(this);
      case AborigineStateEnum.UPGRADE:
        return new Aborigine_UpgradeState(this);
    }
  }

  changeState(): CreepState {
    const { creep } = this;
    // 获取creep空余容量
    const freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);
    // 获取最近的可建造的结构
    const constructionSite = creep.pos.findClosestByRange(
      FIND_CONSTRUCTION_SITES
    );
    // 获取creep空余容量
    const usedCapacity = creep.store.getUsedCapacity(RESOURCE_ENERGY);

    switch (this.state.getEnum()) {
      case AborigineStateEnum.MINE:
        /**
         * 挖矿状态
         *
         * 当满载时，且Spawn已没有储存空间，则转移到Build状态
         * 如无任何建筑，则转化到Upgrade状态
         */

        // 如果满载，则判断Spawn空余容量
        if (freeCapacity === 0) {
          const spawn = Game.spawns[creep.memory.aborigine.spawn];
          const spawnFreeCapacity =
            spawn.store.getFreeCapacity(RESOURCE_ENERGY);
          // 如果Spawn也满载，则转移到Build状态
          if (spawnFreeCapacity === 0) {
            // 查看是否有建筑可建造
            if (!constructionSite) {
              // 无可建造建筑则转移到Upgrade状态
              return new Aborigine_UpgradeState(this);
            }
            // 否则转移到Build状态
            else return new Aborigine_BuildState(this);
          }
        }
        return this.state;
      case AborigineStateEnum.BUILD:
        /**
         * 建造状态
         *
         * 当空载时，或周围无建造目标时，直接转移到Mine状态
         */

        // 如果空载或无建造目标时，则转移到Mine状态
        if (usedCapacity === 0 || constructionSite === null) {
          return new Aborigine_MineState(this);
        }
        return this.state;

      case AborigineStateEnum.UPGRADE:
        /**
         * 升级状态
         *
         * 当空载时，转移到Mine状态
         */
        if (usedCapacity === 0) return new Aborigine_MineState(this);
    }
  }

  getType(): CreepType {
    return CreepType.ABORIGINE;
  }
}

/**
 * 土著状态机枚举类
 * 不同状态机对应不同的state数值，数值用于从memory中获取和储存
 */
export enum AborigineStateEnum {
  MINE,
  BUILD,
  UPGRADE,
}

class Aborigine_MineState extends CreepState {
  c_creep: C_Creep;

  /**
   * 挖矿状态
   *
   * 满载时，返回出生Spawn点进行储存
   * 其余情况会根据memory中的targetSource字段，获取目标矿点，并进行挖矿。
   *
   * @param c_creep C_Creep对象
   */
  constructor(c_creep: C_Creep) {
    super();
    this.c_creep = c_creep;
  }
  doWork(): void {
    const { creep } = this.c_creep;
    // 获取目标spawn
    const spawn = Game.spawns[creep.memory.aborigine.spawn];
    // 获取目标矿点
    const source = Game.getObjectById(
      creep.memory.aborigine.targetSource
    ) as Source;
    // 获取Creep的空余容量
    const freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);

    if (freeCapacity === 0) {
      // 如果满载，则将能量运回Spawn
      if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
        creep.moveTo(spawn);
    } else {
      // 否则挖矿
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) creep.moveTo(source);
    }
  }

  getEnum(): number {
    return AborigineStateEnum.MINE;
  }
}

class Aborigine_BuildState extends CreepState {
  c_creep: C_Creep;
  /**
   * 建造状态
   *
   * 寻找最近未完成的结构，并进行建造。
   *
   * @param c_creep C_Creep对象
   */
  constructor(c_creep: C_Creep) {
    super();
    this.c_creep = c_creep;
  }

  getEnum(): number {
    return AborigineStateEnum.BUILD;
  }

  doWork(): void {
    const creep = this.c_creep.creep;
    const constructionSite = this.c_creep.creep.pos.findClosestByRange(
      FIND_CONSTRUCTION_SITES
    );
    if (creep.build(constructionSite) === ERR_NOT_IN_RANGE)
      creep.moveTo(constructionSite);
  }
}

class Aborigine_UpgradeState extends CreepState {
  c_creep: C_Creep;

  /**
   * 升级状态
   *
   * 对所在房间的房间控制器进行升级
   *
   * @param c_creep C_Creep对象
   */
  constructor(c_creep: C_Creep) {
    super();
    this.c_creep = c_creep;
  }

  doWork(): void {
    const creep = this.c_creep.creep;
    const roomController = creep.room.controller;
    if (creep.upgradeController(roomController) === ERR_NOT_IN_RANGE)
      creep.moveTo(roomController);
  }
  getEnum(): number {
    return AborigineStateEnum.UPGRADE;
  }
}
