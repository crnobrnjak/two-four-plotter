import type { ParsedTable } from '../types/data';

interface DataTablePanelProps {
  table: ParsedTable | null;
}

export function DataTablePanel({ table }: DataTablePanelProps) {
  return (
    <section className="panel-card table-panel">
      <div className="panel-card__header">
        <h2>Data table</h2>
        {table ? (
          <span>
            {table.rows.length} rows · {table.columns.length} columns
          </span>
        ) : null}
      </div>

      {!table ? (
        <p className="panel-hint">Parse a pasted table to see the data here.</p>
      ) : (
        <div className="data-table-wrap">
          <table className="preview-table">
            <thead>
              <tr>
                {table.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {table.rows.map((row, index) => (
                <tr key={`data-row-${index}`}>
                  {table.columns.map((column) => (
                    <td key={`${index}-${column}`}>{row[column]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}