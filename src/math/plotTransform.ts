import type { FourTuple } from "../types/data";
import type { Segment } from "../types/plot";
import { finiteOr, safePositive } from "./geometry";

export interface CentralGeometry {
  x: number;
  y: number;
  dx: number;
  dy: number;
  segment: Segment;
}

export function computeCentralGeometry(
  values: FourTuple<number>,
  lineLength: number,
): CentralGeometry {
  const [A, B, C, D] = values.map((value) =>
    safePositive(value),
  ) as FourTuple<number>;

  const ratioBAB = B / (A + B);
  const ratioDCD = D / (C + D);
  const delta = ratioDCD - ratioBAB;

  const y = finiteOr((A + B) / (A + B + C + D), 0.5);
  const x = finiteOr(ratioBAB + delta * (1 - y), 0.5);

  const unitLength = Math.sqrt((lineLength * lineLength) / (1 + delta * delta));
  const dx = unitLength * -delta;
  const dy = unitLength;

  return {
    x,
    y,
    dx,
    dy,
    segment: {
      p1: { x: x - dx, y: y - dy },
      p2: { x: x + dx, y: y + dy },
    },
  };
}
