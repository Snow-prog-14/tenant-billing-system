import { useEffect, useState } from "react";
import AddRentBillForm from "./components/AddRentBillForm";
import AddUtilityBillForm from "./components/AddUtilityBillForm";
import RentBillCard from "./components/RentBillCard";
import Sidebar from "./components/Sidebar";
import UtilityBillCard from "./components/UtilityBillCard";
import SettingsPage from "./pages/SettingsPage";
import TenantDetailsPage from "./pages/TenantDetailsPage";
import TenantsPage from "./pages/TenantsPage";
import type {
  AppMode,
  AuthResponse,
  BillingSettings,
  CalendarMonth,
  Page,
  Payment,
  RentBill,
  Tenant,
  UtilityBill,
} from "./types/billing";
import {
  calculateElectricBill,
  calculateWaterBill,
  formatPeso,
} from "./utils/billingCalculations";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [mode, setMode] = useState<AppMode>("demo");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [rentBills, setRentBills] = useState<RentBill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [calendarMonths, setCalendarMonths] = useState<CalendarMonth[]>([]);

  const [isLoadingTenants, setIsLoadingTenants] = useState(true);
  const [isLoadingUtilityBills, setIsLoadingUtilityBills] = useState(true);
  const [isLoadingRentBills, setIsLoadingRentBills] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);

  const [settings, setSettings] = useState<BillingSettings>({
    waterRate: 42.6,
    electricRate: 16,
    defaultMonthlyRent: 3000,
    utilityDueDay: 2,
    rentDueDay: 5,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchTenants();
    fetchUtilityBills();
    fetchRentBills();
    fetchPayments();
    fetchCalendarMonths();
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === "L") {
        event.preventDefault();
        setIsLoginModalOpen(true);
      }
      if (event.key === "Escape") {
        setIsLoginModalOpen(false);
        setLoginPassword("");
        setLoginError("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
      if (response.ok) {
        const data: AuthResponse = await response.json();
        setMode(data.mode);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      const data: AuthResponse = await response.json();
      setMode(data.mode);
      setIsLoginModalOpen(false);
      setLoginPassword("");
    } catch (error: any) {
      setLoginError(error.message);
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
      setMode("demo");
      setActivePage("dashboard");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function handleLogoClick() {
    if (mode === "personal") return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;

    if (timeSinceLastTap < 3000) {
      const newCount = logoTapCount + 1;
      if (newCount >= 5) {
        setIsLoginModalOpen(true);
        setLogoTapCount(0);
      } else {
        setLogoTapCount(newCount);
      }
    } else {
      setLogoTapCount(1);
    }
    setLastTapTime(now);
  }

  async function fetchCalendarMonths() {
    try {
      const response = await fetch(`${API_URL}/calendar/months`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch calendar months");
      const data: CalendarMonth[] = await response.json();
      setCalendarMonths(data);
    } catch (error) {
      console.error(error);
      alert("Could not load calendar months from database.");
    }
  }

  async function fetchSettings() {
    try {
      const response = await fetch(`${API_URL}/settings`, { credentials: "include" });

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

  async function fetchTenants() {
    try {
      setIsLoadingTenants(true);
      const response = await fetch(`${API_URL}/tenants`, { credentials: "include" });

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

  async function fetchUtilityBills() {
    try {
      setIsLoadingUtilityBills(true);
      const response = await fetch(`${API_URL}/utility-bills`, { credentials: "include" });

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

  async function fetchRentBills() {
    try {
      setIsLoadingRentBills(true);
      const response = await fetch(`${API_URL}/rent-bills`, { credentials: "include" });

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

  async function fetchPayments() {
    try {
      setIsLoadingPayments(true);
      const response = await fetch(`${API_URL}/payments`, { credentials: "include" });

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data: Payment[] = await response.json();

      const convertedData = data.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      }));

      setPayments(convertedData);
    } catch (error) {
      console.error(error);
      alert("Could not load payments from database.");
    } finally {
      setIsLoadingPayments(false);
    }
  }

  function getPaymentsForBill(
    billType: Payment["billType"],
    billId: number
  ): Payment[] {
    return payments.filter(
      (payment) => payment.billType === billType && payment.billId === billId
    );
  }

  function getPaymentTotal(
    billType: Payment["billType"],
    billId: number
  ): number {
    return getPaymentsForBill(billType, billId).reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
  }

  const totalUtilityDue = utilityBills.reduce((sum, bill) => {
    const electricAmount = calculateElectricBill(bill);
    const waterAmount = calculateWaterBill(bill);

    const electricPaid = getPaymentTotal("utility_electric", bill.id);
    const waterPaid = getPaymentTotal("utility_water", bill.id);

    const electricBalance = Math.max(electricAmount - electricPaid, 0);
    const waterBalance = Math.max(waterAmount - waterPaid, 0);

    return sum + electricBalance + waterBalance;
  }, 0);

  const totalRentDue = rentBills.reduce((sum, bill) => {
    const rentPaid = getPaymentTotal("rent", bill.id);
    const rentBalance = Math.max(Number(bill.rentAmount) - rentPaid, 0);

    return sum + rentBalance;
  }, 0);

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
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to add tenant");
      }

      await fetchTenants();
    } catch (error) {
      console.error(error);
      alert("Could not add tenant to database.");
    }
  }

  async function handleUpdateTenant(updatedTenant: Tenant) {
  try {
    const response = await fetch(`${API_URL}/tenants/${updatedTenant.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: updatedTenant.name,
        roomNo: updatedTenant.roomNo,
        monthlyRent: updatedTenant.monthlyRent,
        status: updatedTenant.status,
      }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to update tenant");
    }

    setTenants((currentTenants) =>
      currentTenants.map((tenant) =>
        tenant.id === updatedTenant.id ? updatedTenant : tenant
      )
    );
  } catch (error) {
    console.error(error);
    alert("Could not update tenant in database.");
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
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete tenant");
      }

      setTenants((currentTenants) =>
        currentTenants.filter((tenant) => tenant.id !== tenantId)
      );

      setUtilityBills((currentBills) =>
        currentBills.filter((bill) => bill.tenantId !== tenantId)
      );

      setRentBills((currentBills) =>
        currentBills.filter((bill) => bill.tenantId !== tenantId)
      );

      setPayments((currentPayments) =>
        currentPayments.filter((payment) => payment.tenantId !== tenantId)
      );

      if (selectedTenantId === tenantId) {
        setSelectedTenantId(null);
        setActivePage("tenants");
      }
    } catch (error) {
      console.error(error);
      alert("Could not delete tenant from database.");
    }
  }

  function handleViewTenant(tenantId: number) {
    setSelectedTenantId(tenantId);
    setActivePage("tenantDetails");
  }

  async function handleAddUtilityBill(bill: Omit<UtilityBill, "id">) {
    try {
      const response = await fetch(`${API_URL}/utility-bills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bill),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to add utility bill");
      }

      await fetchUtilityBills();
    } catch (error) {
      console.error(error);
      alert("Could not add utility bill to database.");
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
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete utility bill");
      }

      setUtilityBills((currentBills) =>
        currentBills.filter((bill) => bill.id !== billId)
      );

      setPayments((currentPayments) =>
        currentPayments.filter(
          (payment) =>
            !(
              payment.billId === billId &&
              (payment.billType === "utility_electric" ||
                payment.billType === "utility_water")
            )
        )
      );
    } catch (error) {
      console.error(error);
      alert("Could not delete utility bill from database.");
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
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to add rent bill");
      }

      await fetchRentBills();
    } catch (error) {
      console.error(error);
      alert("Could not add rent bill to database.");
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
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete rent bill");
      }

      setRentBills((currentBills) =>
        currentBills.filter((bill) => bill.id !== billId)
      );

      setPayments((currentPayments) =>
        currentPayments.filter(
          (payment) =>
            !(payment.billId === billId && payment.billType === "rent")
        )
      );
    } catch (error) {
      console.error(error);
      alert("Could not delete rent bill from database.");
    }
  }

  async function handleAddPayment(payment: Omit<Payment, "id">) {
    try {
      const response = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payment),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to add payment");
      }

      await fetchPayments();
    } catch (error) {
      console.error(error);
      alert("Could not add payment to database.");
    }
  }

  async function handleDeletePayment(paymentId: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/payments/${paymentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete payment");
      }

      setPayments((currentPayments) =>
        currentPayments.filter((payment) => payment.id !== paymentId)
      );
    } catch (error) {
      console.error(error);
      alert("Could not delete payment from database.");
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
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error(error);
      alert("Could not save settings to database.");
    }
  }

  const selectedTenant = selectedTenantId
    ? tenants.find((tenant) => tenant.id === selectedTenantId)
    : null;

  return (
    <div className="app-layout">
      <Sidebar 
        activePage={activePage} 
        onChangePage={setActivePage} 
        mode={mode} 
        onLogout={handleLogout}
        onLogoClick={handleLogoClick}
      />

      <main>
        <header className="app-header">
          <h1>Tenant Billing System</h1>
          <p>Monthly utility and rent billing for tenants</p>
        </header>

        {isLoginModalOpen && (
          <div className="login-modal-overlay">
            <div className="login-modal">
              <h3>Private Login</h3>
              <p>Enter administrative password to access personal records.</p>
              
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="adminPassword">Password</label>
                  <input
                    id="adminPassword"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    autoFocus
                  />
                </div>
                
                {loginError && <p className="login-error-message">{loginError}</p>}
                
                <div className="modal-actions">
                  <button type="button" className="secondary-button" onClick={() => setIsLoginModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-button">
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activePage === "dashboard" && (
          <section className="page-section">
            <div className="dashboard-hero">
              <div>
                <p className="eyebrow">Overview</p>
                <h2>Dashboard</h2>
                <p>
                  Track tenants, rent balances, utility collections, and partial
                  payments in one place.
                </p>
              </div>

              <div className="hero-total">
                <span>Total Balance</span>
                <strong>{formatPeso(totalUtilityDue + totalRentDue)}</strong>
              </div>
            </div>

   <div className="dashboard-pills-grid">
  <article className="dashboard-pill dashboard-pill--pink">
    <div className="dashboard-pill__top">
      <span className="dashboard-pill__chip">Overview</span>
      <span className="dashboard-pill__mini">01</span>
    </div>

    <div className="dashboard-pill__content">
      <p className="dashboard-pill__title">Total Tenants</p>
<h3 className="dashboard-pill__value">
  {isLoadingTenants ? "..." : tenants.length}
</h3>      <p className="dashboard-pill__meta">Currently registered tenants</p>
    </div>
  </article>

  <article className="dashboard-pill dashboard-pill--green">
    <div className="dashboard-pill__top">
      <span className="dashboard-pill__chip">Utilities</span>
      <span className="dashboard-pill__mini">02</span>
    </div>

    <div className="dashboard-pill__content">
      <p className="dashboard-pill__title">Total Utility Balance</p>
      <h3 className="dashboard-pill__value">{formatPeso(totalUtilityDue)}</h3>
      <p className="dashboard-pill__meta">Remaining water and electricity balance</p>
    </div>
  </article>

  <article className="dashboard-pill dashboard-pill--orange">
    <div className="dashboard-pill__top">
      <span className="dashboard-pill__chip">Rent</span>
      <span className="dashboard-pill__mini">03</span>
    </div>

    <div className="dashboard-pill__content">
      <p className="dashboard-pill__title">Total Rent Balance</p>
      <h3 className="dashboard-pill__value">{formatPeso(totalRentDue)}</h3>
      <p className="dashboard-pill__meta">Remaining rent balance</p>
    </div>
  </article>

  <article className="dashboard-pill dashboard-pill--blue">
    <div className="dashboard-pill__top">
      <span className="dashboard-pill__chip">Summary</span>
      <span className="dashboard-pill__mini">04</span>
    </div>

    <div className="dashboard-pill__content">
      <p className="dashboard-pill__title">Total Balance</p>
      <h3 className="dashboard-pill__value">
        {formatPeso(totalUtilityDue + totalRentDue)}
      </h3>
      <p className="dashboard-pill__meta">Total remaining amount to collect</p>
    </div>
  </article>
</div>
          </section>
        )}

        {activePage === "tenants" && (
        <TenantsPage
  tenants={tenants}
  onAddTenant={handleAddTenant}
  onDeleteTenant={handleDeleteTenant}
  onUpdateTenant={handleUpdateTenant}
  onViewTenant={handleViewTenant}
  mode={mode}
/>
        )}

        {activePage === "tenantDetails" && (
          <>
            {selectedTenant ? (
              <TenantDetailsPage
                tenant={selectedTenant}
                utilityBills={utilityBills}
                rentBills={rentBills}
                payments={payments}
                onBack={() => setActivePage("tenants")}
                onDeleteUtilityBill={handleDeleteUtilityBill}
                onDeleteRentBill={handleDeleteRentBill}
                onAddPayment={handleAddPayment}
                onDeletePayment={handleDeletePayment}
                mode={mode}
              />
            ) : (
              <section className="page-section">
                <p>Tenant not found.</p>
                <button
                  className="secondary-button"
                  onClick={() => setActivePage("tenants")}
                >
                  Back to Tenants
                </button>
              </section>
            )}
          </>
        )}

        {activePage === "utility" && (
          <section className="page-section">
            <div className="section-title-row">
              <div>
                <h2>Utility Bills</h2>
                <p>Review monthly water and electricity bills.</p>
              </div>

           {mode === "personal" && (
             <button
               className="primary-button page-action-button"
               onClick={() => setActivePage("addUtility")}
             >
               + Add Utility Bill
             </button>
           )}
            </div>

            {isLoadingUtilityBills ? (
              <p>Loading utility bills...</p>
            ) : (
              <div className="bill-grid">
                {utilityBills.map((bill) => {
                  const tenant = tenants.find(
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
  payments={payments.filter(
    (payment) =>
      payment.billId === bill.id &&
      (payment.billType === "utility_electric" ||
        payment.billType === "utility_water")
  )}
  onDeleteBill={mode === "personal" ? handleDeleteUtilityBill : undefined}
/>
                  );
                })}

                {utilityBills.length === 0 && <p>No utility bills found.</p>}
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
                calendarMonths={calendarMonths}
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
{mode === "personal" && (
  <button
    className="primary-button page-action-button"
    onClick={() => setActivePage("addRent")}
  >
    + Add Rent Bill
  </button>
)}
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
                      payments={payments.filter(
                        (payment) =>
                          payment.billId === bill.id &&
                          payment.billType === "rent"
                      )}
                      onDeleteBill={mode === "personal" ? handleDeleteRentBill : undefined}
                    />
                  );
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
                calendarMonths={calendarMonths}
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

        {isLoadingPayments && <span className="sr-only">Loading payments...</span>}
      </main>
    </div>
  );
}

export default App;