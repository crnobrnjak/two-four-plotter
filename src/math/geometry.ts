import type { Point, Segment } from "../types/plot";

export const EPSILON = Number.EPSILON;

export function safePositive(value: number, fallback = EPSILON): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return value;
}

export function safeSigma(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.abs(value);
}

export function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function pointDistanceSquared(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function midpoint(segment: Segment): Point {
  return {
    x: (segment.p1.x + segment.p2.x) / 2,
    y: (segment.p1.y + segment.p2.y) / 2,
  };
}

export function halfVector(segment: Segment): { dx: number; dy: number } {
  return {
    dx: (segment.p2.x - segment.p1.x) / 2,
    dy: (segment.p2.y - segment.p1.y) / 2,
  };
}

export function extendLineAcrossUnitSquare(
  x: number,
  y: number,
  dx: number,
  dy: number,
): Segment {
  if (Math.abs(dx) < EPSILON) {
    return {
      p1: { x, y: 0 },
      p2: { x, y: 1 },
    };
  }

  const slope = dy / dx;
  const intercept = y - slope * x;

  return {
    p1: { x: 0, y: intercept },
    p2: { x: 1, y: slope + intercept },
  };
}
