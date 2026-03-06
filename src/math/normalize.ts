import type { FourTuple } from "../types/data";
import { safePositive, safeSigma } from "./geometry";

export function normalizePercentWithSigma(
  values: FourTuple<number>,
  sigmas: FourTuple<number>,
): {
  pct: FourTuple<number>;
  pctSigma: FourTuple<number>;
} {
  const v = values.map((value) => safePositive(value)) as FourTuple<number>;
  const s = sigmas.map((value) => safeSigma(value)) as FourTuple<number>;

  const total = v.reduce((sum, value) => sum + value, 0);
  const pct = v.map((value) => (100 * value) / total) as FourTuple<number>;

  if (s.every((value) => value === 0)) {
    return {
      pct,
      pctSigma: [0, 0, 0, 0],
    };
  }

  const jacobian: number[][] = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => 0),
  );

  for (let i = 0; i < 4; i += 1) {
    for (let j = 0; j < 4; j += 1) {
      jacobian[i][j] =
        i === j
          ? (100 * (total - v[i])) / (total * total)
          : (-100 * v[i]) / (total * total);
    }
  }

  const pctSigma = jacobian.map((row) => {
    const variance = row.reduce(
      (sum, derivative, index) =>
        sum + derivative * derivative * s[index] * s[index],
      0,
    );
    return Math.sqrt(Math.max(variance, 0));
  }) as FourTuple<number>;

  return { pct, pctSigma };
}
