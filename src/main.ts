import { errorMapper } from "./modules/errorMapper";
import TargetManager from "./target/main";
import { HoldAborigine } from "./target/holdCreep";
import { PassiveRenew } from "./target/renewCreep";
import GlobalContext from "./global/context";

// 游戏入口函数
export const loop = errorMapper(() => {
  const globalContext = new GlobalContext();

  // 房间E13S46
  const targetManager = new TargetManager(Game.rooms["E13S46"]);

  // 记录矿点
  const topRightSource = Game.getObjectById(
    "5bbcadb69099fc012e637ae2"
  ) as Source;
  const downSource = Game.getObjectById("5bbcadb69099fc012e637ae4") as Source;

  // 记录房间内spawn
  const spawn = Game.spawns["BaseSpawn"];

  // 目标管理器
  targetManager.add(new HoldAborigine("ab1", spawn, 5, topRightSource));
  targetManager.add(new HoldAborigine("ab2", spawn, 5, downSource));
  targetManager.add(
    new PassiveRenew("renew", [spawn], undefined, undefined, 12)
  );
  targetManager.go();
});
