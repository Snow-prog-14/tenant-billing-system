import { useState } from "react";
import RentBillCard from "./components/RentBillCard";
import Sidebar from "./components/Sidebar";
import UtilityBillCard from "./components/UtilityBillCard";
import { rentBills, tenants as sampleTenants, utilityBills } from "./data/sampleData";
import SettingsPage from "./pages/SettingsPage";
import TenantsPage from "./pages/TenantsPage";
import type { BillingSettings, Page } from "./types/billing";
import {
  calculateTotalRentDue,
  calculateTotalUtilityDue,
  formatPeso,
} from "./utils/billingCalculations";

function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [tenants, setTenants] = useState(sampleTenants);

  const [settings, setSettings] = useState<BillingSettings>({
    waterRate: 42.6,
    electricRate: 16,
    defaultMonthlyRent: 3000,
    utilityDueDay: 2,
    rentDueDay: 5,
  });

  const utilityBillsWithSettings = utilityBills.map((bill) => ({
    ...bill,
    waterRate: settings.waterRate,
    electricRate: settings.electricRate,
  }));

  const totalUtilityDue = utilityBillsWithSettings.reduce(
    (sum, bill) => sum + calculateTotalUtilityDue(bill),
    0
  );

  const totalRentDue = rentBills.reduce(
    (sum, bill) => sum + calculateTotalRentDue(bill),
    0
  );

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onChangePage={setActivePage} />

      <main>
        <header className="app-header">
          <h1>Tenant Billing System</h1>
          <p>Monthly utility and rent billing for tenants</p>
        </header>

        {activePage === "dashboard" && (
          <section className="page-section">
            <div className="dashboard-hero">
              <div>
                <p className="eyebrow">Overview</p>
                <h2>Dashboard</h2>
                <p>
                  Track tenants, rent balances, and monthly utility collections
                  in one place.
                </p>
              </div>

              <div className="hero-total">
                <span>Total Collection</span>
                <strong>{formatPeso(totalUtilityDue + totalRentDue)}</strong>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card tenants-card">
                <div className="dashboard-card-icon">◎</div>
                <span>Total Tenants</span>
                <strong>{tenants.length}</strong>
                <p>Currently registered tenants</p>
              </div>

              <div className="dashboard-card utility-card">
                <div className="dashboard-card-icon">⚡</div>
                <span>Total Utility Due</span>
                <strong>{formatPeso(totalUtilityDue)}</strong>
                <p>Water and electricity balance</p>
              </div>

              <div className="dashboard-card rent-due-card">
                <div className="dashboard-card-icon">⌂</div>
                <span>Total Rent Due</span>
                <strong>{formatPeso(totalRentDue)}</strong>
                <p>Monthly rent balance</p>
              </div>

              <div className="dashboard-card collection-card">
                <div className="dashboard-card-icon">₱</div>
                <span>Total Collection</span>
                <strong>{formatPeso(totalUtilityDue + totalRentDue)}</strong>
                <p>Expected amount to collect</p>
              </div>
            </div>
          </section>
        )}

        {activePage === "tenants" && (
          <TenantsPage
            tenants={tenants}
            onAddTenant={(tenant) => setTenants([...tenants, tenant])}
          />
        )}

        {activePage === "utility" && (
          <section className="page-section">
            <h2>Utility Bills</h2>

            <div className="bill-grid">
              {utilityBillsWithSettings.map((bill) => {
                const tenant = tenants.find(
                  (tenant) => tenant.id === bill.tenantId
                );

                if (!tenant) {
                  return null;
                }

                return (
                  <UtilityBillCard key={bill.id} tenant={tenant} bill={bill} />
                );
              })}
            </div>
          </section>
        )}

        {activePage === "rent" && (
          <section className="page-section">
            <h2>Rent Bills</h2>

            <div className="bill-grid">
              {rentBills.map((bill) => {
                const tenant = tenants.find(
                  (tenant) => tenant.id === bill.tenantId
                );

                if (!tenant) {
                  return null;
                }

                return <RentBillCard key={bill.id} tenant={tenant} bill={bill} />;
              })}
            </div>
          </section>
        )}

        {activePage === "settings" && (
          <SettingsPage settings={settings} onUpdateSettings={setSettings} />
        )}
      </main>
    </div>
  );
}

export default App;