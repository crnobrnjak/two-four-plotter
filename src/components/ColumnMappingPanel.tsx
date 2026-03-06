import type { ColumnMapping } from '../types/data';

interface ColumnMappingPanelProps {
  columns: string[];
  mapping: ColumnMapping;
  onChange: (mapping: ColumnMapping) => void;
}

function SelectField({
  label,
  value,
  options,
  allowNone = false,
  onChange,
}: {
  label: string;
  value: string | null;
  options: string[];
  allowNone?: boolean;
  onChange: (value: string | null) => void;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
      >
        {allowNone ? <option value="">(none)</option> : null}
        {!allowNone && !value ? (
          <option value="">Select column...</option>
        ) : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ColumnMappingPanel({
  columns,
  mapping,
  onChange,
}: ColumnMappingPanelProps) {
  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <h2>2. General mapping</h2>
      </div>

      <div className="form-grid one-column-grid">
        <SelectField
          label="ID column"
          value={mapping.idColumn}
          options={columns}
          onChange={(value) => onChange({ ...mapping, idColumn: value })}
        />

        <SelectField
          label="Color column"
          value={mapping.colorColumn}
          options={columns}
          allowNone
          onChange={(value) => onChange({ ...mapping, colorColumn: value })}
        />
      </div>

      <p className="panel-hint">
        Component and uncertainty column selectors are placed around the plot,
        like in the original desktop version.
      </p>
    </section>
  );
}