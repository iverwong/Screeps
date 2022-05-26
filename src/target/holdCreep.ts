/**
 * 孵化相关，维持一个孵化任务
 */

import { CreepType } from "../c_creeps/types";
import { AborigineStateEnum } from "../c_creeps/aborigine";
import TargetManager, { Target } from "./main";

export class HoldAborigine extends Target {
  /**
   * 土著，在最开始完成基本构造的工人，提供[CARRY,WORK,WORK,MOVE]的身体
   *
   * 工作任务：
   *      1.收集能量资源并建造一个将资源返回至最近的Spawn
   *      2.当Spawn能量满时，建造任意类型的结构
   * @param holdNumber 孵化数量
   * @param source 能量矿场
   * @param spawn 用于孵化的Spawn
   */
  constructor(holdNumber: number, source: Source, spawn: StructureSpawn) {
    super();
    this.holdNumber = holdNumber;
    this.source = source;
    this.spawn = spawn;
  }

  /**
   * 维持数量
   */
  holdNumber: number;
  /**
   * 土著工作的目标矿场
   */
  source: Source;
  /**
   * 用于孵化的Spawn
   */
  spawn: StructureSpawn;

  require(targetManager: TargetManager): boolean {
    //是否已拥有足够的Aborigine
    // FIXME 在当前task
    if (
      targetManager.creepManager.getCreepsByType(CreepType.ABORIGINE).length >=
      this.holdNumber
    )
      return false;
    // 没有其他需求
    return true;
  }
  doTask(): void {
    // 孵化一个土著
    this.spawn.spawnCreep(
      [CARRY, WORK, WORK, MOVE],
      CreepType.ABORIGINE + Game.time,
      {
        memory: {
          aborigine: {
            targetSource: this.source.id,
            spawn: this.spawn.id,
            state: AborigineStateEnum.MINE,
          },
        },
      }
    );
  }
}
