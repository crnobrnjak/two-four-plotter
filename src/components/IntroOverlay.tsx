interface IntroOverlayProps {
  onClose: () => void;
  onCloseForever: () => void;
}

export function IntroOverlay({
  onClose,
  onCloseForever,
}: IntroOverlayProps) {
  return (
    <div className="intro-overlay" role="dialog" aria-modal="true">
      <div className="intro-overlay__backdrop" onClick={onClose} />

      <div className="intro-overlay__panel">
        <div className="intro-overlay__header">
          <div>
            <p className="eyebrow">Welcome</p>
            <h2>How the 2–4 plot works</h2>
          </div>

          <button
            type="button"
            className="intro-overlay__close"
            onClick={onClose}
            aria-label="Close introduction"
          >
            ×
          </button>
        </div>

        <div className="intro-overlay__content">
          <div className="intro-overlay__text">
            <p>
              The 2–4 plot is a way to represent four-component compositions in a
              two-dimensional square.
            </p>

            <p>
              Each sample is shown as a short <strong>data line</strong>, not a
              point.
            </p>

            <p>
              The line intersects the <strong>top</strong> and{' '}
              <strong>bottom</strong> mixing lines, which encode:
            </p>

            <ul className="intro-list">
              <li>
                <strong>Top intersection:</strong> B / (A + B)
              </li>
              <li>
                <strong>Bottom intersection:</strong> D / (C + D)
              </li>
              <li>
                <strong>Vertical position:</strong> (A + B) / (A + B + C + D)
              </li>
            </ul>

            <p>
              In other words, any four-component composition can be represented
              by a line whose position and orientation encode the relative
              proportions of the components.
            </p>

            <div className="intro-howto">
              <h3>How to use this tool</h3>
              <ol>
                <li>Fill or paste your table into the data grid.</li>
                <li>Select the ID column and the A, B, C, D component columns.</li>
                <li>Optionally assign uncertainty and color columns.</li>
                <li>Click a plotted line to inspect that sample.</li>
              </ol>
            </div>
          </div>

          <div className="intro-overlay__figure">
            <svg
              viewBox="0 0 420 420"
              className="intro-figure"
              aria-label="Schematic explanation of the 2–4 plot"
            >
            {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((tick, index) => {
              const x = 60 + (index + 1) * 30;
              return (
                <g key={`top-tick-${tick}`}>
                  <line x1={x} y1={50} x2={x} y2={44} stroke="#475569" strokeWidth="1.25" />
                  <text x={x} y={38} textAnchor="middle" fontSize="14" fill="#334155">
                    {tick.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((tick, index) => {
              const x = 60 + (index + 1) * 30;
              return (
                <g key={`bottom-tick-${tick}`}>
                  <line x1={x} y1={350} x2={x} y2={356} stroke="#475569" strokeWidth="1.25" />
                  <text x={x} y={374} textAnchor="middle" fontSize="14" fill="#334155">
                    {tick.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((tick, index) => {
              const y = 350 - (index + 1) * 30;
              return (
                <g key={`left-tick-${tick}`}>
                  <line x1={60} y1={y} x2={54} y2={y} stroke="#475569" strokeWidth="1.25" />
                  <text
                    x={46}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize="14"
                    fill="#334155"
                  >
                    {tick.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((tick, index) => {
              const y = 350 - (index + 1) * 30;
              return (
                <g key={`right-tick-${tick}`}>
                  <line x1={360} y1={y} x2={366} y2={y} stroke="#475569" strokeWidth="1.25" />
                  <text
                    x={374}
                    y={y}
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontSize="14"
                    fill="#334155"
                  >
                    {tick.toFixed(1)}
                  </text>
                </g>
              );
            })}
              <rect
                x="60"
                y="50"
                width="300"
                height="300"
                fill="#fff"
                stroke="#334155"
                strokeWidth="2"
              />

              <text x="52" y="38" fontSize="20" fontWeight="700">
                A
              </text>
              <text x="372" y="38" fontSize="20" fontWeight="700">
                B
              </text>
              <text x="52" y="372" fontSize="20" fontWeight="700">
                C
              </text>
              <text x="372" y="372" fontSize="20" fontWeight="700">
                D
              </text>

              {/* extended line */}
              <line
                x1="170"
                y1="350"
                x2="250"
                y2="50"
                stroke="#111827"
                strokeWidth="2"
                strokeDasharray="6 4"
              />

              {/* data line placed directly on the extended line */}
              <line
                x1="207"
                y1="211"
                x2="215"
                y2="181"
                stroke="#111827"
                strokeWidth="7"
                strokeLinecap="round"
              />

              {/* construction lines meeting exactly at the midpoint of the data line */}
              <line
                x1="60"
                y1="196"
                x2="211"
                y2="196"
                stroke="#6b7280"
                strokeWidth="1.5"
                strokeDasharray="2 3"
              />
              <line
                x1="211"
                y1="196"
                x2="211"
                y2="350"
                stroke="#6b7280"
                strokeWidth="1.5"
                strokeDasharray="2 3"
              />

              {/* top and bottom ratio guide lines */}
              <line x1="60" y1="66" x2="246" y2="66" stroke="#6b7280" strokeWidth="1.5" />
              <line x1="60" y1="334" x2="174" y2="334" stroke="#6b7280" strokeWidth="1.5" />

              <text x="137" y="86" fontSize="16">
                B / (A + B)
              </text>
              <text x="86" y="322" fontSize="16">
                D / (C + D)
              </text>

              {/* vertical-ratio label moved lower */}
              <text x="260" y="270" fontSize="15">
                (A + B)
              </text>
              <line x1="228" y1="278" x2="340" y2="278" stroke="#111827" strokeWidth="1.5" />
              <text x="228" y="297" fontSize="15">
                (A + B) + (C + D)
              </text>

              <text x="154" y="186" fontSize="13" fill="#0f172a">
                data line
              </text>
            </svg>
          </div>
        </div>

        <div className="intro-overlay__footer">
          <button type="button" onClick={onClose}>
            Close
          </button>

          <button
            type="button"
            className="button-primary"
            onClick={onCloseForever}
          >
            Don’t show again
          </button>
        </div>
      </div>
    </div>
  );
}