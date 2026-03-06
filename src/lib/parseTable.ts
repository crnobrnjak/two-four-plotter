import type { ParsedTable } from "../types/data";

function detectDelimiter(line: string): string {
  const candidates = ["\t", ",", ";"];
  let best = "\t";
  let bestCount = -1;

  for (const candidate of candidates) {
    const count = line.split(candidate).length - 1;
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }

  return bestCount > 0 ? best : "\t";
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const output: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      output.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  output.push(current.trim());
  return output;
}

function makeHeadersUnique(headers: string[]): string[] {
  const seen = new Map<string, number>();

  return headers.map((header, index) => {
    const base = header.trim() || `Column ${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

export function parseTableText(rawText: string): {
  table: ParsedTable | null;
  error: string | null;
} {
  const normalized = rawText.replace(/\r\n?/g, "\n").trim();

  if (!normalized) {
    return { table: null, error: "Paste a tabular block first." };
  }

  const lines = normalized
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      table: null,
      error: "Need at least one header row and one data row.",
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const parsedLines = lines.map((line) => splitDelimitedLine(line, delimiter));
  const widestRow = Math.max(...parsedLines.map((row) => row.length));

  const rawHeaders = [...parsedLines[0]];
  while (rawHeaders.length < widestRow) {
    rawHeaders.push(`Column ${rawHeaders.length + 1}`);
  }

  const headers = makeHeadersUnique(rawHeaders);

  const rows = parsedLines.slice(1).map((rawRow) => {
    const padded = [...rawRow];
    while (padded.length < headers.length) {
      padded.push("");
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = padded[index] ?? "";
    });
    return row;
  });

  return {
    table: {
      rawText,
      delimiter,
      columns: headers,
      rows,
      previewRows: rows.slice(0, 8),
    },
    error: null,
  };
}
