import { useState } from "react";
import AddTenantForm from "../components/AddTenantForm";
import type { Tenant } from "../types/billing";
import { formatPeso } from "../utils/billingCalculations";

type TenantsPageProps = {
  tenants: Tenant[];
  onAddTenant: (tenant: Tenant) => void;
  onDeleteTenant: (tenantId: number) => void;
  onUpdateTenant: (tenant: Tenant) => void;
  onViewTenant: (tenantId: number) => void;
};

function TenantsPage({
  tenants,
  onAddTenant,
  onDeleteTenant,
  onUpdateTenant,
  onViewTenant,
}: TenantsPageProps) {
  const [editingTenantId, setEditingTenantId] = useState<number | null>(null);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRoomNo, setEditRoomNo] = useState("");
  const [editMonthlyRent, setEditMonthlyRent] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");

  function startEditTenant(tenant: Tenant) {
    setEditingTenantId(tenant.id);
    setEditName(tenant.name);
    setEditRoomNo(tenant.roomNo);
    setEditMonthlyRent(String(tenant.monthlyRent));
    setEditStatus(tenant.status);
  }

  function cancelEditTenant() {
    setEditingTenantId(null);
    setEditName("");
    setEditRoomNo("");
    setEditMonthlyRent("");
    setEditStatus("active");
  }

  function saveEditTenant(tenant: Tenant) {
    if (!editName.trim() || !editRoomNo.trim() || !editMonthlyRent) {
      alert("Please complete all tenant fields.");
      return;
    }

    onUpdateTenant({
      ...tenant,
      name: editName.trim(),
      roomNo: editRoomNo.trim(),
      monthlyRent: Number(editMonthlyRent),
      status: editStatus,
    });

    cancelEditTenant();
  }

  return (
    <section className="page-section tenants-page">
      <div className="tenants-hero">
        <div>
          <p className="eyebrow">Tenant Management</p>
          <h2>Tenants</h2>
          <p>Manage registered tenants, rooms, rent amounts, and account status.</p>
        </div>

        <div className="tenants-count-card">
          <span>Total Tenants</span>
          <strong>{tenants.length}</strong>
        </div>
      </div>

  <div className="section-title-row tenants-action-row">
  <div>
    <h2>Tenant Directory</h2>
    <p>Add, view, edit, or remove tenant records.</p>
  </div>

  <button
    className="primary-button page-action-button"
    type="button"
    onClick={() => setIsAddTenantOpen((current) => !current)}
  >
    {isAddTenantOpen ? "Close Form" : "+ Add Tenant"}
  </button>
</div>

{isAddTenantOpen && (
  <div className="tenant-panel add-tenant-panel">
    <div className="tenant-panel-header">
      <div>
        <h3>Add Tenant</h3>
        <p>Create a new tenant profile.</p>
      </div>
    </div>

    <AddTenantForm
      onAddTenant={(tenant) => {
        onAddTenant(tenant);
        setIsAddTenantOpen(false);
      }}
    />
  </div>
)}

      <div className="professional-table-card">
      <div className="tenant-panel-header">
  <div>
    <h3>Registered Tenants</h3>
    <p>Manage current tenant profiles and room assignments.</p>
  </div>
</div>

        <div className="table-scroll">
          <table className="professional-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Tenant</th>
                <th>Monthly Rent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tenants.map((tenant) => {
                const isEditing = editingTenantId === tenant.id;

                return (
                  <tr key={tenant.id}>
                    <td>
                      {isEditing ? (
                        <input
                          className="table-input"
                          value={editRoomNo}
                          onChange={(event) => setEditRoomNo(event.target.value)}
                        />
                      ) : (
                        <span className="room-pill">Room {tenant.roomNo}</span>
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          className="table-input"
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                        />
                      ) : (
                        <div className="tenant-name-cell">
                          <strong>{tenant.name}</strong>
                          <span>Tenant ID #{tenant.id}</span>
                        </div>
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          className="table-input"
                          type="number"
                          step="0.01"
                          value={editMonthlyRent}
                          onChange={(event) =>
                            setEditMonthlyRent(event.target.value)
                          }
                        />
                      ) : (
                        formatPeso(Number(tenant.monthlyRent))
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <select
                          className="table-input"
                          value={editStatus}
                          onChange={(event) =>
                            setEditStatus(event.target.value as "active" | "inactive")
                          }
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <span className={`status-badge ${tenant.status}`}>
                          {tenant.status}
                        </span>
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <div className="table-actions">
                          <button
                            className="primary-button compact-button"
                            onClick={() => saveEditTenant(tenant)}
                          >
                            Save
                          </button>

                          <button
                            className="secondary-button compact-button"
                            onClick={cancelEditTenant}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="table-actions">
                          <button
                            className="secondary-button compact-button"
                            onClick={() => onViewTenant(tenant.id)}
                          >
                            View
                          </button>

                          <button
                            className="secondary-button compact-button"
                            onClick={() => startEditTenant(tenant)}
                          >
                            Edit
                          </button>

                          <button
                            className="danger-button compact-button"
                            onClick={() => onDeleteTenant(tenant.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5}>No tenants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TenantsPage;