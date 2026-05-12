import { useEffect, useState } from "react";
import RentBillCard from "./components/RentBillCard";
import Sidebar from "./components/Sidebar";
import UtilityBillCard from "./components/UtilityBillCard";
import SettingsPage from "./pages/SettingsPage";
import TenantsPage from "./pages/TenantsPage";
import type {
  BillingSettings,
  Page,
  RentBill,
  Tenant,
  UtilityBill,
} from "./types/billing";
import {
  calculateTotalRentDue,
  calculateTotalUtilityDue,
  formatPeso,
} from "./utils/billingCalculations";
import AddUtilityBillForm from "./components/AddUtilityBillForm";
import AddRentBillForm from "./components/AddRentBillForm";

const API_URL = "http://localhost:5000/api";

function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [isLoadingUtilityBills, setIsLoadingUtilityBills] = useState(true);
  const [rentBills, setRentBills] = useState<RentBill[]>([]);
const [isLoadingRentBills, setIsLoadingRentBills] = useState(true);

  const [settings, setSettings] = useState<BillingSettings>({
    waterRate: 42.6,
    electricRate: 16,
    defaultMonthlyRent: 3000,
    utilityDueDay: 2,
    rentDueDay: 5,
  });

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
  async function fetchSettings() {
    try {
      const response = await fetch(`${API_URL}/settings`);

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();

      setSettings({
        waterRate: Number(data.waterRate),
        electricRate: Number(data.electricRate),
        defaultMonthlyRent: Number(data.defaultMonthlyRent),
        utilityDueDay: Number(data.utilityDueDay),
        rentDueDay: Number(data.rentDueDay),
      });
    } catch (error) {
      console.error(error);
      alert("Could not load settings from database.");
    } finally {
      setIsLoadingSettings(false);
    }
  }

  fetchSettings();
}, []);

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

useEffect(() => {
  async function fetchRentBills() {
    try {
      const response = await fetch(`${API_URL}/rent-bills`);

      if (!response.ok) {
        throw new Error("Failed to fetch rent bills");
      }

      const data: RentBill[] = await response.json();

      const convertedData = data.map((bill) => ({
        ...bill,
        rentAmount: Number(bill.rentAmount),
        previousUnpaidBalance: Number(bill.previousUnpaidBalance),
        amountPaid: Number(bill.amountPaid),
      }));

      setRentBills(convertedData);
    } catch (error) {
      console.error(error);
      alert("Could not load rent bills from database.");
    } finally {
      setIsLoadingRentBills(false);
    }
  }

  fetchRentBills();
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

  async function handleUpdateSettings(updatedSettings: BillingSettings) {
  try {
    setSettings(updatedSettings);

    const response = await fetch(`${API_URL}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedSettings),
    });

    if (!response.ok) {
      throw new Error("Failed to update settings");
    }
  } catch (error) {
    console.error(error);
    alert("Could not save settings to database.");
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

async function handleAddUtilityBill(bill: Omit<UtilityBill, "id">) {
  try {
    const response = await fetch(`${API_URL}/utility-bills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bill),
    });

    if (!response.ok) {
      throw new Error("Failed to add utility bill");
    }

    const utilityBillsResponse = await fetch(`${API_URL}/utility-bills`);
    const updatedUtilityBills: UtilityBill[] =
      await utilityBillsResponse.json();

    const convertedData = updatedUtilityBills.map((bill) => ({
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
    alert("Could not add utility bill to database.");
  }
}

async function handleAddRentBill(bill: Omit<RentBill, "id">) {
  try {
    const response = await fetch(`${API_URL}/rent-bills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bill),
    });

    if (!response.ok) {
      throw new Error("Failed to add rent bill");
    }

    const rentBillsResponse = await fetch(`${API_URL}/rent-bills`);
    const updatedRentBills: RentBill[] = await rentBillsResponse.json();

    const convertedData = updatedRentBills.map((bill) => ({
      ...bill,
      rentAmount: Number(bill.rentAmount),
      previousUnpaidBalance: Number(bill.previousUnpaidBalance),
      amountPaid: Number(bill.amountPaid),
    }));

    setRentBills(convertedData);
  } catch (error) {
    console.error(error);
    alert("Could not add rent bill to database.");
  }
}

async function handleDeleteUtilityBill(billId: number) {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this utility bill?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/utility-bills/${billId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete utility bill");
    }

    setUtilityBills((currentBills) =>
      currentBills.filter((bill) => bill.id !== billId)
    );
  } catch (error) {
    console.error(error);
    alert("Could not delete utility bill from database.");
  }
}

async function handleDeleteRentBill(billId: number) {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this rent bill?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/rent-bills/${billId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete rent bill");
    }

    setRentBills((currentBills) =>
      currentBills.filter((bill) => bill.id !== billId)
    );
  } catch (error) {
    console.error(error);
    alert("Could not delete rent bill from database.");
  }
}

 

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
    <div className="section-title-row">
      <div>
        <h2>Utility Bills</h2>
        <p>Review monthly water and electricity bills.</p>
      </div>

      <button
        className="primary-button"
        onClick={() => setActivePage("addUtility")}
      >
        + Add Utility Bill
      </button>
    </div>

    {isLoadingUtilityBills ? (
      <p>Loading utility bills...</p>
    ) : (
      <div className="bill-grid">
{utilityBills.map((bill) => {          const tenant = tenants.find(
            (tenant) => tenant.id === bill.tenantId
          );

          if (!tenant) {
            return null;
          }

          return (
<UtilityBillCard
  key={bill.id}
  tenant={tenant}
  bill={bill}
  onDeleteBill={handleDeleteUtilityBill}
/>          );
        })}

       {utilityBills.length === 0 && (
  <p>No utility bills found.</p>
)}
      </div>
    )}
  </section>
)}

{activePage === "addUtility" && (
  <section className="page-section">
    <div className="section-title-row">
      <div>
        <h2>Add Utility Bill</h2>
        <p>Create a new monthly water and electricity bill.</p>
      </div>

      <button
        className="secondary-button"
        onClick={() => setActivePage("utility")}
      >
        Back to Utility Bills
      </button>
    </div>

    <div className="form-card">
      <h3>New Utility Bill</h3>

   <AddUtilityBillForm
  tenants={tenants}
  utilityBills={utilityBills}
  waterRate={settings.waterRate}
  electricRate={settings.electricRate}
  utilityDueDay={settings.utilityDueDay}
  onAddUtilityBill={async (bill) => {
    await handleAddUtilityBill(bill);
    setActivePage("utility");
  }}
/>
    </div>
  </section>
)}

   {activePage === "rent" && (
  <section className="page-section">
    <div className="section-title-row">
      <div>
        <h2>Rent Bills</h2>
        <p>Review monthly room rent bills.</p>
      </div>

      <button
        className="primary-button"
        onClick={() => setActivePage("addRent")}
      >
        + Add Rent Bill
      </button>
    </div>

    {isLoadingRentBills ? (
      <p>Loading rent bills...</p>
    ) : (
      <div className="bill-grid">
        {rentBills.map((bill) => {
          const tenant = tenants.find(
            (tenant) => tenant.id === bill.tenantId
          );

          if (!tenant) {
            return null;
          }

          return (
<RentBillCard
  key={bill.id}
  tenant={tenant}
  bill={bill}
  onDeleteBill={handleDeleteRentBill}
/>          );
        })}

        {rentBills.length === 0 && <p>No rent bills found.</p>}
      </div>
    )}
  </section>
)}

{activePage === "addRent" && (
  <section className="page-section">
    <div className="section-title-row">
      <div>
        <h2>Add Rent Bill</h2>
        <p>Create a new monthly rent bill.</p>
      </div>

      <button
        className="secondary-button"
        onClick={() => setActivePage("rent")}
      >
        Back to Rent Bills
      </button>
    </div>

    <div className="form-card">
      <h3>New Rent Bill</h3>

      <AddRentBillForm
        tenants={tenants}
        rentDueDay={settings.rentDueDay}
        onAddRentBill={async (bill) => {
          await handleAddRentBill(bill);
          setActivePage("rent");
        }}
      />
    </div>
  </section>
)}

       {activePage === "settings" && (
  <>
    {isLoadingSettings ? (
      <p>Loading settings...</p>
    ) : (
      <SettingsPage
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    )}
  </>
)}
      </main>
    </div>
  );
}

export default App;