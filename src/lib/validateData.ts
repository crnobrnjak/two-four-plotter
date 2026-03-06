import type { ColorFilters, ColumnMapping, ParsedTable } from "../types/data";
import { EMPTY_MAPPING } from "../state/appState";

function findColumn(columns: string[], patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = columns.find((column) => pattern.test(column));
    if (match) {
      return match;
    }
  }
  return null;
}

export function guessColumnMapping(columns: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    ...EMPTY_MAPPING,
    componentColumns: [...EMPTY_MAPPING.componentColumns],
    sigmaColumns: [...EMPTY_MAPPING.sigmaColumns],
  };

  mapping.idColumn =
    findColumn(columns, [
      /^sample$/i,
      /^name$/i,
      /sample/i,
      /name/i,
      /^id$/i,
    ]) ??
    columns[0] ??
    null;

  const componentCandidates: Array<string | null> = [
    findColumn(columns, [/^A$/i, /^Comp\s*A$/i, /^Component\s*A$/i]),
    findColumn(columns, [/^B$/i, /^Comp\s*B$/i, /^Component\s*B$/i]),
    findColumn(columns, [/^C$/i, /^Comp\s*C$/i, /^Component\s*C$/i]),
    findColumn(columns, [/^D$/i, /^Comp\s*D$/i, /^Component\s*D$/i]),
  ];

  const reserved = new Set<string>(mapping.idColumn ? [mapping.idColumn] : []);
  const sigmaLike = columns.filter((column) =>
    /sigma|uncert|^s[a-d]$/i.test(column),
  );
  sigmaLike.forEach((column) => reserved.add(column));

  const fallbackComponents = columns.filter(
    (column) => !reserved.has(column) && !/color/i.test(column),
  );

  mapping.componentColumns = componentCandidates.map(
    (candidate, index) => candidate ?? fallbackComponents[index] ?? null,
  ) as ColumnMapping["componentColumns"];

  const componentNames = ["A", "B", "C", "D"];

  mapping.sigmaColumns = componentNames.map((name, index) => {
    const selectedComponent = mapping.componentColumns[index];
    return (
      findColumn(columns, [
        new RegExp(`^s${name}$`, "i"),
        new RegExp(`^sigma[_\\s-]*${name}$`, "i"),
        new RegExp(`^${name}[_\\s-]*sigma$`, "i"),
        new RegExp(`^${name}[_\\s-]*uncert`, "i"),
        ...(selectedComponent
          ? [
              new RegExp(`^sigma[_\\s-]*${selectedComponent}$`, "i"),
              new RegExp(`^${selectedComponent}[_\\s-]*sigma$`, "i"),
              new RegExp(`^${selectedComponent}[_\\s-]*uncert`, "i"),
            ]
          : []),
      ]) ?? null
    );
  }) as ColumnMapping["sigmaColumns"];

  mapping.colorColumn = findColumn(columns, [/^color$/i, /colour/i, /color/i]);

  return mapping;
}

export function validateMapping(mapping: ColumnMapping): string[] {
  const errors: string[] = [];

  if (!mapping.idColumn) {
    errors.push("Choose an ID column.");
  }

  if (mapping.componentColumns.some((column) => !column)) {
    errors.push("Choose all four component columns.");
  }

  const components = mapping.componentColumns.filter(Boolean);
  if (new Set(components).size !== components.length) {
    errors.push("The four component columns must be different.");
  }

  return errors;
}

export function parseExcludedIds(text: string): Set<string> {
  const values = text
    .split(/\n|,/g)
    .map((value) => value.trim())
    .filter(Boolean);

  return new Set(values);
}

export function getUniqueColorValues(
  table: ParsedTable | null,
  colorColumn: string | null,
): string[] {
  if (!table || !colorColumn) {
    return [];
  }

  return Array.from(
    new Set(
      table.rows
        .map((row) => row[colorColumn] ?? "")
        .filter((value) => value.trim().length > 0),
    ),
  );
}

export function syncColorFilters(
  existing: ColorFilters,
  values: string[],
): ColorFilters {
  const included: Record<string, boolean> = {};
  const labels: Record<string, string> = {};

  values.forEach((value) => {
    included[value] = existing.included[value] ?? true;
    labels[value] = existing.labels[value] ?? "";
  });

  return { included, labels };
}
