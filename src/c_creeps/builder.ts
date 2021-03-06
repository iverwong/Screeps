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
    const memoryTask = creep.memory.builder.task;
    let taskStructure: Structure | ConstructionSite;

    if (memoryTask) {
      // 如果memory中有任务，则获取任务
      taskStructure = Game.getObjectById(memoryTask);
    } else {
      // 先获取维修任务，再获取建造任务
      let task = TaskManager.getRepairTask(creep.room);
      if (task) {
        // 如果有维修任务，则记录任务
        creep.memory.builder.task = task;
      } else {
        // 否则获取建造任务
        task = TaskManager.getBuildTask(creep.room);
        creep.memory.builder.task = task;
      }
      if (task) {
        taskStructure = Game.getObjectById(task) as Structure;
      } else return;
    }

    // 执行任务
    if (taskStructure instanceof Structure) {
      // 如果为建筑物，前往修理
      if (creep.repair(taskStructure) === ERR_NOT_IN_RANGE) {
        creep.moveTo(taskStructure);
      }
      // 如果是堡垒，则按照指定血量维修
      if (taskStructure.structureType === STRUCTURE_RAMPART) {
        if (taskStructure.hits >= creep.room.memory.rampart) {
          creep.memory.builder.task = null;
        }
      }
      // 如果是其他建筑物，血量已到达0.95以上，则转到下一个任务
      else if (taskStructure.hits >= taskStructure.hitsMax * 0.95) {
        creep.memory.builder.task = null;
      }
    } else {
      // 不为建筑物，则为工地
      if (creep.build(taskStructure) === ERR_NOT_IN_RANGE) {
        creep.moveTo(taskStructure);
      }
      // 修建完成则转到下个任务
      if (!taskStructure) creep.memory.builder.task = null;
    }
  }
  getEnum(): number {
    return BuilderStateEnum.TASK;
  }
}
