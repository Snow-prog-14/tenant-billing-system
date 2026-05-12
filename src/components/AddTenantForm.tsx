import { useState } from "react";
import type { Tenant } from "../types/billing";

type AddTenantFormProps = {
  onAddTenant: (tenant: Tenant) => void;
};

function AddTenantForm({ onAddTenant }: AddTenantFormProps) {
  const [name, setName] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("3000");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !roomNo.trim() || !monthlyRent.trim()) {
      alert("Please complete all fields.");
      return;
    }

    const newTenant: Tenant = {
      id: 0,
      name: name.trim(),
      roomNo: roomNo.trim(),
      monthlyRent: Number(monthlyRent),
      status: "active",
    };

    onAddTenant(newTenant);

    setName("");
    setRoomNo("");
    setMonthlyRent("3000");
  }

  return (
    <form className="tenant-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="tenantName">Tenant Name</label>
        <input
          id="tenantName"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter tenant name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="roomNo">Room No.</label>
        <input
          id="roomNo"
          type="text"
          value={roomNo}
          onChange={(event) => setRoomNo(event.target.value)}
          placeholder="Example: 3"
        />
      </div>

      <div className="form-group">
        <label htmlFor="monthlyRent">Monthly Rent</label>
        <input
          id="monthlyRent"
          type="number"
          value={monthlyRent}
          onChange={(event) => setMonthlyRent(event.target.value)}
          placeholder="Example: 3000"
        />
      </div>

      <button className="primary-button" type="submit">
        Add Tenant
      </button>
    </form>
  );
}

export default AddTenantForm;