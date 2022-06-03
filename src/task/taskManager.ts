/**
 * 任务管理器，每100个ticks更新
 * 用于发布建造和维修的任务，该类被TargetManager引用
 */

export default class TaskManager {
  room: Room;
  /**
   * 需要建造和维修的任务
   */
  buildTasks: string[];

  /**
   * 需要维修的任务
   */
  repairTasks: string[];

  /**
   * 需要攻击的对象
   */
  attackTarget: string[];

  /**
   * 需要治疗的对象
   */
  healTarget: string[];

  constructor(room: Room) {
    this.room = room;
    // 获取该游戏时间，每20个ticks更新任务
    if (Game.time % 20 === 0) {
      // 清空现有任务，并发布新任务
      this.buildTasks = [];
      this.buildTasksPublish();
      this.repairTasks = [];
      this.repairTasksPublish();
      this.room.memory.buildTasks = this.buildTasks;
      this.room.memory.repairTasks = this.repairTasks;
    }

    // 每5ticks更新攻击目标
    if (Game.time % 5 === 0) {
      this.attackTarget = [];
      this.attackTargetPublish();
      this.room.memory.attackTarget = this.attackTarget;
      this.healTarget = [];
      this.healTargetPublish();
      this.room.memory.healTarget = this.healTarget;
    }
  }

  /**
   * 寻找所有需要修缮的城墙和建筑，建筑将会优先修缮，然后是工地
   */
  buildTasksPublish() {
    const constructionSite = this.room.find(FIND_MY_CONSTRUCTION_SITES);

    // 遍历每个建筑工地
    constructionSite.forEach((each) => {
      this.buildTasks.push(each.id);
    });
  }

  /**
   * 寻找所有需要维修的对象
   */
  repairTasksPublish() {
    const structures = this.room.find(FIND_STRUCTURES);
    const myStructures = this.room.find(FIND_MY_STRUCTURES);
    // 遍历每一个container和road
    structures.forEach((structure) => {
      if (
        (structure.structureType === STRUCTURE_CONTAINER ||
          structure.structureType === STRUCTURE_ROAD) &&
        structure.hits / structure.hitsMax < 0.5
      ) {
        this.buildTasks.push(structure.id);
      }
    });

    // 遍历每个建筑
    myStructures.forEach((structure) => {
      // 如果是Rampart且血量低于预设
      if (
        structure.structureType === STRUCTURE_RAMPART &&
        structure.hits <= structure.room.memory.rampart
      ) {
        this.buildTasks.push(structure.id);
      }

      // 如果是其他类型的建筑，血量低于0.5进行维修
      else if (structure.hits / structure.hitsMax < 0.5) {
        this.buildTasks.push(structure.id);
      }
    });
  }

  /**
   * 寻找包含攻击模块的敌人
   */
  attackTargetPublish() {
    const targets = this.room.find(FIND_HOSTILE_CREEPS, {
      filter: (creep) => {
        const bodys = creep.body;
        const target = bodys.filter((body) => {
          const type = body.type;
          return (
            type === ATTACK ||
            RANGED_ATTACK ||
            ATTACK_POWER ||
            RANGED_ATTACK_POWER
          );
        });
        if (target.length > 0) {
          return true;
        }
        return false;
      },
    });
    targets.forEach((target) => {
      this.attackTarget.push(target.id);
    });
  }

  /**
   * 获取生命值不满的本方Creep
   */
  healTargetPublish() {
    const targets = this.room.find(FIND_MY_CREEPS, {
      filter: (creep) => {
        return creep.hits < creep.hitsMax;
      },
    });
    targets.forEach((target) => {
      this.healTarget.push(target.id);
    });
  }

  /**
   * 获取一个建造任务
   * @returns 返回需要处理的对象id
   */
  static getBuildTask(room: Room) {
    const tasks = room.memory.buildTasks;
    const task = tasks.pop();
    room.memory.buildTasks = tasks;
    return task;
  }

  /**
   * 获取一个维修任务
   */
  static getRepairTask(room: Room) {
    const tasks = room.memory.repairTasks;
    const task = tasks.pop();
    room.memory.repairTasks = tasks;
    return task;
  }

  /**
   * 获取一个攻击目标
   */
  static getAttackTarget(room: Room) {
    const tasks = room.memory.attackTarget;
    const task = tasks.pop();
    room.memory.attackTarget = tasks;
    return task;
  }

  /**
   * 获取一个治疗目标
   */
  static getHealTarget(room: Room) {
    const tasks = room.memory.healTarget;
    const task = tasks.pop();
    room.memory.healTarget = tasks;
    return task;
  }
}
