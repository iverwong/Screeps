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
    if (!this.room.memory.towerTarget) {
      this.room.memory.towerTarget = {};
    }
    // 获取任务
    let targetId = this.room.memory.towerTarget[this.plan];
    if (!targetId) {
      targetId = TaskManager.getAttackTarget(this.room);
      if (!targetId) {
        // 如果没有攻击任务则获取一个治疗任务
        targetId = TaskManager.getHealTarget(this.room);
      }
    }
    if (targetId) {
      const target = Game.getObjectById(targetId) as Creep;
      if (target && !target.my) {
        // 存入内存
        this.room.memory.towerTarget[this.plan] = targetId;
        this.towers.forEach((tower) => {
          tower.attack(target);
        });
      } else if (target && target.my) {
        // 存入内存
        if (target.hits === target.hitsMax) {
          this.room.memory.towerTarget[this.plan] = null;
        } else {
          this.room.memory.towerTarget[this.plan] = targetId;
          this.towers.forEach((tower) => {
            tower.heal(target);
          });
        }
      } else {
        // 无目标，清空plan
        this.room.memory.towerTarget[this.plan] = null;
      }
    }
  }
}
