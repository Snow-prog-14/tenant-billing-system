import { useEffect, useState } from "react";
import type { BillingSettings } from "../types/billing";

type SettingsPageProps = {
  settings: BillingSettings;
  onUpdateSettings: (settings: BillingSettings) => void;
};

function SettingsPage({ settings, onUpdateSettings }: SettingsPageProps) {
  const [localSettings, setLocalSettings] =
    useState<BillingSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  function updateNumberSetting(key: keyof BillingSettings, value: string) {
    setLocalSettings({
      ...localSettings,
      [key]: Number(value),
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onUpdateSettings(localSettings);
    alert("Settings saved successfully.");
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

      <form onSubmit={handleSubmit}>
        <div className="settings-grid">
          <div className="settings-card">
            <h3>Utility Rates</h3>

            <div className="form-group">
              <label htmlFor="waterRate">Water Rate per cu.m</label>
              <input
                id="waterRate"
                type="number"
                step="0.01"
                value={localSettings.waterRate}
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
                value={localSettings.electricRate}
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
                value={localSettings.defaultMonthlyRent}
                onChange={(event) =>
                  updateNumberSetting(
                    "defaultMonthlyRent",
                    event.target.value
                  )
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
                value={localSettings.utilityDueDay}
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
                value={localSettings.rentDueDay}
                onChange={(event) =>
                  updateNumberSetting("rentDueDay", event.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button className="primary-button" type="submit">
            Save Settings
          </button>
        </div>
      </form>
    </section>
  );
}

export default SettingsPage;