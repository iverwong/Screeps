/**
 * 矿工，负责挖矿，矿产将储存在脚下的Container中，由搬运负责运输
 */

import { C_Creep, CreepType, CreepState } from "./types";

export default class Miner extends C_Creep {
  /**
   * 矿点id
   */
  source: string;

  constructor(id: string, source: string) {
    super(id);
    this.source = source;
  }

  changeState(): CreepState {
    const creep = this.creep;
    const source = Game.getObjectById(
      this.creep.memory.miner.targetSource
    ) as Source;
    const freeSource = source.energy;

    switch (this.state.getEnum()) {
      case MinerStateEnum.MINE:
        /**
         * 挖矿状态
         *
         * 当矿被挖空或自身生命不足时，检查是否已完成Renew，如已完成，则切换回Mine，否则切换到Renew
         * 为防止在路途中低于1200，且此时矿产仍未更新，导致重新，因此将阈值设为1000，即空闲更新只到1000为止
         */
        if (freeSource === 0 || creep.ticksToLive < 200) {
          if (creep.ticksToLive >= 1000) return this.state;
          return new Miner_RenewState(this);
        }
        return this.state;
      case MinerStateEnum.RENEW:
        /**
         * 更新状态
         *
         * 当自身生命被更新至1200时，切换到挖矿状态
         */
        if (creep.ticksToLive >= 1200) {
          return new Miner_MineState(this);
        }
        return this.state;
    }
  }
  getCreepTypeState(): CreepState {
    const creep = this.creep;
    switch (creep.memory.miner.state) {
      case MinerStateEnum.MINE:
        return new Miner_MineState(this);
      case MinerStateEnum.RENEW:
        return new Miner_RenewState(this);
    }
  }
  getType(): CreepType {
    return CreepType.MINER;
  }
}

export enum MinerStateEnum {
  MINE,
  RENEW,
}

class Miner_MineState extends CreepState {
  /**
   * 挖矿状态
   *
   * 对指定矿点进行挖矿操作
   *
   * @param c_creep C_Creep对象
   */
  constructor(c_creep: C_Creep) {
    super(c_creep);
  }

  doWork(): void {
    const creep = this.c_creep.creep;
    const source = Game.getObjectById(
      creep.memory.miner.targetSource
    ) as Source;
    const position = new RoomPosition(
      creep.memory.miner.positionX,
      creep.memory.miner.positionY,
      creep.memory.miner.positionRoom
    );

    if (!creep.pos.isEqualTo(position)) {
      creep.moveTo(position);
    } else {
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        throw new Error("指定位置有误，无法采集到");
      }
    }
  }
  getEnum(): number {
    return MinerStateEnum.MINE;
  }
}

class Miner_RenewState extends CreepState {
  /**
   * 更新状态
   *
   * 返回最近的Spawn进行更新
   *
   * @param c_creep C_Creep对象
   */
  constructor(c_creep: C_Creep) {
    super(c_creep);
  }

  doWork(): void {
    const creep = this.c_creep.creep;
    const spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
    if (spawn.renewCreep(creep) === ERR_NOT_IN_RANGE) creep.moveTo(spawn);
  }
  getEnum(): number {
    return MinerStateEnum.RENEW;
  }
}
