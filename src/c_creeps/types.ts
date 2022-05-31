/**
 * 定义枚举、抽象类、接口等
 */

/**
 * C_Creep类的类型
 *
 */
export enum CreepType {
  ABORIGINE = "aborigine",
  MINER = "miner",
}

/**
 * Creep类型的抽象类
 */
export abstract class C_Creep {
  /**
   * 该creep的id，由该类的构造器传入参数获得
   */
  id: string;
  /**
   * 该creep的Creep对象，根据id找到对应的creep对象
   */
  creep: Creep;
  /**
   * 用于标识该creep当前的状态机,初始化时从内存中获取
   */
  state: CreepState;

  /**
   * C_Creep类型的构造函数，初始化id和creep对象
   * @param id creep id
   */
  constructor(id: string) {
    this.id = id;
    this.creep = Game.getObjectById(id) as Creep;
    this.state = this.getCreepTypeState();
  }
  /**
   * doWork方法，将首先判断当前状态是否需要更新，然后根据状态和工作内容自动寻找工作并执行工作
   */
  doWork() {
    this.state = this.changeState() || this.state;
    this.creep.memory[this.getType()].state = this.state.getEnum();
    this.state.doWork();
  }

  /**
   * 根据当前状态和情况，对状态机进行切换
   */
  abstract changeState(): CreepState;
  /**
   * 获取从内存中获取该creep的状态，并返回对应的状态机类
   */
  abstract getCreepTypeState(): CreepState;
  /**
   * 直接返回creep类型
   */
  abstract getType(): CreepType;
}

export abstract class CreepState {
  c_creep: C_Creep;
  /**
   * Creep状态机抽象类
   * @param c_creep C_Creep对象
   */
  constructor(c_creep: C_Creep) {
    this.c_creep = c_creep;
  }

  /**
   * 执行在当前状态下的doWork操作
   */
  abstract doWork(): void;

  /**
   * 直接返回该状态的Enum值
   */
  abstract getEnum(): number;
}
