/**
 * 提供getObjectById的string支持
 */
interface Game {
  getObjectById(id: string): any;
}

/**
 * 提供CreepMemory的接口支持
 */
interface CreepMemory {
  /**
   * 土著的相关信息
   */
  aborigine?: {
    /**
     * 目标矿点的id
     */
    targetSource: string;
    /**
     * 孵化和存放能量资源的Spawn的id
     */
    spawn: string;
    /**
     * 当前状态机的状态编号，通过土著状态机编号，反向映射到状态机枚举
     */
    state: number;
  };
}
