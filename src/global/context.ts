export default class GlobalContext {
  constructor() {
    // 全局清理内存
    for (const name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
      }
    }

    // TODO 从全局的plan中找到已被删除的plan，然后将这些creep放入outofplan中
  }
}
