import type { ColumnMapping, EditableGrid, PlotSettings } from "../types/data";

export const DEFAULT_GRID: EditableGrid = {
  columns: ["Sample", "A", "B", "C", "D", "sA", "sB", "sC", "sD", "Color"],
  rows: [
    ["X1", "10", "20", "30", "40", "1", "1", "2", "2", "#d62728"],
    ["X2", "25", "25", "20", "30", "1", "1", "1", "1", "#1f77b4"],
    ["X3", "40", "15", "30", "15", "2", "1", "2", "1", "#2ca02c"],
    ["X4", "12", "38", "18", "32", "1", "2", "1", "2", "#9467bd"],
    ["X5", "28", "22", "35", "15", "1", "1", "2", "1", "#ff7f0e"],
  ],
};

export const EMPTY_MAPPING: ColumnMapping = {
  idColumn: null,
  componentColumns: [null, null, null, null],
  sigmaColumns: [null, null, null, null],
  colorColumn: null,
};

export const DEFAULT_SETTINGS: PlotSettings = {
  showUncertainty: false,
  extendCentralLines: false,
  extendUncertaintyLines: false,
  showLabels: false,
  showLegend: true,
  lineLength: 0.01,
  lineWidth: 1,
  lineAlpha: 1,
  legendPosition: "upper-right",
};

export const CITE_TEXT =
  "If you use this tool, please cite: Crnobrnja, K. (2026). Refractory Element Trends on the Two-Dimensional Four-Component Plot. Terra Nova. Contact me at kostacrn (at) gmail (dot) com/";

export const CITE_DOI_LABEL = "https://doi.org/10.1111/ter.70031";
