import { errorMapper } from "./modules/errorMapper";
import TargetManager from "./target/main";
import { HoldAborigine } from "./target/holdCreep";

// 游戏入口函数
export const loop = errorMapper(() => {
  const targetManager = new TargetManager(Game.rooms["sim"]);
  const source1 = Game.getObjectById("bcf98a511a6bef1d3287c8e0") as Source;
  const source2 = Game.getObjectById("6225e7377a97a74898093919") as Source;
  const spawn = Game.spawns["Spawn1"];
  targetManager.add(new HoldAborigine("plan1", spawn, 1, source1));
  targetManager.add(new HoldAborigine("plan2", spawn, 1, source2));
  targetManager.go();
  targetManager.creepManager.doWork();
});
