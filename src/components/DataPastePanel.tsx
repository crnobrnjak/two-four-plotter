import type { ParsedTable } from '../types/data';

interface DataPastePanelProps {
  text: string;
  onTextChange: (value: string) => void;
  onParse: () => void;
  parseError: string | null;
  table: ParsedTable | null;
}

export function DataPastePanel({
  text,
  onTextChange,
  onParse,
  parseError,
  table,
}: DataPastePanelProps) {
  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <h2>1. Paste table</h2>
        <button type="button" onClick={onParse}>
          Parse table
        </button>
      </div>

      <p className="panel-hint">
        Paste directly from Excel, LibreOffice, Google Sheets, or any TSV/CSV
        table.
      </p>

      <textarea
        className="data-paste-area"
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        spellCheck={false}
      />

      {parseError ? <p className="status status--error">{parseError}</p> : null}

      {table ? (
        <p className="status status--ok">
          Parsed {table.rows.length} row(s) and {table.columns.length} column(s).
        </p>
      ) : null}
    </section>
  );
}