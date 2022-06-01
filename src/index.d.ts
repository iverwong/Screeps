/**
 * 提供getObjectById的string支持
 */
interface Game {
  getObjectById(id: string): any;
}

/**
 * 提供RoomMemory的接口支持
 */
interface RoomMemory {
  tasks: string[];
}

/**
 * 提供CreepMemory的接口支持
 */
interface CreepMemory {
  /**
   * 记录Creep由哪个维持任务生成，该维持任务的计划名称，孵化时传入
   */
  plan: string;

  /**
   * 土著的相关信息
   */
  aborigine?: {
    /**
     * 目标矿点的id
     */
    targetSource: string;
    /**
     * 当前状态机的状态编号，通过土著状态机编号，反向映射到状态机枚举
     */
    state: number;
  };

  /**
   * 矿工的相关信息
   */
  miner?: {
    /**
     * 目标矿点的id
     */
    targetSource: string;
    /**
     * 工作位置X
     */
    positionX: number;
    /**
     * 工作位置Y
     */
    positionY: number;
    /**
     * 工作位置的房间名称
     */
    positionRoom: string;
    /**
     * 当前状态机的状态编号，通过矿工状态机编号，反向映射到状态机枚举
     */
    state: number;
  };
  /**
   * 搬运的相关信息
   */
  carrier?: {
    /**
     * 能源供给侧id
     */
    input: string;
    /**
     * 能源消耗侧id
     */
    output: string;
    /**
     * 当前状态机的状态编号，通过矿工状态机编号，反向映射到状态机枚举
     */
    state: number;
    /**
     * 是否存在需要填充的目标
     */
    fillTarget?: string;
  };
  /**
   * 升级的相关信息
   */
  upgrader?: {
    /**
     * 能量获取点的id
     */
    input: string;
    /**
     * 工作位置X
     */
    positionX: number;
    /**
     * 工作位置Y
     */
    positionY: number;
    /**
     * 工作位置的房间名称
     */
    positionRoom: string;
    /**
     * 当前状态机的状态编号，通过矿工状态机编号，反向映射到状态机枚举
     */
    state: number;
  };
  builder?: {
    /**
     * 能量获取点的id
     */
    input: string;
    /**
     * 任务目标对象id
     */
    task: string;
    /**
     * 当前状态机的状态编号，通过矿工状态机编号，反向映射到状态机枚举
     */
    state: number;
  };
}
