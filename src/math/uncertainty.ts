import type { FourTuple } from "../types/data";
import type { Point, Segment } from "../types/plot";
import { convexHull } from "./convexHull";
import { pointDistanceSquared, safePositive, safeSigma } from "./geometry";
import { computeCentralGeometry } from "./plotTransform";

const SIGN_COMBINATIONS: FourTuple<number>[] = [
  [-1, -1, -1, -1],
  [-1, -1, -1, 1],
  [-1, -1, 1, -1],
  [-1, -1, 1, 1],
  [-1, 1, -1, -1],
  [-1, 1, -1, 1],
  [-1, 1, 1, -1],
  [-1, 1, 1, 1],
  [1, -1, -1, -1],
  [1, -1, -1, 1],
  [1, -1, 1, -1],
  [1, -1, 1, 1],
  [1, 1, -1, -1],
  [1, 1, -1, 1],
  [1, 1, 1, -1],
  [1, 1, 1, 1],
];

export function computeUncertaintyGeometry(
  values: FourTuple<number>,
  sigmas: FourTuple<number>,
  lineLength: number,
): { hull: Point[]; boundarySegments: Segment[] } {
  const cleanValues = values.map((value) =>
    safePositive(value),
  ) as FourTuple<number>;
  const cleanSigmas = sigmas.map((value) =>
    safeSigma(value),
  ) as FourTuple<number>;

  if (cleanSigmas.every((value) => value === 0)) {
    return { hull: [], boundarySegments: [] };
  }

  const allSegments: Segment[] = [];
  const allEndpoints: Point[] = [];

  for (const signs of SIGN_COMBINATIONS) {
    const variedValues = cleanValues.map((value, index) =>
      safePositive(value + signs[index] * cleanSigmas[index]),
    ) as FourTuple<number>;

    const geometry = computeCentralGeometry(variedValues, lineLength);
    allSegments.push(geometry.segment);
    allEndpoints.push(geometry.segment.p1, geometry.segment.p2);
  }

  const hull = convexHull(allEndpoints);

  if (hull.length < 3) {
    return { hull, boundarySegments: allSegments };
  }

  const comboIndexes = new Set<number>();

  hull.forEach((vertex) => {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    allEndpoints.forEach((endpoint, endpointIndex) => {
      const distance = pointDistanceSquared(vertex, endpoint);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = endpointIndex;
      }
    });

    comboIndexes.add(Math.floor(nearestIndex / 2));
  });

  const boundarySegments = Array.from(comboIndexes)
    .sort((a, b) => a - b)
    .map((index) => allSegments[index]);

  return { hull, boundarySegments };
}
