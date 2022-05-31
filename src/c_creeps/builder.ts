import TaskManager from "@/task/taskManager";
import { CreepState, CreepType, C_Creep } from "./types";

export default class Builder extends C_Creep {
  constructor(id: string) {
    super(id);
  }

  changeState(): CreepState {
    const creep = this.creep;

    const freeCapacity = creep.store.getFreeCapacity(RESOURCE_ENERGY);
    const usedCapacity = creep.store.getUsedCapacity(RESOURCE_ENERGY);

    switch (this.state.getEnum()) {
      case BuilderStateEnum.GET:
        /**
         * 获取能量状态
         *
         * 当满载时，转到Task状态
         */
        if (freeCapacity === 0) {
          return new Builder_TaskState(this);
        }
        return this.state;

      case BuilderStateEnum.TASK:
        /**
         * 任务状态
         *
         * 当空载时，转到Get状态
         */
        if (usedCapacity === 0) {
          return new Builder_GetState(this);
        }
        return this.state;
    }
  }
  getCreepTypeState(): CreepState {
    const creep = this.creep;
    switch (creep.memory.builder.state) {
      case BuilderStateEnum.GET:
        return new Builder_GetState(this);
      case BuilderStateEnum.TASK:
        return new Builder_TaskState(this);
    }
  }
  getType(): CreepType {
    return CreepType.BUILDER;
  }
}

export enum BuilderStateEnum {
  GET,
  TASK,
}

class Builder_GetState extends CreepState {
  c_creep: C_Creep;

  /**
   * 获取能量状态
   *
   * 从指定地点获取能量
   *
   * @param c_creep C_Creep对象
   */
  constructor(c_creep: C_Creep) {
    super(c_creep);
  }

  doWork(): void {
    const creep = this.c_creep.creep;
    const inputStructure = Game.getObjectById(creep.memory.builder.input);
    if (creep.withdraw(inputStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
      creep.moveTo(inputStructure);
  }
  getEnum(): number {
    return BuilderStateEnum.GET;
  }
}

class Builder_TaskState extends CreepState {
  constructor(c_creep: C_Creep) {
    super(c_creep);
  }

  doWork(): void {
    // 获取任务
    const creep = this.c_creep.creep;
    const task = creep.memory.builder.task;
    let taskStructure: Structure | ConstructionSite;
    if (task) {
      taskStructure = Game.getObjectById(task);
    } else {
      const task = TaskManager.getTask(creep.room);
      creep.memory.builder.task = task;
      if (task) {
        taskStructure = Game.getObjectById(task) as Structure;
      } else return;
    }

    // 执行任务
    // TODO 考虑墙和堡垒的情况
    if (taskStructure instanceof Structure) {
      // 如果为建筑物，前往修理
      if (creep.repair(taskStructure) === ERR_NOT_IN_RANGE) {
        creep.moveTo(taskStructure);
      }
      // 如果建筑物血量已到达0.95以上，则转到下一个任务
      if (taskStructure.hits >= taskStructure.hitsMax * 0.95) {
        creep.memory.builder.task = null;
      }
    } else {
      // 不为建筑物，则为工地
      if (creep.build(taskStructure) === ERR_NOT_IN_RANGE) {
        creep.moveTo(taskStructure);
      }
    }
    // 无论如何，顺便维修道路
    const roads = creep.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (structure) => {
        structure.structureType === STRUCTURE_ROAD &&
          structure.hits / structure.hitsMax < 0.5;
      },
    });
    creep.repair(roads[0]);
  }
  getEnum(): number {
    return BuilderStateEnum.TASK;
  }
}
