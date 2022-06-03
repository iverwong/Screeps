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
      // 获取攻击任务
      targetId = TaskManager.getAttackTarget(this.room);
      if (targetId) {
        // 执行攻击任务
        const target = Game.getObjectById(targetId) as Creep;
        this.room.memory.towerTarget[this.plan] = targetId;
        this.towers.forEach((tower) => {
          tower.attack(target);
        });
      } else {
        // 获取治疗任务
        targetId = TaskManager.getHealTarget(this.room);
        if (targetId) {
          // 执行治疗任务
          const target = Game.getObjectById(targetId) as Creep;
          this.room.memory.towerTarget[this.plan] = targetId;
          this.towers.forEach((tower) => {
            tower.heal(target);
          });
        }
        // else {
        //   // 获取维修任务
        //   targetId = TaskManager.getRepairTask(this.room);
        //   if (targetId) {
        //     // 执行维修任务
        //     const target = Game.getObjectById(targetId) as Structure;
        //     this.room.memory.towerTarget[this.plan] = targetId;
        //     this.towers.forEach((tower) => {
        //       tower.repair(target);
        //     });
        //   } else {
        //     // 无任务，则完成计划
        //     return;
        //   }
        // }
      }
    } else {
      // 根据target类型执行任务
      const target = Game.getObjectById(targetId);
      if (!target) {
        // 不存在，则清除该target
        this.room.memory.towerTarget[this.plan] = null;
      } else {
        // 否则，判断target类型
        if (target instanceof Creep) {
          const my = target.my;
          if (my) {
            // 我方Creep，进行治疗
            if (target.hits === target.hitsMax) {
              // 已满血，则清除该target
              this.room.memory.towerTarget[this.plan] = null;
              return;
            } else {
              this.towers.forEach((tower) => {
                tower.heal(target);
              });
            }
          } else {
            // 敌方Creep，进行攻击
            this.towers.forEach((tower) => {
              tower.attack(target);
            });
          }
        }
        // else if (target instanceof Structure) {
        //   // 判断是否需要继续维修
        //   if (target.hits / target.hitsMax >= 0.95) {
        //     // 已经维修满了，则清除该target
        //     this.room.memory.towerTarget[this.plan] = null;
        //     return;
        //   } else {
        //     this.towers.forEach((tower) => {
        //       tower.repair(target);
        //     });
        //   }
        // }
      }
    }
  }
}
