import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import type { EditableGrid } from '../types/data';

interface DataGridPanelProps {
  grid: EditableGrid;
  onChange: (grid: EditableGrid) => void;
}

interface CellPosition {
  row: number;
  col: number;
}

interface CellRange {
  start: CellPosition;
  end: CellPosition;
}

interface NormalizedRange {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

function parseClipboardBlock(text: string): string[][] {
  const normalized = text.replace(/\r\n?/g, '\n').replace(/\n$/, '');

  if (!normalized) {
    return [['']];
  }

  const hasTab = normalized.includes('\t');
  const lines = normalized.split('\n');

  if (!hasTab && lines.length === 1) {
    return [[normalized]];
  }

  return lines.map((line) => line.split('\t'));
}

function ensureGridShape(
  grid: EditableGrid,
  minRowCount: number,
  minColCount: number,
): EditableGrid {
  const columns = [...grid.columns];
  while (columns.length < minColCount) {
    columns.push(`Column ${columns.length + 1}`);
  }

  const rows = grid.rows.map((row) => {
    const next = [...row];
    while (next.length < columns.length) {
      next.push('');
    }
    return next;
  });

  while (rows.length < minRowCount) {
    rows.push(Array.from({ length: columns.length }, () => ''));
  }

  return { columns, rows };
}

function normalizeRange(range: CellRange | null): NormalizedRange | null {
  if (!range) {
    return null;
  }

  return {
    minRow: Math.min(range.start.row, range.end.row),
    maxRow: Math.max(range.start.row, range.end.row),
    minCol: Math.min(range.start.col, range.end.col),
    maxCol: Math.max(range.start.col, range.end.col),
  };
}

function isCellInRange(
  row: number,
  col: number,
  range: NormalizedRange | null,
): boolean {
  if (!range) {
    return false;
  }

  return (
    row >= range.minRow &&
    row <= range.maxRow &&
    col >= range.minCol &&
    col <= range.maxCol
  );
}

export function DataGridPanel({ grid, onChange }: DataGridPanelProps) {
  const [activeCell, setActiveCell] = useState<CellPosition | null>(null);
  const [selectionRange, setSelectionRange] = useState<CellRange | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const cellRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const normalizedSelection = normalizeRange(selectionRange);

  const focusCell = (row: number, col: number) => {
    const key = `${row}-${col}`;
    requestAnimationFrame(() => {
      const element = cellRefs.current[key];
      if (element) {
        element.focus();
        element.select();
      }
    });
  };

  const setCellRef = (
    row: number,
    col: number,
    element: HTMLInputElement | null,
  ) => {
    cellRefs.current[`${row}-${col}`] = element;
  };

  useEffect(() => {
    const stopDragging = () => setIsDragging(false);
    window.addEventListener('mouseup', stopDragging);
    return () => window.removeEventListener('mouseup', stopDragging);
  }, []);

  const updateHeader = (columnIndex: number, value: string) => {
    const nextColumns = [...grid.columns];
    nextColumns[columnIndex] = value;
    onChange({ ...grid, columns: nextColumns });
  };

  const updateCell = (rowIndex: number, columnIndex: number, value: string) => {
    const shaped = ensureGridShape(
      grid,
      rowIndex + 1,
      Math.max(grid.columns.length, columnIndex + 1),
    );

    const nextRows = shaped.rows.map((row) => [...row]);
    nextRows[rowIndex][columnIndex] = value;

    onChange({
      columns: shaped.columns,
      rows: nextRows,
    });
  };

  const addRow = () => {
    onChange({
      ...grid,
      rows: [...grid.rows, Array.from({ length: grid.columns.length }, () => '')],
    });
  };

  const addColumn = () => {
    const nextColumnName = `Column ${grid.columns.length + 1}`;
    onChange({
      columns: [...grid.columns, nextColumnName],
      rows: grid.rows.map((row) => [...row, '']),
    });
  };

  const deleteLastRow = () => {
    if (grid.rows.length <= 1) {
      return;
    }

    onChange({
      ...grid,
      rows: grid.rows.slice(0, -1),
    });
  };

  const deleteLastColumn = () => {
    if (grid.columns.length <= 1) {
      return;
    }

    onChange({
      columns: grid.columns.slice(0, -1),
      rows: grid.rows.map((row) => row.slice(0, -1)),
    });
  };

  const clearAllCells = () => {
    onChange({
      ...grid,
      rows: grid.rows.map(() =>
        Array.from({ length: grid.columns.length }, () => ''),
      ),
    });
    setSelectionRange(null);
    setActiveCell(null);
  };

  const clearSelectedCells = () => {
    const range = normalizedSelection;
    if (!range) {
      return;
    }

    const nextRows = grid.rows.map((row) => {
      const padded = [...row];
      while (padded.length < grid.columns.length) {
        padded.push('');
      }
      return padded;
    });

    for (let r = range.minRow; r <= range.maxRow; r += 1) {
      for (let c = range.minCol; c <= range.maxCol; c += 1) {
        if (nextRows[r]) {
          nextRows[r][c] = '';
        }
      }
    }

    onChange({
      ...grid,
      rows: nextRows,
    });
  };

  const handleCellMouseDown = (
    rowIndex: number,
    columnIndex: number,
    event: MouseEvent<HTMLTableCellElement>,
  ) => {
    event.preventDefault();

    const cell = { row: rowIndex, col: columnIndex };
    setActiveCell(cell);
    setSelectionRange({ start: cell, end: cell });
    setIsDragging(true);
    focusCell(rowIndex, columnIndex);
  };

  const handleCellMouseEnter = (rowIndex: number, columnIndex: number) => {
    if (!isDragging || !selectionRange) {
      return;
    }

    setSelectionRange({
      start: selectionRange.start,
      end: { row: rowIndex, col: columnIndex },
    });
  };

  const handlePaste = (
    rowIndex: number,
    columnIndex: number,
    event: ClipboardEvent<HTMLInputElement>,
  ) => {
    const text = event.clipboardData.getData('text/plain');
    const block = parseClipboardBlock(text);

    event.preventDefault();

    const selection = normalizeRange(selectionRange);
    const startRow = selection ? selection.minRow : rowIndex;
    const startCol = selection ? selection.minCol : columnIndex;

    const isSingleValue = block.length === 1 && block[0].length === 1;
    const hasMultiCellSelection =
      !!selection &&
      (selection.maxRow > selection.minRow || selection.maxCol > selection.minCol);

    if (selection && isSingleValue && hasMultiCellSelection) {
      const value = block[0][0] ?? '';
      const nextRows = grid.rows.map((row) => {
        const padded = [...row];
        while (padded.length < grid.columns.length) {
          padded.push('');
        }
        return padded;
      });

      for (let r = selection.minRow; r <= selection.maxRow; r += 1) {
        for (let c = selection.minCol; c <= selection.maxCol; c += 1) {
          nextRows[r][c] = value;
        }
      }

      onChange({
        ...grid,
        rows: nextRows,
      });

      return;
    }

    const requiredRows = startRow + block.length;
    const requiredCols = startCol + Math.max(...block.map((row) => row.length), 1);

    const shaped = ensureGridShape(grid, requiredRows, requiredCols);
    const nextRows = shaped.rows.map((row) => [...row]);

    block.forEach((pasteRow, r) => {
      pasteRow.forEach((value, c) => {
        nextRows[startRow + r][startCol + c] = value;
      });
    });

    onChange({
      columns: shaped.columns,
      rows: nextRows,
    });

    const lastRow = startRow + block.length - 1;
    const lastCol = startCol + Math.max(...block.map((row) => row.length), 1) - 1;

    setActiveCell({ row: lastRow, col: lastCol });
    setSelectionRange({
      start: { row: startRow, col: startCol },
      end: { row: lastRow, col: lastCol },
    });

    focusCell(lastRow, lastCol);
  };

  const handleKeyDown = (
    rowIndex: number,
    columnIndex: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    const lastRowIndex = grid.rows.length - 1;
    const lastColIndex = grid.columns.length - 1;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      setSelectionRange({
        start: { row: 0, col: 0 },
        end: { row: lastRowIndex, col: lastColIndex },
      });
      setActiveCell({ row: 0, col: 0 });
      focusCell(0, 0);
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      clearSelectedCells();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectionRange({
        start: { row: Math.max(0, rowIndex - 1), col: columnIndex },
        end: { row: Math.max(0, rowIndex - 1), col: columnIndex },
      });
      setActiveCell({ row: Math.max(0, rowIndex - 1), col: columnIndex });
      focusCell(Math.max(0, rowIndex - 1), columnIndex);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectionRange({
        start: { row: Math.min(lastRowIndex, rowIndex + 1), col: columnIndex },
        end: { row: Math.min(lastRowIndex, rowIndex + 1), col: columnIndex },
      });
      setActiveCell({ row: Math.min(lastRowIndex, rowIndex + 1), col: columnIndex });
      focusCell(Math.min(lastRowIndex, rowIndex + 1), columnIndex);
      return;
    }

    if (event.key === 'ArrowLeft') {
      const input = event.currentTarget;
      if (input.selectionStart === 0 && input.selectionEnd === 0) {
        event.preventDefault();
        const nextCol = Math.max(0, columnIndex - 1);
        setSelectionRange({
          start: { row: rowIndex, col: nextCol },
          end: { row: rowIndex, col: nextCol },
        });
        setActiveCell({ row: rowIndex, col: nextCol });
        focusCell(rowIndex, nextCol);
      }
      return;
    }

    if (event.key === 'ArrowRight') {
      const input = event.currentTarget;
      const atEnd =
        input.selectionStart === input.value.length &&
        input.selectionEnd === input.value.length;

      if (atEnd) {
        event.preventDefault();
        const nextCol = Math.min(lastColIndex, columnIndex + 1);
        setSelectionRange({
          start: { row: rowIndex, col: nextCol },
          end: { row: rowIndex, col: nextCol },
        });
        setActiveCell({ row: rowIndex, col: nextCol });
        focusCell(rowIndex, nextCol);
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      if (rowIndex === lastRowIndex) {
        const nextGrid = {
          ...grid,
          rows: [...grid.rows, Array.from({ length: grid.columns.length }, () => '')],
        };
        onChange(nextGrid);
        setSelectionRange({
          start: { row: rowIndex + 1, col: columnIndex },
          end: { row: rowIndex + 1, col: columnIndex },
        });
        setActiveCell({ row: rowIndex + 1, col: columnIndex });
        focusCell(rowIndex + 1, columnIndex);
      } else {
        setSelectionRange({
          start: { row: rowIndex + 1, col: columnIndex },
          end: { row: rowIndex + 1, col: columnIndex },
        });
        setActiveCell({ row: rowIndex + 1, col: columnIndex });
        focusCell(rowIndex + 1, columnIndex);
      }
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();

      if (event.shiftKey) {
        if (columnIndex > 0) {
          setSelectionRange({
            start: { row: rowIndex, col: columnIndex - 1 },
            end: { row: rowIndex, col: columnIndex - 1 },
          });
          setActiveCell({ row: rowIndex, col: columnIndex - 1 });
          focusCell(rowIndex, columnIndex - 1);
        } else if (rowIndex > 0) {
          setSelectionRange({
            start: { row: rowIndex - 1, col: lastColIndex },
            end: { row: rowIndex - 1, col: lastColIndex },
          });
          setActiveCell({ row: rowIndex - 1, col: lastColIndex });
          focusCell(rowIndex - 1, lastColIndex);
        }
      } else if (columnIndex < lastColIndex) {
        setSelectionRange({
          start: { row: rowIndex, col: columnIndex + 1 },
          end: { row: rowIndex, col: columnIndex + 1 },
        });
        setActiveCell({ row: rowIndex, col: columnIndex + 1 });
        focusCell(rowIndex, columnIndex + 1);
      } else if (rowIndex < lastRowIndex) {
        setSelectionRange({
          start: { row: rowIndex + 1, col: 0 },
          end: { row: rowIndex + 1, col: 0 },
        });
        setActiveCell({ row: rowIndex + 1, col: 0 });
        focusCell(rowIndex + 1, 0);
      } else {
        const nextGrid = {
          ...grid,
          rows: [...grid.rows, Array.from({ length: grid.columns.length }, () => '')],
        };
        onChange(nextGrid);
        setSelectionRange({
          start: { row: rowIndex + 1, col: 0 },
          end: { row: rowIndex + 1, col: 0 },
        });
        setActiveCell({ row: rowIndex + 1, col: 0 });
        focusCell(rowIndex + 1, 0);
      }
    }
  };

  return (
    <section className="panel-card table-panel">
      <div className="panel-card__header">
        <h2>Data grid</h2>
        <span>
          {grid.rows.length} rows · {grid.columns.length} columns
        </span>
      </div>

      <p className="panel-hint">
        Click and drag to select cells, press Delete to clear the selection, or
        paste directly from Excel into a starting cell.
      </p>

      <div className="grid-toolbar">
        <button type="button" onClick={addRow}>
          Add row
        </button>
        <button type="button" onClick={addColumn}>
          Add column
        </button>
        <button type="button" onClick={deleteLastRow}>
          Delete last row
        </button>
        <button type="button" onClick={deleteLastColumn}>
          Delete last column
        </button>
        <button type="button" onClick={clearAllCells}>
          Clear all
        </button>
      </div>

      <div className="data-grid-wrap">
        <table className="data-grid">
          <thead>
            <tr>
              <th className="row-index-header">#</th>
              {grid.columns.map((column, columnIndex) => (
                <th key={`header-${columnIndex}`}>
                  <input
                    type="text"
                    className="grid-header-input"
                    value={column}
                    onChange={(event) =>
                      updateHeader(columnIndex, event.target.value)
                    }
                    spellCheck={false}
                    autoComplete="off"
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {grid.rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                <td className="row-index-cell">{rowIndex + 1}</td>

                {grid.columns.map((_, columnIndex) => {
                  const isSelected = isCellInRange(
                    rowIndex,
                    columnIndex,
                    normalizedSelection,
                  );

                  const isActive =
                    activeCell?.row === rowIndex && activeCell?.col === columnIndex;

                  const classNames = [
                    'data-grid__cell',
                    isSelected ? 'data-grid__cell--selected' : '',
                    isActive ? 'data-grid__cell--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <td
                      key={`cell-${rowIndex}-${columnIndex}`}
                      className={classNames}
                      onMouseDown={(event) =>
                        handleCellMouseDown(rowIndex, columnIndex, event)
                      }
                      onMouseEnter={() => handleCellMouseEnter(rowIndex, columnIndex)}
                    >
                      <input
                        ref={(element) => setCellRef(rowIndex, columnIndex, element)}
                        type="text"
                        className="grid-cell-input"
                        value={row[columnIndex] ?? ''}
                        onFocus={() => {
                          setActiveCell({ row: rowIndex, col: columnIndex });
                        }}
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          handleCellMouseDown(rowIndex, columnIndex, event as never);
                        }}
                        onMouseEnter={() => handleCellMouseEnter(rowIndex, columnIndex)}
                        onChange={(event) =>
                          updateCell(rowIndex, columnIndex, event.target.value)
                        }
                        onPaste={(event) =>
                          handlePaste(rowIndex, columnIndex, event)
                        }
                        onKeyDown={(event) =>
                          handleKeyDown(rowIndex, columnIndex, event)
                        }
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}