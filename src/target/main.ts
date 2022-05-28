/**
 * 目标相关，默认暴露TargetManager类
 *
 * 设计思路：
 *  包含各类目标，譬如维持某类型工人多少个等。主程序通过对每个房间实例化一个TargetManager类，来管理该房间的所有内容
 *
 */

import CreepManager from "../c_creeps/main";

export default class TargetManager {
  /**
   * 目标管理器，对任务计划进行管理
   * @param room 房间
   */
  constructor(room: Room) {
    this.room = room;
    this.creepManager = new CreepManager(room);
  }

  /**
   * 该目标管理器所管理的房间
   */
  room: Room;
  /**
   * 该房间所对应的creep管理器
   */
  creepManager: CreepManager;
  /**
   * 管理器中的任务，通过add方法进行追加
   */
  targets: Target[] = [];

  /**
   * 新增一个目标，并完成需求检查，如需求检查不通过则不执行
   * @param target 目标
   */
  add(target: Target) {
    // 需求检查
    if (target.require(this)) {
      // 添加到目标管理器中
      this.targets.push(target);
    }
    // 执行计划检查
    target.planChange();
    // 返回自身，可以继续调用add方法
    return this;
  }

  /**
   * 执行目标管理器中的所有任务
   */
  go() {
    this.targets.forEach((task) => {
      task.doTask();
    });
  }
}

export abstract class Target {
  /**
   * 计划名称，同一个计划名称孵化的工人执行相同的任务
   */
  plan: string;

  constructor(plan: string) {
    this.plan = plan;
  }

  /**
   * 需求检查，返回是否通过的布尔值，展示该目标是否能在现有状况下执行
   */
  abstract require(targetManager: TargetManager): boolean;

  /**
   * 执行该任务
   */
  abstract doTask(): void;

  /**
   * 计划检查，检查计划是否发生变更等等，将发生在需求检查之后，且无论需求检查是否通过
   */
  abstract planChange(): void;
}
