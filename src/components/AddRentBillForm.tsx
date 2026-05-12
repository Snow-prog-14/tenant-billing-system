import { useEffect, useState } from "react";
import type { RentBill, Tenant } from "../types/billing";

type AddRentBillFormProps = {
  tenants: Tenant[];
  rentDueDay: number;
  onAddRentBill: (bill: Omit<RentBill, "id">) => void;
};

function formatDateLong(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toInputDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function getRentPeriodFromMonth(monthValue: string) {
  if (!monthValue) {
    return "";
  }

  const [year, month] = monthValue.split("-").map(Number);

  const startDate = new Date(year, month - 2, 25);
  const endDate = new Date(year, month - 1, 25);

  return `${formatDateLong(startDate)} – ${formatDateLong(endDate)}`;
}

function getRentDueDateFromMonth(monthValue: string, rentDueDay: number) {
  if (!monthValue) {
    return "";
  }

  const [year, month] = monthValue.split("-").map(Number);

  const dueDate = new Date(year, month, rentDueDay);

  return toInputDate(dueDate);
}

function AddRentBillForm({
  tenants,
  rentDueDay,
  onAddRentBill,
}: AddRentBillFormProps) {
  const [tenantId, setTenantId] = useState("");
  const [billingMonth, setBillingMonth] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [rentAmount, setRentAmount] = useState("3000");
  const [previousUnpaidBalance, setPreviousUnpaidBalance] = useState("0");
  const [amountPaid, setAmountPaid] = useState("0");
  const [rentPaidDate, setRentPaidDate] = useState("");

  const selectedTenant = tenants.find((tenant) => tenant.id === Number(tenantId));

  useEffect(() => {
    if (!selectedTenant) {
      setRentAmount("3000");
      return;
    }

    setRentAmount(String(selectedTenant.monthlyRent));
  }, [selectedTenant]);

  useEffect(() => {
    if (!billingMonth) {
      setBillingPeriod("");
      setDueDate("");
      return;
    }

    setBillingPeriod(getRentPeriodFromMonth(billingMonth));
    setDueDate(getRentDueDateFromMonth(billingMonth, rentDueDay));
  }, [billingMonth, rentDueDay]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tenantId || !billingPeriod.trim() || !dueDate || !rentAmount) {
      alert("Please complete all required fields.");
      return;
    }

    onAddRentBill({
      tenantId: Number(tenantId),
      billingPeriod: billingPeriod.trim(),
      dueDate,
      rentAmount: Number(rentAmount),
      previousUnpaidBalance: Number(previousUnpaidBalance),
      amountPaid: Number(amountPaid),
      rentPaidDate: rentPaidDate || null,
    });

    setTenantId("");
    setBillingMonth("");
    setBillingPeriod("");
    setDueDate("");
    setRentAmount("3000");
    setPreviousUnpaidBalance("0");
    setAmountPaid("0");
    setRentPaidDate("");
  }

  return (
    <form className="utility-form-modern" onSubmit={handleSubmit}>
      <div className="form-section full-span">
        <div className="form-section-header">
          <div>
            <span>Step 1</span>
            <h4>Tenant and Rent Cycle</h4>
          </div>

          {selectedTenant && (
            <strong>
              Room {selectedTenant.roomNo} · {selectedTenant.name}
            </strong>
          )}
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label htmlFor="rentTenant">Tenant</label>
            <select
              id="rentTenant"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
            >
              <option value="">Select tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  Room {tenant.roomNo} - {tenant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rentBillingMonth">Billing Month</label>
            <input
              id="rentBillingMonth"
              type="month"
              value={billingMonth}
              onChange={(event) => setBillingMonth(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="rentDueDate">Due Date</label>
            <input
              id="rentDueDate"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rentBillingPeriod">Billing Period</label>
          <input
            id="rentBillingPeriod"
            type="text"
            value={billingPeriod}
            onChange={(event) => setBillingPeriod(event.target.value)}
            placeholder="Auto-filled from billing month"
          />
        </div>
      </div>

      <div className="form-section full-span">
        <div className="form-section-header">
          <div>
            <span>Step 2</span>
            <h4>Rent Payment Details</h4>
          </div>
        </div>

       <div className="form-grid-4">
  <div className="form-group">
    <label htmlFor="rentAmount">Rent Amount</label>
    <input
      id="rentAmount"
      type="number"
      step="0.01"
      value={rentAmount}
      onChange={(event) => setRentAmount(event.target.value)}
    />
  </div>

  <div className="form-group">
    <label htmlFor="rentPreviousBalance">Previous Balance</label>
    <input
      id="rentPreviousBalance"
      type="number"
      step="0.01"
      value={previousUnpaidBalance}
      onChange={(event) => setPreviousUnpaidBalance(event.target.value)}
    />
  </div>

  <div className="form-group">
    <label htmlFor="rentAmountPaid">Amount Paid</label>
    <input
      id="rentAmountPaid"
      type="number"
      step="0.01"
      value={amountPaid}
      onChange={(event) => setAmountPaid(event.target.value)}
    />
  </div>

  <div className="form-group">
    <label htmlFor="rentPaidDate">Rent Date Paid</label>
    <input
      id="rentPaidDate"
      type="date"
      value={rentPaidDate}
      onChange={(event) => setRentPaidDate(event.target.value)}
    />
  </div>

  <button className="primary-button form-submit-button" type="submit">
    Add Rent Bill
  </button>
</div>
      </div>
    </form>
  );
}

export default AddRentBillForm;