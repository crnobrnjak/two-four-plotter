import { useMemo, useState } from 'react';
import { ColumnMappingPanel } from './components/ColumnMappingPanel';
import { DataGridPanel } from './components/DataGridPanel';
import { FilterPanel } from './components/FilterPanel';
import { InspectorPanel } from './components/InspectorPanel';
import { PlotSettingsPanel } from './components/PlotSettingsPanel';
import { PlotView } from './components/PlotView';
import { editableGridToParsedTable } from './lib/gridTable';
import {
  getUniqueColorValues,
  guessColumnMapping,
  parseExcludedIds,
  syncColorFilters,
  validateMapping,
} from './lib/validateData';
import {
  CITE_DOI_LABEL,
  CITE_TEXT,
  CONTACT_EMAIL,
  CONTACT_TEXT,
  DEFAULT_GRID,
  DEFAULT_SETTINGS,
  EMPTY_MAPPING,
} from './state/appState';
import { derivePlot } from './state/derivedPlot';
import type { ColorFilters, ColumnMapping, ParsedTable } from './types/data';
import type { InspectorData, PlotDatum } from './types/plot';

const initialParsedTable = editableGridToParsedTable(DEFAULT_GRID);
const initialGuessedMapping = guessColumnMapping(initialParsedTable.columns);

function reconcileMapping(
  mapping: ColumnMapping,
  guessed: ColumnMapping,
  columns: string[],
): ColumnMapping {
  const keep = (value: string | null) =>
    value && columns.includes(value) ? value : null;

  return {
    idColumn: keep(mapping.idColumn) ?? guessed.idColumn,
    colorColumn: keep(mapping.colorColumn) ?? guessed.colorColumn,
    componentColumns: mapping.componentColumns.map(
      (value, index) => keep(value) ?? guessed.componentColumns[index],
    ) as ColumnMapping['componentColumns'],
    sigmaColumns: mapping.sigmaColumns.map(
      (value, index) => keep(value) ?? guessed.sigmaColumns[index],
    ) as ColumnMapping['sigmaColumns'],
  };
}

export default function App() {
  const [grid, setGrid] = useState(DEFAULT_GRID);
  const [mapping, setMapping] = useState<ColumnMapping>(
    initialParsedTable ? initialGuessedMapping : EMPTY_MAPPING,
  );
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [excludedText, setExcludedText] = useState('');

  const [rawColorFilters, setRawColorFilters] = useState<ColorFilters>({
    included: {},
    labels: {},
  });

  const parsedTable = useMemo<ParsedTable>(
    () => editableGridToParsedTable(grid),
    [grid],
  );

  const guessedMapping = useMemo(
    () => guessColumnMapping(parsedTable.columns),
    [parsedTable.columns],
  );

  const effectiveMapping = useMemo(
    () => reconcileMapping(mapping, guessedMapping, parsedTable.columns),
    [mapping, guessedMapping, parsedTable.columns],
  );

  const excludedIds = useMemo(() => parseExcludedIds(excludedText), [excludedText]);

  const mappingErrors = useMemo(
    () => validateMapping(effectiveMapping),
    [effectiveMapping],
  );

  const colorValues = useMemo(
    () => getUniqueColorValues(parsedTable, effectiveMapping.colorColumn),
    [parsedTable, effectiveMapping.colorColumn],
  );

  const colorFilters = useMemo(
    () => syncColorFilters(rawColorFilters, colorValues),
    [rawColorFilters, colorValues],
  );

  const plot = useMemo(
    () =>
      derivePlot({
        table: parsedTable,
        mapping: effectiveMapping,
        settings,
        colorFilters,
        excludedIds,
      }),
    [parsedTable, effectiveMapping, settings, colorFilters, excludedIds],
  );

  const effectiveSelectedId = useMemo(() => {
    if (!selectedId) {
      return null;
    }

    return plot.data.some((datum: PlotDatum) => datum.id === selectedId)
      ? selectedId
      : null;
  }, [plot.data, selectedId]);

  const inspector = useMemo<InspectorData | null>(() => {
    if (!effectiveSelectedId) {
      return null;
    }

    const datum = plot.data.find(
      (item: PlotDatum) => item.id === effectiveSelectedId,
    );

    if (!datum) {
      return null;
    }

    return {
      id: datum.id,
      componentNames: plot.cornerLabels,
      componentValues: datum.componentValues,
      sigmaValues: datum.sigmaValues,
      pct: datum.pct,
      pctSigma: datum.pctSigma,
      excluded: excludedIds.has(datum.id),
    };
  }, [effectiveSelectedId, plot, excludedIds]);

  const handleToggleExcludedId = () => {
    if (!effectiveSelectedId) {
      return;
    }

    const next = new Set(excludedIds);

    if (next.has(effectiveSelectedId)) {
      next.delete(effectiveSelectedId);
    } else {
      next.add(effectiveSelectedId);
    }

    setExcludedText(Array.from(next).sort().join('\n'));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Kosta Crnobrnja</p>
          <h1>2-4 Plotter</h1>
          <p className="header-copy">
            Interactive 2–4 plotter for four-component data.
          </p>
          <p className="cite-line">
            {CITE_TEXT}{' '}
            <span className="cite-line__placeholder">{CITE_DOI_LABEL}</span>
          </p>
          <p className="cite-line">
            {CONTACT_TEXT}{' '}{CONTACT_EMAIL}
          </p>
        </div>
      </header>

      <main className="app-main app-main--three-column">
        <aside className="sidebar">
          <ColumnMappingPanel
            columns={parsedTable.columns}
            mapping={effectiveMapping}
            onChange={setMapping}
          />

          <PlotSettingsPanel settings={settings} onChange={setSettings} />

          <FilterPanel
            colorColumn={effectiveMapping.colorColumn}
            colorValues={colorValues}
            colorFilters={colorFilters}
            excludedText={excludedText}
            onToggleColor={(value, included) =>
              setRawColorFilters((previous) => ({
                ...previous,
                included: { ...previous.included, [value]: included },
              }))
            }
            onRenameColor={(value, label) =>
              setRawColorFilters((previous) => ({
                ...previous,
                labels: { ...previous.labels, [value]: label },
              }))
            }
            onExcludedTextChange={setExcludedText}
          />

          <InspectorPanel
            inspector={inspector}
            onToggleExclude={handleToggleExcludedId}
          />
        </aside>

        <section className="plot-column">
          {mappingErrors.length > 0 ? (
            <section className="panel-card">
              <div className="warning-stack">
                {mappingErrors.map((error: string) => (
                  <p key={error} className="status status--warning">
                    {error}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          <PlotView
            plot={plot}
            settings={settings}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
            columns={parsedTable.columns}
            mapping={effectiveMapping}
            onMappingChange={setMapping}
          />
        </section>

        <aside className="table-column">
          <DataGridPanel grid={grid} onChange={setGrid} />
        </aside>
      </main>
    </div>
  );
}