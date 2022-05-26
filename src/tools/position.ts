/**
 * 位置相关的工具集合
 */

/**
 * 获取指定位置周围可以移动的位置
 * @param target 目标位置
 * @returns 包含周围8个位置的数组（非墙）
 */
export const getAroundWalkablePositions = (
  target: RoomPosition
): RoomPosition[] => {
  const { x, y } = target;
  const positions = [
    { x: x - 1, y: y - 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x - 1, y: y },
    { x: x + 1, y: y },
    { x: x - 1, y: y + 1 },
    { x: x, y: y + 1 },
    { x: x + 1, y: y + 1 },
  ];
  const terrain = Game.map.getRoomTerrain(target.roomName);
  const positionsResult: RoomPosition[] = [];

  positions.forEach((position) => {
    if (position.x < 0 || position.y < 0 || position.x > 49 || position.y > 49)
      return;
    if (terrain.get(position.x, position.y) == TERRAIN_MASK_WALL) return;
    positionsResult.push(RoomPosition(position.x, position.y, target.roomName));
  });
  return positionsResult;
};
