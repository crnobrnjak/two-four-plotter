import { useMemo, useRef } from 'react';
import { exportSvgAsPng } from '../lib/exportPng';
import { exportSvgElement } from '../lib/exportSvg';
import type { ColumnMapping, PlotSettings } from '../types/data';
import type { DerivedPlot, PlotDatum } from '../types/plot';

interface PlotViewProps {
  plot: DerivedPlot;
  settings: PlotSettings;
  selectedId: string | null;
  onSelect: (id: string) => void;
  columns: string[];
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
}

function getLegendOrigin(position: PlotSettings['legendPosition']) {
  switch (position) {
    case 'upper-left':
      return { x: 0.06, y: 0.10 };
    case 'lower-left':
      return { x: 0.06, y: 0.82 };
    case 'lower-right':
      return { x: 0.74, y: 0.82 };
    case 'upper-right':
    default:
      return { x: 0.74, y: 0.10 };
  }
}

function CornerSelect({
  label,
  value,
  options,
  allowNone = false,
  onChange,
  widthClass = '',
}: {
  label: string;
  value: string | null;
  options: string[];
  allowNone?: boolean;
  onChange: (value: string | null) => void;
  widthClass?: string;
}) {
  return (
    <label className={`corner-select ${widthClass}`.trim()}>
      <span>{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
      >
        {allowNone ? <option value="">(none)</option> : null}
        {!allowNone && !value ? <option value="">Select...</option> : null}
        {options.map((option) => (
          <option key={`${label}-${option}`} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CornerSelectorPair({
  componentLabel,
  sigmaLabel,
  componentValue,
  sigmaValue,
  columns,
  componentFirst,
  onComponentChange,
  onSigmaChange,
}: {
  componentLabel: string;
  sigmaLabel: string;
  componentValue: string | null;
  sigmaValue: string | null;
  columns: string[];
  componentFirst: boolean;
  onComponentChange: (value: string | null) => void;
  onSigmaChange: (value: string | null) => void;
}) {
  const component = (
    <CornerSelect
      label={componentLabel}
      value={componentValue}
      options={columns}
      onChange={onComponentChange}
      widthClass="corner-select--component"
    />
  );

  const sigma = (
    <CornerSelect
      label={sigmaLabel}
      value={sigmaValue}
      options={columns}
      allowNone
      onChange={onSigmaChange}
      widthClass="corner-select--sigma"
    />
  );

  return (
    <div className="corner-selector-pair">
      {componentFirst ? (
        <>
          {component}
          {sigma}
        </>
      ) : (
        <>
          {sigma}
          {component}
        </>
      )}
    </div>
  );
}

export function PlotView({
  plot,
  settings,
  selectedId,
  onSelect,
  columns,
  mapping,
  onMappingChange,
}: PlotViewProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const legendOrigin = useMemo(
    () => getLegendOrigin(settings.legendPosition),
    [settings.legendPosition],
  );

  const updateComponent = (index: number, value: string | null) => {
    const next = [...mapping.componentColumns] as ColumnMapping['componentColumns'];
    next[index] = value;
    onMappingChange({ ...mapping, componentColumns: next });
  };

  const updateSigma = (index: number, value: string | null) => {
    const next = [...mapping.sigmaColumns] as ColumnMapping['sigmaColumns'];
    next[index] = value;
    onMappingChange({ ...mapping, sigmaColumns: next });
  };

  return (
    <section className="plot-shell">
      <div className="plot-toolbar">
        <div>
          <h2>2–4 plot</h2>
          <p>Click a central line to inspect a sample.</p>
        </div>

        <div className="toolbar-actions">
          <button
            type="button"
            onClick={() => svgRef.current && exportSvgElement(svgRef.current)}
          >
            Export SVG
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!svgRef.current) {
                return;
              }
              await exportSvgAsPng(svgRef.current);
            }}
          >
            Export PNG
          </button>
        </div>
      </div>

      {plot.warnings.length > 0 ? (
        <div className="warning-stack">
          {plot.warnings.map((warning) => (
            <p key={warning} className="status status--warning">
              {warning}
            </p>
          ))}
        </div>
      ) : null}

      <div className="plot-stage">
        <div className="plot-corner plot-corner--top-left">
          <CornerSelectorPair
            componentLabel="A"
            sigmaLabel="σA"
            componentValue={mapping.componentColumns[0]}
            sigmaValue={mapping.sigmaColumns[0]}
            columns={columns}
            componentFirst={false}
            onComponentChange={(value) => updateComponent(0, value)}
            onSigmaChange={(value) => updateSigma(0, value)}
          />
        </div>

        <div className="plot-corner plot-corner--top-right">
          <CornerSelectorPair
            componentLabel="B"
            sigmaLabel="σB"
            componentValue={mapping.componentColumns[1]}
            sigmaValue={mapping.sigmaColumns[1]}
            columns={columns}
            componentFirst
            onComponentChange={(value) => updateComponent(1, value)}
            onSigmaChange={(value) => updateSigma(1, value)}
          />
        </div>

        <div className="plot-corner plot-corner--bottom-left">
          <CornerSelectorPair
            componentLabel="C"
            sigmaLabel="σC"
            componentValue={mapping.componentColumns[2]}
            sigmaValue={mapping.sigmaColumns[2]}
            columns={columns}
            componentFirst={false}
            onComponentChange={(value) => updateComponent(2, value)}
            onSigmaChange={(value) => updateSigma(2, value)}
          />
        </div>

        <div className="plot-corner plot-corner--bottom-right">
          <CornerSelectorPair
            componentLabel="D"
            sigmaLabel="σD"
            componentValue={mapping.componentColumns[3]}
            sigmaValue={mapping.sigmaColumns[3]}
            columns={columns}
            componentFirst
            onComponentChange={(value) => updateComponent(3, value)}
            onSigmaChange={(value) => updateSigma(3, value)}
          />
        </div>

        <div className="plot-square-wrap">
          <svg
            ref={svgRef}
            className="plot-svg"
            viewBox="-0.08 -0.08 1.16 1.16"
            role="img"
            aria-label="Two-four plot"
          >
            <defs>
              <clipPath id="plot-clip">
                <rect x="0" y="0" width="1" height="1" />
              </clipPath>
            </defs>

            <rect
              x="0"
              y="0"
              width="1"
              height="1"
              fill="#ffffff"
              stroke="#8fa1b3"
              strokeWidth="0.004"
            />

            <g clipPath="url(#plot-clip)">
              {plot.centralExtensions.map((segment, index) => (
                <line
                  key={`central-extension-${index}`}
                  x1={segment.p1.x}
                  y1={1 - segment.p1.y}
                  x2={segment.p2.x}
                  y2={1 - segment.p2.y}
                  stroke="#6d7c8b"
                  strokeOpacity="0.42"
                  strokeWidth="1.3"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {plot.uncertaintyExtensions.map((segment, index) => (
                <line
                  key={`unc-extension-${index}`}
                  x1={segment.p1.x}
                  y1={1 - segment.p1.y}
                  x2={segment.p2.x}
                  y2={1 - segment.p2.y}
                  stroke="#7f8d9c"
                  strokeOpacity="0.28"
                  strokeWidth="1.1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {plot.data.map((datum) =>
                datum.uncertaintyHull.length >= 3 ? (
                  <polygon
                    key={`hull-${datum.id}`}
                    points={datum.uncertaintyHull
                      .map((point) => `${point.x},${1 - point.y}`)
                      .join(' ')}
                    fill={datum.color}
                    fillOpacity={Math.min(settings.lineAlpha * 0.12, 1)}
                    stroke="none"
                  />
                ) : null,
              )}

              {plot.data.flatMap((datum) =>
                datum.uncertaintyBoundarySegments.map((segment, index) => (
                  <line
                    key={`unc-segment-${datum.id}-${index}`}
                    x1={segment.p1.x}
                    y1={1 - segment.p1.y}
                    x2={segment.p2.x}
                    y2={1 - segment.p2.y}
                    stroke={datum.color}
                    strokeOpacity={Math.min(settings.lineAlpha * 0.65, 1)}
                    strokeWidth={Math.max(settings.lineWidth * 0.7, 2)}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                  />
                )),
              )}

              {plot.data.map((datum: PlotDatum) => (
                <g key={datum.id}>
                  <line
                    x1={datum.centralSegment.p1.x}
                    y1={1 - datum.centralSegment.p1.y}
                    x2={datum.centralSegment.p2.x}
                    y2={1 - datum.centralSegment.p2.y}
                    stroke="#ffffff"
                    strokeOpacity="0.9"
                    strokeWidth={Math.max(settings.lineWidth * 2, 5)}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                  />

                  <line
                    x1={datum.centralSegment.p1.x}
                    y1={1 - datum.centralSegment.p1.y}
                    x2={datum.centralSegment.p2.x}
                    y2={1 - datum.centralSegment.p2.y}
                    stroke={datum.color}
                    strokeOpacity={settings.lineAlpha}
                    strokeWidth={Math.max(settings.lineWidth * 3)}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                  />

                  <line
                    x1={datum.centralSegment.p1.x}
                    y1={1 - datum.centralSegment.p1.y}
                    x2={datum.centralSegment.p2.x}
                    y2={1 - datum.centralSegment.p2.y}
                    stroke="transparent"
                    strokeWidth="14"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    onClick={() => onSelect(datum.id)}
                    style={{ cursor: 'pointer' }}
                  />

                  {selectedId === datum.id ? (
                    <line
                      x1={datum.centralSegment.p1.x}
                      y1={1 - datum.centralSegment.p1.y}
                      x2={datum.centralSegment.p2.x}
                      y2={1 - datum.centralSegment.p2.y}
                      stroke="#111111"
                      strokeOpacity="0.65"
                      strokeWidth={Math.max(settings.lineWidth * 4, 7)}
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                    />
                  ) : null}
                </g>
              ))}

              {settings.showLabels
                ? plot.data.map((datum) => (
                    <text
                      key={`label-${datum.id}`}
                      x={datum.x}
                      y={1 - datum.y}
                      className="plot-label"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="0.022"
                    >
                      {datum.label}
                    </text>
                  ))
                : null}
            </g>

            <text
              x={-0.02}
              y={-0.02}
              className="corner-label"
              textAnchor="end"
              fontSize="0.045"
            >
              {plot.cornerLabels[0]}
            </text>

            <text
              x={1.02}
              y={-0.02}
              className="corner-label"
              textAnchor="start"
              fontSize="0.045"
            >
              {plot.cornerLabels[1]}
            </text>

            <text
              x={-0.02}
              y={1.08}
              className="corner-label"
              textAnchor="end"
              fontSize="0.045"
            >
              {plot.cornerLabels[2]}
            </text>

            <text
              x={1.02}
              y={1.08}
              className="corner-label"
              textAnchor="start"
              fontSize="0.045"
            >
              {plot.cornerLabels[3]}
            </text>

            {settings.showLegend && plot.legendEntries.length > 0 ? (
              <g transform={`translate(${legendOrigin.x}, ${legendOrigin.y})`}>
                {plot.legendEntries.map((entry, index) => (
                  <g key={entry.key} transform={`translate(0, ${index * 0.05})`}>
                    <line
                      x1="0"
                      y1="0"
                      x2="0.065"
                      y2="0"
                      stroke={entry.color}
                      strokeWidth="0.008"
                      strokeLinecap="round"
                    />
                    <text
                      x="0.082"
                      y="0.008"
                      className="legend-label"
                      fontSize="0.026"
                    >
                      {entry.label}
                    </text>
                  </g>
                ))}
              </g>
            ) : null}
          </svg>
        </div>
      </div>
    </section>
  );
}