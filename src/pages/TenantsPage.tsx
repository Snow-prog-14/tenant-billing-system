import AddTenantForm from "../components/AddTenantForm";
import type { Tenant } from "../types/billing";
import { formatPeso } from "../utils/billingCalculations";

type TenantsPageProps = {
  tenants: Tenant[];
  onAddTenant: (tenant: Tenant) => void;
  onDeleteTenant: (tenantId: number) => void;
  onViewTenant: (tenantId: number) => void;
};

function TenantsPage({
  tenants,
  onAddTenant,
  onDeleteTenant,
  onViewTenant,
}: TenantsPageProps) {
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
        <AddTenantForm onAddTenant={onAddTenant} />
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Room No.</th>
              <th>Tenant Name</th>
              <th>Monthly Rent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td>{tenant.roomNo}</td>
                <td>{tenant.name}</td>
                <td>{formatPeso(Number(tenant.monthlyRent))}</td>
                <td>
                  <span className={`status-badge ${tenant.status}`}>
                    {tenant.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="secondary-button compact-button"
                      onClick={() => onViewTenant(tenant.id)}
                    >
                      View
                    </button>

                    <button
                      className="danger-button compact-button"
                      onClick={() => onDeleteTenant(tenant.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {tenants.length === 0 && (
              <tr>
                <td colSpan={5}>No tenants found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TenantsPage;