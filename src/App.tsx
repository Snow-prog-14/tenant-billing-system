import UtilityBillCard from "./components/UtilityBillCard";
import { tenants, utilityBills } from "./data/sampleData";

function App() {
  return (
    <main>
      <header className="app-header">
        <h1>Tenant Billing System</h1>
        <p>Monthly utility billing for tenants</p>
      </header>

      <div className="bill-grid">
        {utilityBills.map((bill) => {
          const tenant = tenants.find((tenant) => tenant.id === bill.tenantId);

          if (!tenant) {
            return null;
          }

          return <UtilityBillCard key={bill.id} tenant={tenant} bill={bill} />;
        })}
      </div>
    </main>
  );
}

export default App;