import type { ColorFilters } from '../types/data';

interface FilterPanelProps {
  colorColumn: string | null;
  colorValues: string[];
  colorFilters: ColorFilters;
  excludedText: string;
  onToggleColor: (value: string, included: boolean) => void;
  onRenameColor: (value: string, label: string) => void;
  onExcludedTextChange: (value: string) => void;
}

export function FilterPanel({
  colorColumn,
  colorValues,
  colorFilters,
  excludedText,
  onToggleColor,
  onRenameColor,
  onExcludedTextChange,
}: FilterPanelProps) {
  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <h2>4. Filters</h2>
      </div>

      {colorColumn ? (
        <div className="filter-block">
          <h3>Color groups</h3>

          {colorValues.length === 0 ? (
            <p className="panel-hint">No non-empty color values found.</p>
          ) : null}

          {colorValues.map((value) => (
            <div key={value} className="color-filter-row">
              <label>
                <input
                  type="checkbox"
                  checked={colorFilters.included[value] ?? true}
                  onChange={(event) =>
                    onToggleColor(value, event.target.checked)
                  }
                />
                <span>{value}</span>
              </label>

              <input
                type="text"
                value={colorFilters.labels[value] ?? ''}
                onChange={(event) => onRenameColor(value, event.target.value)}
                placeholder="Legend label"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="panel-hint">
          Choose a color column if you want legend groups and color-based
          filtering.
        </p>
      )}

      <div className="filter-block">
        <h3>Excluded IDs</h3>
        <p className="panel-hint">One per line or separated by commas.</p>

        <textarea
          className="exclude-area"
          value={excludedText}
          onChange={(event) => onExcludedTextChange(event.target.value)}
          spellCheck={false}
        />
      </div>
    </section>
  );
}