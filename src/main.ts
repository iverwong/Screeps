import { errorMapper } from "./modules/errorMapper";

// 游戏入口函数
export const loop = errorMapper(() => {
  // 获取采矿机数量
  const creepsName = Object.keys(Game.creeps);
  if (creepsName.length <= 8) {
    Game.spawns["SpawnLocal"].spawnCreep(
      [WORK, CARRY, MOVE],
      "采矿机" + Game.time
    );
  }
  // 获取所有采矿机
  // creepsName.forEach((name) => {
  //   if (name.indexOf("采矿机") >= 0) {
  //     const sources = Game.creeps[name].room.find(FIND_SOURCES);
  //     if (Game.creeps[name].harvest(sources[0]) === ERR_NOT_IN_RANGE) {
  //       Game.creeps[name].moveTo(sources[0]);
  //     }
  //   }
  // });
});
