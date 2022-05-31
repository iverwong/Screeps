/**
 * 孵化相关，维持一个孵化任务
 */

import { CreepType, C_Creep } from "../c_creeps/types";
import { AborigineStateEnum } from "../c_creeps/aborigine";
import TargetManager, { Target } from "./main";
import { MinerStateEnum } from "@/c_creeps/miner";
import { CarrierStateEnum } from "@/c_creeps/carrier";
import { UpgraderStateEnum } from "@/c_creeps/upgrader";

abstract class HoldTarget extends Target {
  /**
   * 用于孵化的Spawn
   */
  spawn: StructureSpawn;
  /**
   * 维持数量
   */
  holdNumber: number;

  /**
   * 计划中所包含的C_Creep对象集合
   */
  planCreeps: C_Creep[];

  /**
   * 维持执行某种计划（plan）的某种工人（派生自此类）
   */
  constructor(plan: string, spawn: StructureSpawn, holdNumber: number) {
    super(plan);
    this.spawn = spawn;
    this.holdNumber = holdNumber;
  }

  /**
   * 维持工人目标抽象类的require实现，将根据plan计划来判断维持数量是否已超过
   * @param targetManager 目标管理器
   * @returns 布尔值
   */
  require(targetManager: TargetManager): boolean {
    // 保存planCreeps对象
    this.planCreeps = targetManager.creepManager.getCreepsByPlan(this.plan);
    // 判断是否有足够的工人
    if (this.planCreeps.length >= this.holdNumber) return false;
    // 没有其他需求
    return true;
  }

  /**
   * 处理维持工人的数量降低的情况
   *
   * 当维持数量降低时，会根据工人寿命情况将即将死亡的工人排除计划外，赋值给排除计划外的工人以"outOfPlan"计划
   */
  planChange(): void {
    // 处理维持数量降低的情况
    if (this.planCreeps.length > this.holdNumber) {
      // 需要排除的数量
      const excludeNumber = this.planCreeps.length - this.holdNumber;
      // 排除指定数量的工人（按ticksToLive数值排序，取小值）
      const orderdPlanCreeps = this.planCreeps.sort(
        (a, b) => a.creep.ticksToLive - b.creep.ticksToLive
      );
      // 排除计划
      const removedCreeps = orderdPlanCreeps.splice(0, excludeNumber);
      removedCreeps.forEach((each) => {
        each.creep.memory.plan = "outOfPlan";
      });
      this.planCreeps = orderdPlanCreeps;
    }
  }
}

export class HoldAborigine extends HoldTarget {
  /**
   * 土著，在最开始完成基本构造的工人，提供[CARRY,WORK,MOVE]的身体
   *
   * 工作任务：
   *      1.收集能量资源并建造一个将资源返回至最近的Spawn
   *      2.当Spawn能量满时，建造任意类型的结构
   * @param holdNumber 孵化数量
   * @param source 能量矿场
   * @param spawn 用于孵化的Spawn
   */
  constructor(
    plan: string,
    spawn: StructureSpawn,
    holdNumber: number,
    source: Source
  ) {
    super(plan, spawn, holdNumber);
    this.source = source;
  }

  /**
   * 土著工作的目标矿场
   */
  source: Source;

  /**
   * 土著工作的目标矿场发生变更时，更新内存中矿场的id
   */
  planChange(): void {
    super.planChange();
    const c_creeps = this.planCreeps;
    c_creeps.forEach((c_creep) => {
      c_creep.creep.memory.aborigine.targetSource = this.source.id;
    });
  }

  doTask(): void {
    // 孵化一个土著
    this.spawn.spawnCreep(
      [CARRY, WORK, MOVE],
      CreepType.ABORIGINE + Game.time,
      {
        memory: {
          plan: this.plan,
          aborigine: {
            targetSource: this.source.id,
            state: AborigineStateEnum.MINE,
          },
        },
      }
    );
  }
}

export class HoldMiner extends HoldTarget {
  /**
   * 矿工工作的目标矿场
   */
  source: Source;
  /**
   * 矿工工作位置，该位置需包含一个container建筑
   */
  position: RoomPosition;
  /**
   * 矿工的身体组成
   */
  body: BodyPartConstant[] = [];
  /**
   * 矿工，在固定位置完成采矿任务，在闲时
   *
   * @param plan
   * @param spawn
   * @param holdNumber
   * @param source
   * @param position
   */
  constructor(
    plan: string,
    spawn: StructureSpawn,
    holdNumber: number,
    source: Source,
    position: RoomPosition,
    bodyMove: number = 2,
    bodyWork: number = 4
  ) {
    super(plan, spawn, holdNumber);
    this.source = source;
    this.position = position;
    for (let index = 0; index < bodyWork; index++) {
      this.body.push(WORK);
    }
    for (let index = 0; index < bodyMove; index++) {
      this.body.push(MOVE);
    }
  }

  /**
   * 矿工计划发生变更时，更新内存中矿场的id和位置
   */
  planChange(): void {
    super.planChange();
    const c_creeps = this.planCreeps;
    c_creeps.forEach((c_creep) => {
      c_creep.creep.memory.miner.targetSource = this.source.id;
      c_creep.creep.memory.miner.positionRoom = this.position.roomName;
      c_creep.creep.memory.miner.positionX = this.position.x;
      c_creep.creep.memory.miner.positionY = this.position.y;
    });
  }

  doTask(): void {
    // 孵化一个矿工
    this.spawn.spawnCreep(this.body, CreepType.MINER + Game.time, {
      memory: {
        plan: this.plan,
        miner: {
          targetSource: this.source.id,
          positionX: this.position.x,
          positionY: this.position.y,
          positionRoom: this.position.roomName,
          state: MinerStateEnum.MINE,
        },
      },
    });
  }
}

export class HoldCarrier extends HoldTarget {
  input: string;
  output: string;
  body: BodyPartConstant[] = [];

  /**
   * 运输，完成定点运输任务，当孵化池不满时，填充孵化池
   *
   * @param plan 计划名称
   * @param spawn 孵化的Spawn
   * @param holdNumber 维持数量
   * @param input 能量供给侧id
   * @param output 能量消耗侧id
   * @param bodyNumber 身体包含多少对[CARRY,MOVE]，默认为5
   */
  constructor(
    plan: string,
    spawn: StructureSpawn,
    holdNumber: number,
    input: string,
    output: string,
    bodyNumber: number = 5
  ) {
    super(plan, spawn, holdNumber);
    this.input = input;
    this.output = output;
    for (let index = 0; index < bodyNumber; index++) {
      this.body.push(CARRY);
    }
    for (let index = 0; index < bodyNumber; index++) {
      this.body.push(MOVE);
    }
  }

  /**
   * 当计划发生变更时，更新运输工人的input和output
   */
  planChange(): void {
    super.planChange();
    const c_creeps = this.planCreeps;
    c_creeps.forEach((c_creep) => {
      c_creep.creep.memory.carrier.input = this.input;
      c_creep.creep.memory.carrier.output = this.output;
    });
  }

  doTask(): void {
    // 孵化一个运输
    this.spawn.spawnCreep(this.body, CreepType.CARRIER + Game.time, {
      memory: {
        plan: this.plan,
        carrier: {
          input: this.input,
          output: this.output,
          state: CarrierStateEnum.GET,
        },
      },
    });
  }
}

export class HoldUpgrader extends HoldTarget {
  body: BodyPartConstant[] = [];
  input: string;
  position: RoomPosition;

  /**
   * 升级，完成定点升级任务
   *
   * @param plan 计划名称
   * @param spawn 用于孵化的spawn
   * @param holdNumber 维持数量
   * @param input 能量来源
   * @param position 工作位置
   * @param bodyMove move部件数量
   * @param bodyWork work部件数量
   */
  constructor(
    plan: string,
    spawn: StructureSpawn,
    holdNumber: number,
    input: string,
    position: RoomPosition,
    bodyMove: number = 2,
    bodyWork: number = 4
  ) {
    super(plan, spawn, holdNumber);
    this.input = input;
    this.position = position;
    for (let index = 0; index < bodyWork; index++) {
      this.body.push(WORK);
    }
    for (let index = 0; index < bodyMove; index++) {
      this.body.push(MOVE);
    }
    this.body.push(CARRY);
  }
  planChange(): void {
    super.planChange();
    const c_creeps = this.planCreeps;
    c_creeps.forEach((c_creep) => {
      c_creep.creep.memory.upgrader.input = this.input;
      c_creep.creep.memory.upgrader.positionRoom = this.position.roomName;
      c_creep.creep.memory.upgrader.positionX = this.position.x;
      c_creep.creep.memory.upgrader.positionY = this.position.y;
    });
  }

  doTask(): void {
    /**
     * 维持孵化升级工人
     */
    this.spawn.spawnCreep(this.body, CreepType.UPGRADER + Game.time, {
      memory: {
        plan: this.plan,
        upgrader: {
          input: this.input,
          positionX: this.position.x,
          positionY: this.position.y,
          positionRoom: this.position.roomName,
          state: UpgraderStateEnum.GET,
        },
      },
    });
  }
}
