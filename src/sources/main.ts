/**
 * 提供Source相关的操作
 */

import { getAroundWalkablePositions } from "../tools/position";

/**
 * 返回一个矿点的矿点位数量
 * @param source 能量资源的位置
 * @returns 返回矿点位的数量
 */
export const getNumberOfSourceMiningLocation = (source: Source) => {
  //获取source位置及周围的格子
  const location = source.pos;
  const miningLocation = getAroundWalkablePositions(location);
  return miningLocation.length;
};
