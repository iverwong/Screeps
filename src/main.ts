import { errorMapper } from "./modules/errorMapper";
import TargetManager from "./target/main";
import {
  HoldAborigine,
  HoldBuilder,
  HoldCarrier,
  HoldMiner,
  HoldUpgrader,
} from "./target/holdCreep";
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

  // 工人维持
  targetManager
    .add(
      new HoldMiner(
        "mi1",
        spawn,
        1,
        topRightSource,
        new RoomPosition(34, 17, "E13S46"),
        3,
        6
      )
    )
    .add(
      new HoldMiner(
        "mi2",
        spawn,
        1,
        downSource,
        new RoomPosition(22, 36, "E13S46"),
        3,
        6
      )
    )
    .add(
      new HoldCarrier(
        "ca1",
        spawn,
        1,
        "62957b298e48e0be8991fdfb",
        "6295e6770ee6fc521ea5a552"
      )
    )
    .add(
      new HoldCarrier(
        "ca2",
        spawn,
        1,
        "62957b31f07f19994a2f6b14",
        "6295e6770ee6fc521ea5a552"
      )
    )
    .add(
      new HoldUpgrader(
        "up1",
        spawn,
        1,
        "6295e6770ee6fc521ea5a552",
        new RoomPosition(28, 26, "E13S46")
      )
    )
    .add(
      new HoldUpgrader(
        "up2",
        spawn,
        1,
        "6295e6770ee6fc521ea5a552",
        new RoomPosition(27, 26, "E13S46")
      )
    )
    .add(
      new HoldUpgrader(
        "up3",
        spawn,
        1,
        "6295e6770ee6fc521ea5a552",
        new RoomPosition(28, 25, "E13S46")
      )
    )
    .add(new HoldBuilder("bu1", spawn, 4, "6295e6770ee6fc521ea5a552"));
  // Creep被动召回更新
  targetManager.add(new PassiveRenew("renew", [spawn]));
  targetManager.go();
});
