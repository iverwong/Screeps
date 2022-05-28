import { C_Creep, CreepType, CreepState } from "./types";

export default class Aborigine extends C_Creep {
  state: CreepState;
  id: string;
  creep: Creep;

  /**
   * 土著，在最开始完成基本构造的工人，提供[CARRY,WORK,WORK,MOVE]的能力。主要用于在Spawn周边完成采矿和建造任务。
   *
   * 工作任务：
   *      1.收集能量资源并建造一个将资源返回至孵化该土著的Spawn
   *      2.当Spawn能量满时，建造任意类型的结构
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
    }
  }

  changeState(): CreepState {
    const { creep } = this;
    switch (this.state.getEnum()) {
      case AborigineStateEnum.MINE:
        /**
         * 挖矿状态
         *
         * 当满载时，且Spawn已没有储存空间，则转移到Build状态
         */

        // 获取creep空余容量
        const freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);
        // 如果满载，则判断Spawn空余容量
        if (freeCapacity === 0) {
          const spawn = Game.spawns[creep.memory.aborigine.spawn];
          const spawnFreeCapacity =
            spawn.store.getFreeCapacity(RESOURCE_ENERGY);
          // 如果Spawn也满载，则转移到Build状态
          if (spawnFreeCapacity === 0) {
            return new Aborigine_BuildState(this);
          }
        }
        return this.state;
      case AborigineStateEnum.BUILD:
        /**
         * 建造状态
         *
         * 当空载时，或周围无建造目标时，直接转移到Mine状态
         */
        const constructionSite = creep.pos.findClosestByRange(
          FIND_CONSTRUCTION_SITES
        );

        // 获取creep空余容量
        const usedCapacity = creep.store.getUsedCapacity(RESOURCE_ENERGY);

        // 如果空载或无建造目标时，则转移到Mine状态
        if (usedCapacity === 0 || constructionSite === null) {
          return new Aborigine_MineState(this);
        }
        return this.state;
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
