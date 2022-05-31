/**
 * 更新相关，为Creep提供主动和被动更新的方法
 */

import { CreepType } from "@/c_creeps/types";
import main, { Target } from "./main";

export class PassiveRenew extends Target {
  spawns: StructureSpawn[];
  higherThreshold: number;
  lowerThreshold: number;
  lowerRange: number;
  targetCreep: (creep: Creep) => boolean;

  /**
   *
   * @param plan 计划名称
   * @param spawns 该房间中哪些孵化器受影响，默认为房间内所有的孵化器
   * @param higherThreshold 该阈值表示低于或等于该阈值且临近的Creep将被更新，默认为1200
   * @param lowerThreshold 该阈值表示低于或等于该阈值的Creep将等待被更新，即便该Spawn没有足够的能量或正在孵化中，默认为200
   * @param lowerRange 表示等待更新的范围，即如果Spawn周边范围内有低于或等于lowerThreshold的Creep，则主动将该Creep找回到Spawn身边，完成更新
   * @param targetCreep 目标Creep，默认为所有非“outOfPlan”且没有状态的Creep，该值接收一个函数，通过布尔值确定该Creep应不应该被升级
   * 同时，以下工人类型将自行主动更新：Miner
   */
  constructor(
    plan: string,
    spawns?: StructureSpawn[],
    higherThreshold: number = 1200,
    lowerThreshold: number = 200,
    lowerRange: number = 8,
    targetCreep: (creep: Creep) => boolean = (creep: Creep) =>
      creep.memory.plan !== "outOfPlan" &&
      !creep.effects &&
      !creep.name.startsWith(CreepType.MINER)
  ) {
    super(plan);
    this.spawns = spawns;
    this.higherThreshold = higherThreshold;
    this.lowerRange = lowerRange;
    this.lowerThreshold = lowerThreshold;
    this.targetCreep = targetCreep;
  }

  require(targetManager: main): boolean {
    /**
     * 初始化房间内的spawn
     */
    if (this.spawns === undefined) {
      this.spawns = targetManager.room.find(FIND_MY_SPAWNS);
    }
    return true;
  }

  planChange(): void {}

  doTask(): void {
    // 构建可视化区域
    this.spawns.forEach((spawn) => {
      const roomName = spawn.room.name;
      new RoomVisual(roomName).rect(
        spawn.pos.x - this.lowerRange - 0.5,
        spawn.pos.y - this.lowerRange - 0.5,
        this.lowerRange * 2 + 1,
        this.lowerRange * 2 + 1,
        { fill: "#98FB98", opacity: 0.2 }
      );
    });

    // 定义一个目标Creep，key值为spawn的name，value为该spawn中需要召回的目标Creep（根据距离判定）
    const spawnCallCreep: {
      [creepName: string]: { spawn: StructureSpawn; distance: number };
    } = {};
    // 对于每一个Spawn
    this.spawns.forEach((spawn) => {
      // 找到附近1个单位内距离的creep，如低于higherThreshold，且满足targetCreep条件，则更新
      const renewCreeps = spawn.pos.findInRange(FIND_MY_CREEPS, 1, {
        filter: (creep) =>
          creep.ticksToLive <= this.higherThreshold && this.targetCreep(creep),
      });
      // 覆盖移动并更新
      renewCreeps.forEach((creep) => {
        creep.moveTo(spawn);
        spawn.renewCreep(creep);
      });

      // 找到range范围内低于lowerThreshold的，且满足targetCreep条件的creep
      const callCreeps = spawn.pos.findInRange(
        FIND_MY_CREEPS,
        this.lowerRange,
        {
          filter: (creep) =>
            creep.ticksToLive <= this.lowerThreshold && this.targetCreep(creep),
        }
      );

      // 对于每一个callCreep，判断并记录其spawn和距离
      callCreeps.forEach((creep) => {
        const distance = creep.pos.getRangeTo(spawn);
        // 如果creep不存在于spawnCallCreep中，则记录
        if (!spawnCallCreep[creep.name]) {
          spawnCallCreep[creep.name] = { spawn, distance };
        } else {
          // 如果存在，则比较距离后记录
          if (spawnCallCreep[creep.name].distance > distance) {
            spawnCallCreep[creep.name] = { spawn, distance };
          }
        }
      });
    });

    // 根据spawnCallCreep中的记录，找到需要召回的creep
    Object.keys(spawnCallCreep).forEach((creepName) => {
      // 召回
      Game.creeps[creepName].say("🔙");
      Game.creeps[creepName].moveTo(spawnCallCreep[creepName].spawn);
    });
  }
}
