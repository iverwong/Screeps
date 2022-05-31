/**
 * 任务管理器，每100个ticks更新
 * 用于发布建造和维修的任务，该类被TargetManager引用
 */

export default class TaskManager {
  room: Room;
  task: string[];

  constructor(room: Room) {
    this.room = room;
    // 获取该游戏时间，每10个ticks更新任务
    if (Game.time % 10 === 0) {
      // 清空现有任务
      this.task = [];
      this.checkPublish();
      this.room.memory.tasks = this.task;
    } else {
      // 在未更新任务时，从内存中获取
      this.task = this.room.memory.tasks;
    }
  }

  /**
   * 寻找所有需要修缮的城墙和建筑，建筑将会优先修缮，然后是工地
   */
  checkPublish() {
    const structures = this.room.find(FIND_MY_STRUCTURES);
    const constructionSite = this.room.find(FIND_MY_CONSTRUCTION_SITES);

    // 遍历每个建筑工地
    constructionSite.forEach((each) => {
      this.task.push(each.id);
    });

    // 遍历每个建筑
    structures.forEach((structure) => {
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
  getTask() {
    const task = this.task.pop();
    this.room.memory.tasks = this.task;
    return task;
  }
}
