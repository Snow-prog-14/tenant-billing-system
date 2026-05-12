import { useState } from "react";
import RentBillCard from "./components/RentBillCard";
import Sidebar from "./components/Sidebar";
import UtilityBillCard from "./components/UtilityBillCard";
import TenantsPage from "./pages/TenantsPage";
import { rentBills, tenants as sampleTenants, utilityBills } from "./data/sampleData";
import type { Page } from "./types/billing";
import {
  calculateTotalRentDue,
  calculateTotalUtilityDue,
  formatPeso,
} from "./utils/billingCalculations";

function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [tenants, setTenants] = useState(sampleTenants);

  const totalUtilityDue = utilityBills.reduce(
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
            <h2>Dashboard</h2>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <span>Total Tenants</span>
                <strong>{tenants.length}</strong>
              </div>

              <div className="dashboard-card">
                <span>Total Utility Due</span>
                <strong>{formatPeso(totalUtilityDue)}</strong>
              </div>

              <div className="dashboard-card">
                <span>Total Rent Due</span>
                <strong>{formatPeso(totalRentDue)}</strong>
              </div>

              <div className="dashboard-card">
                <span>Total Collection</span>
                <strong>{formatPeso(totalUtilityDue + totalRentDue)}</strong>
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
              {utilityBills.map((bill) => {
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
      </main>
    </div>
  );
}

export default App;