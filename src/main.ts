import { errorMapper } from "./modules/errorMapper";
import TargetManager from "./target/main";
import { HoldAborigine } from "./target/holdCreep";
import { PassiveRenew } from "./target/renewCreep";

// 游戏入口函数
export const loop = errorMapper(() => {
  const targetManager = new TargetManager(Game.rooms["sim"]);
  const source1 = Game.getObjectById("8af99f697f97169772815495") as Source;
  const source2 = Game.getObjectById("e4e2f4b607ce527f2fd12d49") as Source;
  const spawn = Game.spawns["Spawn1"];
  targetManager.add(new HoldAborigine("plan1", spawn, 3, source1));
  targetManager.add(new HoldAborigine("plan2", spawn, 3, source2));
  // 增加自动更新
  targetManager.add(new PassiveRenew("renew"));
  targetManager.go();
});
