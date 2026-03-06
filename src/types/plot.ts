import type { FourTuple } from "./data";

export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  p1: Point;
  p2: Point;
}

export interface LegendEntry {
  key: string;
  label: string;
  color: string;
}

export interface PlotDatum {
  id: string;
  rawRow: Record<string, string>;
  x: number;
  y: number;
  dx: number;
  dy: number;
  centralSegment: Segment;
  uncertaintyHull: Point[];
  uncertaintyBoundarySegments: Segment[];
  color: string;
  rawColorValue: string | null;
  label: string;
  componentValues: FourTuple<number>;
  sigmaValues: FourTuple<number>;
  pct: FourTuple<number>;
  pctSigma: FourTuple<number>;
}

export interface DerivedPlot {
  data: PlotDatum[];
  centralExtensions: Segment[];
  uncertaintyExtensions: Segment[];
  legendEntries: LegendEntry[];
  cornerLabels: FourTuple<string>;
  warnings: string[];
}

export interface InspectorData {
  id: string;
  componentNames: FourTuple<string>;
  componentValues: FourTuple<number>;
  sigmaValues: FourTuple<number>;
  pct: FourTuple<number>;
  pctSigma: FourTuple<number>;
  excluded: boolean;
}
