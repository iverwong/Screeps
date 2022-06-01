/**
 * 任务管理器，每100个ticks更新
 * 用于发布建造和维修的任务，该类被TargetManager引用
 */

export default class TaskManager {
  room: Room;
  task: string[];

  constructor(room: Room) {
    this.room = room;
    // 获取该游戏时间，每100个ticks更新任务
    if (Game.time % 100 === 0) {
      // 清空现有任务
      this.task = [];
      this.checkPublish();
      this.room.memory.tasks = this.task;
    }
  }

  /**
   * 寻找所有需要修缮的城墙和建筑，建筑将会优先修缮，然后是工地
   */
  checkPublish() {
    const structures = this.room.find(FIND_STRUCTURES);
    const myStructures = this.room.find(FIND_MY_STRUCTURES);
    const constructionSite = this.room.find(FIND_MY_CONSTRUCTION_SITES);

    // 遍历每个建筑工地
    constructionSite.forEach((each) => {
      this.task.push(each.id);
    });

    // 遍历每一个container和road
    structures.forEach((structure) => {
      if (
        structure.structureType === STRUCTURE_CONTAINER ||
        (structure.structureType === STRUCTURE_ROAD &&
          structure.hits / structure.hitsMax < 0.5)
      ) {
        this.task.push(structure.id);
      }
    });

    // 遍历每个建筑
    myStructures.forEach((structure) => {
      // 如果血量低于
      if (structure.hits / structure.hitsMax < 0.5) {
        this.task.push(structure.id);
      }
    });
  }

  /**
   * 获取一个任务
   * @returns 返回需要处理的对象id
   */
  static getTask(room: Room) {
    const tasks = room.memory.tasks;
    const task = tasks.pop();
    room.memory.tasks = tasks;
    return task;
  }
}
