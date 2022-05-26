import { errorMapper } from "./modules/errorMapper";
import TargetManager from "./target/main";
import { HoldAborigine } from "./target/holdCreep";

// 游戏入口函数
export const loop = errorMapper(() => {
  const targetManager = new TargetManager(Game.rooms["sim"]);
  const source1 = Game.getObjectById("1b3efea1bed13e03b3a296b3") as Source;
  const source2 = Game.getObjectById("c7b75c33d68dcd9dfd862643") as Source;
  const spawn = Game.spawns["Spawn1"];
  targetManager.add(new HoldAborigine(8, source1, spawn));
  targetManager.add(new HoldAborigine(14, source2, spawn));
  targetManager.go();
  targetManager.creepManager.doWork();
});
