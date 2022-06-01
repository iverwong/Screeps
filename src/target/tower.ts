/**
 * 塔策略相关
 */

import TaskManager from "@/task/taskManager";
import main, { Target } from "./main";

export class TowerStrategy extends Target {
  /**
   * 该计划的目标实例，可传入多个
   */
  towers: StructureTower[];
  /**
   * 当前计划所在的房间，由require方法进行初始化
   */
  room: Room;

  constructor(plan: string, towerId: string[]) {
    super(plan);
    this.towers = towerId.map((eachId) => Game.getObjectById(eachId));
  }

  require(targetManager: main): boolean {
    this.room = targetManager.room;
    return true;
  }
  planChange(): void {}
  doTask(): void {
    // 获取攻击任务
    const targetId = TaskManager.getAttackTarget(this.room);
    if (targetId) {
      this.towers.forEach((tower) =>
        tower.attack(Game.getObjectById(targetId))
      );
    }
    // 暂不考虑维修的问题
  }
}
