import AddTenantForm from "../components/AddTenantForm";
import type { Tenant } from "../types/billing";
import { formatPeso } from "../utils/billingCalculations";

type TenantsPageProps = {
  tenants: Tenant[];
  onAddTenant: (tenant: Tenant) => void;
};

function TenantsPage({ tenants, onAddTenant }: TenantsPageProps) {
  const nextTenantId =
    tenants.length > 0 ? Math.max(...tenants.map((tenant) => tenant.id)) + 1 : 1;

  return (
    <section className="page-section">
      <div className="section-title-row">
        <div>
          <h2>Tenants</h2>
          <p>List of registered tenants and their monthly rent.</p>
        </div>
      </div>

      <div className="form-card">
        <h3>Add Tenant</h3>
        <AddTenantForm
          nextTenantId={nextTenantId}
          onAddTenant={onAddTenant}
        />
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Room No.</th>
              <th>Tenant Name</th>
              <th>Monthly Rent</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td>{tenant.roomNo}</td>
                <td>{tenant.name}</td>
                <td>{formatPeso(tenant.monthlyRent)}</td>
                <td>
                  <span className={`status-badge ${tenant.status}`}>
                    {tenant.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TenantsPage;