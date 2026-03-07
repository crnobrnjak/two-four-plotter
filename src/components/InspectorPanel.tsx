import type { InspectorData } from '../types/plot';

interface InspectorPanelProps {
  inspector: InspectorData | null;
  onToggleExclude: () => void;
}

export function InspectorPanel({
  inspector,
  onToggleExclude,
}: InspectorPanelProps) {
  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <h2>5. Inspector</h2>

        <button type="button" onClick={onToggleExclude} disabled={!inspector}>
          {inspector?.excluded ? 'Include selected' : 'Exclude selected'}
        </button>
      </div>

      {!inspector ? (
        <p className="panel-hint">
          Click a data line to inspect its composition.
        </p>
      ) : (
        <>
          <p className="inspector-id">
            <strong>Selected ID:</strong> {inspector.id}
          </p>

          <div className="inspector-grid">
            {inspector.componentNames.map((name, index) => {
              const pct = inspector.pct[index].toFixed(2);
              const pctSigma = inspector.pctSigma[index];

              return (
                <div key={name} className="inspector-cell">
                  <strong>{name}</strong>
                  <span>
                    {pct}%
                    {pctSigma > 0 ? ` ± ${pctSigma.toFixed(2)}%` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}