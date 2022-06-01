export default class GlobalContext {
  /**
   * 包含孵化器的房间
   */
  static spawnRooms: Room[];

  /**
   * 所有tower对象的集合
   */
  static towers: {
    [roomName: string]: StructureTower[];
  };

  constructor() {
    // 全局清理内存
    for (const name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
      }
    }

    // TODO 从全局的plan中找到已被删除的plan，然后将这些creep放入outofplan中
  }

  static getSpawnRooms(): Room[] {
    if (!GlobalContext.spawnRooms) {
      GlobalContext.spawnRooms = [];
      Object.values(Game.rooms).forEach((room) => {
        GlobalContext.spawnRooms.push(room);
      });
    }
    return GlobalContext.spawnRooms;
  }

  static getTowers(room: Room): StructureTower[] {
    if (!GlobalContext.towers) {
      GlobalContext.towers = {};
      const spawnRooms = GlobalContext.getSpawnRooms();
      spawnRooms.forEach((eachRoom) => {
        const eachTowers = eachRoom.find(FIND_MY_STRUCTURES, {
          filter: (structure) => structure.structureType === STRUCTURE_TOWER,
        }) as StructureTower[];
        GlobalContext.towers[eachRoom.name] = eachTowers;
      });
    }
    return GlobalContext.towers[room.name];
  }
}
