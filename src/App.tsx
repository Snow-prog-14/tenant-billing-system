import { useEffect, useState } from "react";
import RentBillCard from "./components/RentBillCard";
import Sidebar from "./components/Sidebar";
import UtilityBillCard from "./components/UtilityBillCard";
import { rentBills } from "./data/sampleData";
import SettingsPage from "./pages/SettingsPage";
import TenantsPage from "./pages/TenantsPage";
import type {
  BillingSettings,
  Page,
  Tenant,
  UtilityBill,
} from "./types/billing";import {
  calculateTotalRentDue,
  calculateTotalUtilityDue,
  formatPeso,
} from "./utils/billingCalculations";

const API_URL = "http://localhost:5000/api";

function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [isLoadingUtilityBills, setIsLoadingUtilityBills] = useState(true);

  const [settings, setSettings] = useState<BillingSettings>({
    waterRate: 42.6,
    electricRate: 16,
    defaultMonthlyRent: 3000,
    utilityDueDay: 2,
    rentDueDay: 5,
  });

  useEffect(() => {
    async function fetchTenants() {
      try {
        const response = await fetch(`${API_URL}/tenants`);

        if (!response.ok) {
          throw new Error("Failed to fetch tenants");
        }

        const data: Tenant[] = await response.json();
        setTenants(data);
      } catch (error) {
        console.error(error);
        alert("Could not load tenants from database.");
      } finally {
        setIsLoadingTenants(false);
      }
    }

    fetchTenants();
  }, []);

  useEffect(() => {
  async function fetchUtilityBills() {
    try {
      const response = await fetch(`${API_URL}/utility-bills`);

      if (!response.ok) {
        throw new Error("Failed to fetch utility bills");
      }

      const data: UtilityBill[] = await response.json();

      const convertedData = data.map((bill) => ({
        ...bill,
        previousWaterReading: Number(bill.previousWaterReading),
        currentWaterReading: Number(bill.currentWaterReading),
        waterRate: Number(bill.waterRate),
        previousElectricReading: Number(bill.previousElectricReading),
        currentElectricReading: Number(bill.currentElectricReading),
        electricRate: Number(bill.electricRate),
        additionalCharges: Number(bill.additionalCharges),
        previousUnpaidBalance: Number(bill.previousUnpaidBalance),
        amountPaid: Number(bill.amountPaid),
      }));

      setUtilityBills(convertedData);
    } catch (error) {
      console.error(error);
      alert("Could not load utility bills from database.");
    } finally {
      setIsLoadingUtilityBills(false);
    }
  }

  fetchUtilityBills();
}, []);

  async function handleAddTenant(tenant: Tenant) {
    try {
      const response = await fetch(`${API_URL}/tenants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tenant.name,
          roomNo: tenant.roomNo,
          monthlyRent: tenant.monthlyRent,
          status: tenant.status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add tenant");
      }

      const tenantsResponse = await fetch(`${API_URL}/tenants`);
      const updatedTenants: Tenant[] = await tenantsResponse.json();

      setTenants(updatedTenants);
    } catch (error) {
      console.error(error);
      alert("Could not add tenant to database.");
    }
  }

async function handleDeleteTenant(tenantId: number) {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this tenant?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tenants/${tenantId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Delete failed response:", errorText);

      throw new Error(
        `Failed to delete tenant. Server returned status ${response.status}.`
      );
    }

    setTenants((currentTenants) =>
      currentTenants.filter((tenant) => tenant.id !== tenantId)
    );
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("Could not delete tenant from database.");
    }
  }
}

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
                <strong>{isLoadingTenants ? "..." : tenants.length}</strong>
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
  onAddTenant={handleAddTenant}
  onDeleteTenant={handleDeleteTenant}
/>        )}

      {activePage === "utility" && (
  <section className="page-section">
    <h2>Utility Bills</h2>

    {isLoadingUtilityBills ? (
      <p>Loading utility bills...</p>
    ) : (
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
    )}
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