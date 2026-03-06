export type FourTuple<T> = [T, T, T, T];

export interface ParsedTable {
  rawText: string;
  delimiter: string;
  columns: string[];
  rows: Array<Record<string, string>>;
  previewRows: Array<Record<string, string>>;
}

export interface EditableGrid {
  columns: string[];
  rows: string[][];
}

export interface ColumnMapping {
  idColumn: string | null;
  componentColumns: FourTuple<string | null>;
  sigmaColumns: FourTuple<string | null>;
  colorColumn: string | null;
}

export type LegendPosition =
  | "upper-right"
  | "upper-left"
  | "lower-left"
  | "lower-right";

export interface PlotSettings {
  showUncertainty: boolean;
  extendCentralLines: boolean;
  extendUncertaintyLines: boolean;
  showLabels: boolean;
  showLegend: boolean;
  lineLength: number;
  lineWidth: number;
  lineAlpha: number;
  legendPosition: LegendPosition;
}

export interface ColorFilters {
  included: Record<string, boolean>;
  labels: Record<string, string>;
}
