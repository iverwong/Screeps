/**
 * creeps相关，默认暴露CreepManager类
 *
 * 设计思路：
 * 按照功能单一的原则，一种类型的creep只完成一项任务
 *
 * 该文件主要实现暴露所有类型的creep的接口和一些统计数据，方便其他模块调用
 */

import _ from "lodash";
import Miner from "./miner";
import Aborigine from "./aborigine";
import { C_Creep, CreepType } from "./types";

/**
 * creep管理器，负责管理所有creep，并提供统计数据
 *
 * 构造器提供一种工厂方法，根据creep名字生成对应的C_Creep对象，对象记录creep的id和类型，方便统一调用
 */
export default class CreepManager {
  /**
   * 所有creep的集合
   */
  creeps: C_Creep[] = [];
  /**
   * 已孵化出的creep
   */
  spawnedCreeps: C_Creep[] = [];
  /**
   * 正在孵化的creep
   */
  spawningCreeps: C_Creep[] = [];

  /**
   * 创建一个CreepManager实例，获取该房间的所有Creep及信息，同时清理Memory中无效的Creep信息
   * @param room 房间名称
   */
  constructor(room: Room) {
    const creeps = room.find(FIND_MY_CREEPS);
    creeps.forEach((creep) => {
      const c_creep = creepFactory(creep.name);
      if (c_creep) {
        const creep = Game.getObjectById(c_creep.id) as Creep;
        if (creep.spawning) {
          this.spawningCreeps.push(c_creep);
        } else {
          this.spawnedCreeps.push(c_creep);
        }
        this.creeps.push(c_creep);
      }
    });
    // 清理内存
    // TODO 在多个房间构造TargetManager时，会实例化多个CreepManager，导致重复清理。建立GlobalContext来管理
    for (const name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
      }
    }
  }

  /**
   * 所有已孵化的creep开始执行预定的工作
   */
  doWork() {
    this.spawnedCreeps.forEach((c_creep) => {
      c_creep.doWork();
    });
  }

  /**
   * 根据类型获取Creeps，无论是否已孵化
   * @param type creep类型
   * @returns 仅包含某种类型的creep的集合
   */
  getCreepsByType(type: CreepType) {
    if (this.creeps.length > 0)
      return this.creeps.filter((c_creep) => c_creep.getType() === type);
    return [];
  }

  /**
   * 根据plan获取Creeps，无论是否已孵化
   * @param plan 计划名称
   * @returns 仅包含某种计划的creep的集合
   */

  getCreepsByPlan(plan: string) {
    if (this.creeps.length > 0)
      return this.creeps.filter(
        (c_creep) => c_creep.creep.memory.plan === plan
      );
    return [];
  }
}

/**
 * 根据creep名字生成Creep对象
 * @param name creep名字
 */
const creepFactory = (name: string) => {
  if (name.startsWith(CreepType.ABORIGINE))
    return new Aborigine(Game.creeps[name].id);
  else if (name.startsWith(CreepType.MINER))
    return new Miner(Game.creeps[name].id);
  return null;
};
