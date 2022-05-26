/**
 * 矿工，负责挖矿，矿产将储存在脚下的Container中，由搬运负责运输
 */

import { C_Creep, CreepType, CreepState } from "./types";

export default class Miner extends C_Creep {
  getCreepTypeState(): CreepState {
    throw new Error("Method not implemented.");
  }
  getType(): CreepType {
    throw new Error("Method not implemented.");
  }
  state: CreepState;
  changeState(): CreepState {
    throw new Error("Method not implemented.");
  }
  id: string;
  type: CreepType = CreepType.MINER;
  doWork: () => void = () => {};

  constructor(id: string) {
    super(id);
    this.id = id;
  }
}
