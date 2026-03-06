import type { PlotSettings } from '../types/data';

interface PlotSettingsPanelProps {
  settings: PlotSettings;
  onChange: (settings: PlotSettings) => void;
}

type BooleanSettingKey =
  | 'showUncertainty'
  | 'extendCentralLines'
  | 'extendUncertaintyLines'
  | 'showLabels'
  | 'showLegend';

type NumericSettingKey = 'lineLength' | 'lineWidth' | 'lineAlpha';

export function PlotSettingsPanel({
  settings,
  onChange,
}: PlotSettingsPanelProps) {
  const setNumber = (key: NumericSettingKey, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  const setBoolean = (key: BooleanSettingKey, value: boolean) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <h2>3. Plot settings</h2>
      </div>

      <div className="checkbox-list">
        <label>
          <input
            type="checkbox"
            checked={settings.showUncertainty}
            onChange={(event) =>
              setBoolean('showUncertainty', event.target.checked)
            }
          />
          Show uncertainty
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.extendCentralLines}
            onChange={(event) =>
              setBoolean('extendCentralLines', event.target.checked)
            }
          />
          Extend central lines
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.extendUncertaintyLines}
            onChange={(event) =>
              setBoolean('extendUncertaintyLines', event.target.checked)
            }
          />
          Extend uncertainty lines
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.showLabels}
            onChange={(event) => setBoolean('showLabels', event.target.checked)}
          />
          Show labels
        </label>

        <label>
          <input
            type="checkbox"
            checked={settings.showLegend}
            onChange={(event) => setBoolean('showLegend', event.target.checked)}
          />
          Show legend
        </label>
      </div>

      <div className="form-grid compact-grid">
        <label className="form-field">
          <span>Line length</span>
          <input
            type="number"
            min="0.001"
            step="0.001"
            value={settings.lineLength}
            onChange={(event) =>
              setNumber('lineLength', Number(event.target.value))
            }
          />
        </label>

        <label className="form-field">
          <span>Line width</span>
          <input
            type="number"
            min="0.25"
            step="0.25"
            value={settings.lineWidth}
            onChange={(event) =>
              setNumber('lineWidth', Number(event.target.value))
            }
          />
        </label>

        <label className="form-field">
          <span>Line alpha</span>
          <input
            type="number"
            min="0.05"
            max="1"
            step="0.05"
            value={settings.lineAlpha}
            onChange={(event) =>
              setNumber('lineAlpha', Number(event.target.value))
            }
          />
        </label>

        <label className="form-field">
          <span>Legend position</span>
          <select
            value={settings.legendPosition}
            onChange={(event) =>
              onChange({
                ...settings,
                legendPosition: event.target
                  .value as PlotSettings['legendPosition'],
              })
            }
          >
            <option value="upper-right">Upper right</option>
            <option value="upper-left">Upper left</option>
            <option value="lower-left">Lower left</option>
            <option value="lower-right">Lower right</option>
          </select>
        </label>
      </div>
    </section>
  );
}