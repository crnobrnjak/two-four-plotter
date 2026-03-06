import { resolveSeriesColor } from "../lib/colors";
import { validateMapping } from "../lib/validateData";
import {
  extendLineAcrossUnitSquare,
  halfVector,
  midpoint,
  safePositive,
  safeSigma,
} from "../math/geometry";
import { normalizePercentWithSigma } from "../math/normalize";
import { computeCentralGeometry } from "../math/plotTransform";
import { computeUncertaintyGeometry } from "../math/uncertainty";
import type {
  ColorFilters,
  ColumnMapping,
  FourTuple,
  ParsedTable,
  PlotSettings,
} from "../types/data";
import type {
  DerivedPlot,
  LegendEntry,
  PlotDatum,
  Segment,
} from "../types/plot";

interface DerivePlotInput {
  table: ParsedTable | null;
  mapping: ColumnMapping;
  settings: PlotSettings;
  colorFilters: ColorFilters;
  excludedIds: Set<string>;
}

function parseNumeric(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function makeEmptyPlot(
  cornerLabels: FourTuple<string>,
  warnings: string[] = [],
): DerivedPlot {
  return {
    data: [],
    centralExtensions: [],
    uncertaintyExtensions: [],
    legendEntries: [],
    cornerLabels,
    warnings,
  };
}

export function derivePlot(input: DerivePlotInput): DerivedPlot {
  const { table, mapping, settings, colorFilters, excludedIds } = input;

  const cornerLabels = mapping.componentColumns.map(
    (column, index) => column ?? `Comp ${index + 1}`,
  ) as FourTuple<string>;

  if (!table) {
    return makeEmptyPlot(cornerLabels, ["Paste data and click “Parse table”."]);
  }

  const mappingErrors = validateMapping(mapping);
  if (mappingErrors.length > 0) {
    return makeEmptyPlot(cornerLabels, mappingErrors);
  }

  const componentColumns = mapping.componentColumns as FourTuple<string>;
  const sigmaColumns = settings.showUncertainty
    ? (mapping.sigmaColumns as FourTuple<string | null>)
    : [null, null, null, null];

  const data: PlotDatum[] = [];
  const centralExtensions: Segment[] = [];
  const uncertaintyExtensions: Segment[] = [];
  const warnings: string[] = [];

  let replacedComponentCount = 0;
  let replacedSigmaCount = 0;

  table.rows.forEach((row, index) => {
    const id =
      String(row[mapping.idColumn as string] ?? `Row ${index + 1}`).trim() ||
      `Row ${index + 1}`;

    if (excludedIds.has(id)) {
      return;
    }

    const rawColorValue = mapping.colorColumn
      ? (row[mapping.colorColumn] ?? "")
      : "";

    if (
      mapping.colorColumn &&
      rawColorValue &&
      colorFilters.included[rawColorValue] === false
    ) {
      return;
    }

    const componentValues = componentColumns.map((column) => {
      const parsed = parseNumeric(row[column]);
      if (!Number.isFinite(parsed) || parsed === 0) {
        replacedComponentCount += 1;
      }
      return safePositive(parsed);
    }) as FourTuple<number>;

    const sigmaValues = sigmaColumns.map((column) => {
      if (!column) {
        return 0;
      }
      const parsed = parseNumeric(row[column]);
      if (!Number.isFinite(parsed)) {
        replacedSigmaCount += 1;
      }
      return safeSigma(parsed);
    }) as FourTuple<number>;

    const { pct, pctSigma } = normalizePercentWithSigma(
      componentValues,
      sigmaValues,
    );

    const central = computeCentralGeometry(
      componentValues,
      settings.lineLength,
    );

    const uncertainty = settings.showUncertainty
      ? computeUncertaintyGeometry(
          componentValues,
          sigmaValues,
          settings.lineLength,
        )
      : { hull: [], boundarySegments: [] };

    const color = resolveSeriesColor(rawColorValue || null, index);

    data.push({
      id,
      rawRow: row,
      x: central.x,
      y: central.y,
      dx: central.dx,
      dy: central.dy,
      centralSegment: central.segment,
      uncertaintyHull: uncertainty.hull,
      uncertaintyBoundarySegments: uncertainty.boundarySegments,
      color,
      rawColorValue: rawColorValue || null,
      label: id,
      componentValues,
      sigmaValues,
      pct,
      pctSigma,
    });

    if (settings.extendCentralLines) {
      centralExtensions.push(
        extendLineAcrossUnitSquare(
          central.x,
          central.y,
          central.dx,
          central.dy,
        ),
      );
    }

    if (settings.extendUncertaintyLines) {
      uncertainty.boundarySegments.forEach((segment) => {
        const center = midpoint(segment);
        const vector = halfVector(segment);
        uncertaintyExtensions.push(
          extendLineAcrossUnitSquare(center.x, center.y, vector.dx, vector.dy),
        );
      });
    }
  });

  if (replacedComponentCount > 0) {
    warnings.push(
      `Replaced ${replacedComponentCount} invalid or zero component value(s) with ε.`,
    );
  }

  if (replacedSigmaCount > 0) {
    warnings.push(
      `Replaced ${replacedSigmaCount} invalid uncertainty value(s) with 0.`,
    );
  }

  if (data.length === 0) {
    warnings.push("No plottable rows remain after filters and exclusions.");
  }

  const legendEntries: LegendEntry[] = [];
  const seenLegendKeys = new Set<string>();

  if (settings.showLegend && mapping.colorColumn) {
    data.forEach((datum) => {
      const key = datum.rawColorValue ?? "default";
      if (seenLegendKeys.has(key)) {
        return;
      }
      seenLegendKeys.add(key);

      legendEntries.push({
        key,
        label: colorFilters.labels[key]?.trim() || key,
        color: datum.color,
      });
    });
  }

  return {
    data,
    centralExtensions,
    uncertaintyExtensions,
    legendEntries,
    cornerLabels,
    warnings,
  };
}
