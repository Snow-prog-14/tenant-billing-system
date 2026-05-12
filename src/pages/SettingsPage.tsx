import type { BillingSettings } from "../types/billing";

type SettingsPageProps = {
  settings: BillingSettings;
  onUpdateSettings: (settings: BillingSettings) => void;
};

function SettingsPage({ settings, onUpdateSettings }: SettingsPageProps) {
  function updateNumberSetting(
    key: keyof BillingSettings,
    value: string
  ) {
    onUpdateSettings({
      ...settings,
      [key]: Number(value),
    });
  }

  return (
    <section className="page-section">
      <div className="settings-hero">
        <div>
          <p className="eyebrow">System Settings</p>
          <h2>Billing Settings</h2>
          <p>
            Update default rates and due dates used for monthly tenant billing.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <h3>Utility Rates</h3>

          <div className="form-group">
            <label htmlFor="waterRate">Water Rate per cu.m</label>
            <input
              id="waterRate"
              type="number"
              step="0.01"
              value={settings.waterRate}
              onChange={(event) =>
                updateNumberSetting("waterRate", event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="electricRate">Electricity Rate per kWh</label>
            <input
              id="electricRate"
              type="number"
              step="0.01"
              value={settings.electricRate}
              onChange={(event) =>
                updateNumberSetting("electricRate", event.target.value)
              }
            />
          </div>
        </div>

        <div className="settings-card">
          <h3>Rent Defaults</h3>

          <div className="form-group">
            <label htmlFor="defaultMonthlyRent">Default Monthly Rent</label>
            <input
              id="defaultMonthlyRent"
              type="number"
              step="0.01"
              value={settings.defaultMonthlyRent}
              onChange={(event) =>
                updateNumberSetting("defaultMonthlyRent", event.target.value)
              }
            />
          </div>
        </div>

        <div className="settings-card">
          <h3>Due Dates</h3>

          <div className="form-group">
            <label htmlFor="utilityDueDay">Utility Due Day</label>
            <input
              id="utilityDueDay"
              type="number"
              min="1"
              max="31"
              value={settings.utilityDueDay}
              onChange={(event) =>
                updateNumberSetting("utilityDueDay", event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="rentDueDay">Rent Due Day</label>
            <input
              id="rentDueDay"
              type="number"
              min="1"
              max="31"
              value={settings.rentDueDay}
              onChange={(event) =>
                updateNumberSetting("rentDueDay", event.target.value)
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;