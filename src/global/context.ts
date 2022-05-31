export default class GlobalContext {
  constructor() {
    // 全局清理内存
    for (const name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
      }
    }
  }
}
