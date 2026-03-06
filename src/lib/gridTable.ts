import type { EditableGrid, ParsedTable } from "../types/data";

function makeHeadersUnique(headers: string[]): string[] {
  const seen = new Map<string, number>();

  return headers.map((header, index) => {
    const base = header.trim() || `Column ${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

export function editableGridToParsedTable(grid: EditableGrid): ParsedTable {
  const columns = makeHeadersUnique(
    grid.columns.length > 0 ? grid.columns : ["Column 1"],
  );

  const normalizedRows = grid.rows
    .map((row) => {
      const padded = [...row];
      while (padded.length < columns.length) {
        padded.push("");
      }
      return padded.slice(0, columns.length);
    })
    .filter((row) => row.some((cell) => cell.trim().length > 0));

  const rows = normalizedRows.map((row) => {
    const record: Record<string, string> = {};
    columns.forEach((column, index) => {
      record[column] = row[index] ?? "";
    });
    return record;
  });

  const rawText = [
    columns.join("\t"),
    ...normalizedRows.map((row) => row.join("\t")),
  ].join("\n");

  return {
    rawText,
    delimiter: "\t",
    columns,
    rows,
    previewRows: rows.slice(0, 8),
  };
}
