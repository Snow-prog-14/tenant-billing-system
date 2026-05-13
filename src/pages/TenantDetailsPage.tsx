import { useMemo, useState } from "react";
import RentBillCard from "../components/RentBillCard";
import UtilityBillCard from "../components/UtilityBillCard";
import type { AppMode, Payment, RentBill, Tenant, UtilityBill } from "../types/billing";
import {
  calculateElectricBill,
  calculateWaterBill,
  formatPeso,
} from "../utils/billingCalculations";

type TenantDetailsPageProps = {
  tenant: Tenant;
  utilityBills: UtilityBill[];
  rentBills: RentBill[];
  payments: Payment[];
  onBack: () => void;
  onDeleteUtilityBill: (billId: number) => void;
  onDeleteRentBill: (billId: number) => void;
  onAddPayment: (payment: Omit<Payment, "id">) => void;
  onDeletePayment: (paymentId: number) => void;
  mode: AppMode;
};

type SelectedReceipt =
  | {
      type: "utility";
      id: number;
    }
  | {
      type: "rent";
      id: number;
    }
  | null;

type LedgerRow = {
  monthKey: string;
  monthLabel: string;
  utilityBill?: UtilityBill;
  rentBill?: RentBill;
};

function getMonthKeyFromDate(dateText: string) {
  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function getMonthLabelFromDate(dateText: string) {
  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getMonthKeyFromBillingPeriod(period: string) {
  const parts = period.split("–");

  const endDateText = parts.length > 1 ? parts[1].trim() : period;
  const endDate = new Date(endDateText);

  if (Number.isNaN(endDate.getTime())) {
    return period;
  }

  return `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function getMonthLabelFromBillingPeriod(period: string) {
  const parts = period.split("–");

  const endDateText = parts.length > 1 ? parts[1].trim() : period;
  const endDate = new Date(endDateText);

  if (Number.isNaN(endDate.getTime())) {
    return period;
  }

  return endDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}


function TenantDetailsPage({
  tenant,
  utilityBills,
  rentBills,
  payments,
  onBack,
  onDeleteUtilityBill,
  onDeleteRentBill,
  onAddPayment,
  onDeletePayment,
  mode,
}: TenantDetailsPageProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<SelectedReceipt>(null);
  const [activePaymentRow, setActivePaymentRow] = useState<string | null>(null);

  // Payment form state
  const [payType, setPayType] = useState<Payment["billType"]>("rent");
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payNotes, setPayNotes] = useState("");

  const tenantUtilityBills = useMemo(() => {
    return utilityBills
      .filter((bill) => bill.tenantId === tenant.id)
      .sort(
        (a, b) =>
          new Date(a.billingDate).getTime() - new Date(b.billingDate).getTime()
      );
  }, [tenant.id, utilityBills]);

  const tenantRentBills = useMemo(() => {
    return rentBills
      .filter((bill) => bill.tenantId === tenant.id)
      .sort((a, b) => a.billingPeriod.localeCompare(b.billingPeriod));
  }, [tenant.id, rentBills]);

  const ledgerRows = useMemo(() => {
    const rowMap = new Map<string, LedgerRow>();

    tenantUtilityBills.forEach((bill) => {
      const monthKey = getMonthKeyFromDate(bill.billingDate);

      rowMap.set(monthKey, {
        monthKey,
        monthLabel: getMonthLabelFromDate(bill.billingDate),
        utilityBill: bill,
        rentBill: rowMap.get(monthKey)?.rentBill,
      });
    });

    tenantRentBills.forEach((bill) => {
      const monthKey = getMonthKeyFromBillingPeriod(bill.billingPeriod);

      rowMap.set(monthKey, {
        monthKey,
        monthLabel:
          rowMap.get(monthKey)?.monthLabel ||
          getMonthLabelFromBillingPeriod(bill.billingPeriod),
        utilityBill: rowMap.get(monthKey)?.utilityBill,
        rentBill: bill,
      });
    });

    return Array.from(rowMap.values()).sort((a, b) =>
      a.monthKey.localeCompare(b.monthKey)
    );
  }, [tenantUtilityBills, tenantRentBills]);

  const getPaymentsForBill = (type: Payment["billType"], id: number) =>
    payments.filter((p) => p.billType === type && p.billId === id);

  const sumPayments = (pList: Payment[]) =>
    pList.reduce((sum, p) => sum + p.amount, 0);

  const getStatusDisplay = (total: number, paid: number, pList: Payment[]) => {
    if (total <= 0) return "";
    if (paid >= total) {
      const latestDate = pList.length > 0 
        ? pList.sort((a, b) => b.datePaid.localeCompare(a.datePaid))[0].datePaid
        : "";
      return latestDate ? `Paid (${latestDate})` : "Fully Paid";
    }
    if (paid > 0) return "Partial";
    return "Unpaid";
  };

  // Calculate total balance across all bills
  const totalBalance = useMemo(() => {
    let balance = 0;
    tenantUtilityBills.forEach(bill => {
      const elec = calculateElectricBill(bill);
      const water = calculateWaterBill(bill);
      const elecPaid = sumPayments(getPaymentsForBill("utility_electric", bill.id));
      const waterPaid = sumPayments(getPaymentsForBill("utility_water", bill.id));
      balance += (elec - elecPaid) + (water - waterPaid);
    });
    tenantRentBills.forEach(bill => {
      const rentPaid = sumPayments(getPaymentsForBill("rent", bill.id));
      balance += (bill.rentAmount - rentPaid);
    });
    return balance;
  }, [tenantUtilityBills, tenantRentBills, payments]);

  const handlePaymentSubmit = (e: React.FormEvent, row: LedgerRow) => {
    e.preventDefault();
    const billId = payType === "rent" ? row.rentBill?.id : row.utilityBill?.id;
    if (!billId || !payAmount) return;

    onAddPayment({
      tenantId: tenant.id,
      billType: payType,
      billId,
      amount: Number(payAmount),
      datePaid: payDate,
      notes: payNotes,
    });

    setPayAmount("");
    setPayNotes("");
  };

  const selectedUtilityReceipt =
    selectedReceipt?.type === "utility"
      ? tenantUtilityBills.find((bill) => bill.id === selectedReceipt.id)
      : null;

  const selectedRentReceipt =
    selectedReceipt?.type === "rent"
      ? tenantRentBills.find((bill) => bill.id === selectedReceipt.id)
      : null;

  return (
    <section className="page-section tenant-ledger-page">
      <div className="tenant-profile-hero">
        <div>
         <button className="back-button" onClick={onBack} type="button">
  <span>←</span>
  Back to Tenants
</button>

          <p className="eyebrow">Tenant Ledger</p>
          <h2>{tenant.name}</h2>
          <p>
            Room {tenant.roomNo} · Monthly Rent{" "}
            {formatPeso(Number(tenant.monthlyRent))}
          </p>
        </div>

        <div className="tenant-balance-card">
          <span>Total Balance</span>
          <strong>{formatPeso(totalBalance)}</strong>
        </div>
      </div>

      <div className="ledger-board">
        <div className="ledger-board-header">
          <div>
            <h3>Monthly Billing Tracker</h3>
            <p>Track balances and installment payments per month.</p>
          </div>
        </div>

        <div className="ledger-main-table-wrap">
          <table className="sheet-table ledger-main-table partial-payment-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Electricity</th>
                <th>Elec Paid</th>
                <th>Elec Bal</th>
                <th>Water</th>
                <th>Water Paid</th>
                <th>Water Bal</th>
                <th>Rent</th>
                <th>Rent Paid</th>
                <th>Rent Bal</th>
                <th>Receipt</th>
                <th>Payment</th>
              </tr>
            </thead>

            <tbody>
              {ledgerRows.map((row) => {
                const uBill = row.utilityBill;
                const rBill = row.rentBill;

                const elecAmount = uBill ? calculateElectricBill(uBill) : 0;
                const waterAmount = uBill ? calculateWaterBill(uBill) : 0;
                const rentAmount = rBill ? rBill.rentAmount : 0;

                const elecPayments = uBill ? getPaymentsForBill("utility_electric", uBill.id) : [];
                const waterPayments = uBill ? getPaymentsForBill("utility_water", uBill.id) : [];
                const rentPayments = rBill ? getPaymentsForBill("rent", rBill.id) : [];

                const elecPaid = sumPayments(elecPayments);
                const waterPaid = sumPayments(waterPayments);
                const rentPaid = sumPayments(rentPayments);

                const elecBal = elecAmount - elecPaid;
                const waterBal = waterAmount - waterPaid;
                const rentBal = rentAmount - rentPaid;

                const isExpanded = activePaymentRow === row.monthKey;

                return (
                  <>
                    <tr key={row.monthKey} className={isExpanded ? "row-highlight" : ""}>
                      <td>{row.monthLabel}</td>
                      <td>{uBill ? formatPeso(elecAmount) : "-"}</td>
                      <td className="status-cell">{getStatusDisplay(elecAmount, elecPaid, elecPayments)}</td>
                      <td className={elecBal > 0 ? "balance-due" : ""}>{uBill ? formatPeso(elecBal) : "-"}</td>
                      
                      <td>{uBill ? formatPeso(waterAmount) : "-"}</td>
                      <td className="status-cell">{getStatusDisplay(waterAmount, waterPaid, waterPayments)}</td>
                      <td className={waterBal > 0 ? "balance-due" : ""}>{uBill ? formatPeso(waterBal) : "-"}</td>
                      
                      <td>{rBill ? formatPeso(rentAmount) : "-"}</td>
                      <td className="status-cell">{getStatusDisplay(rentAmount, rentPaid, rentPayments)}</td>
                      <td className={rentBal > 0 ? "balance-due" : ""}>{rBill ? formatPeso(rentBal) : "-"}</td>

                      <td>
                        <div className="receipt-actions">
                          {uBill && (
                            <button className="secondary-button compact-button" onClick={() => setSelectedReceipt({ type: "utility", id: uBill.id })}>U</button>
                          )}
                          {rBill && (
                            <button className="secondary-button compact-button" onClick={() => setSelectedReceipt({ type: "rent", id: rBill.id })}>R</button>
                          )}
                        </div>
                      </td>
                      <td>
                        {mode === "personal" && (
                          <button 
                            className={`compact-button ${isExpanded ? "primary-button" : "secondary-button"}`}
                            onClick={() => setActivePaymentRow(isExpanded ? null : row.monthKey)}
                          >
                            {isExpanded ? "Close" : "Pay"}
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {isExpanded && mode === "personal" && (
                      <tr key={`${row.monthKey}-expanded`} className="expanded-payment-row">
                        <td colSpan={12}>
                          <div className="payment-management-grid">
                            <form className="mini-payment-form" onSubmit={(e) => handlePaymentSubmit(e, row)}>
                              <h4>Add Payment for {row.monthLabel}</h4>
                              <div className="form-grid-2">
                                <div className="form-group">
                                  <label>Type</label>
                                  <select value={payType} onChange={(e) => setPayType(e.target.value as any)}>
                                    {uBill && <option value="utility_electric">Electricity</option>}
                                    {uBill && <option value="utility_water">Water</option>}
                                    {rBill && <option value="rent">Rent</option>}
                                  </select>
                                </div>
                                <div className="form-group">
                                  <label>Amount</label>
                                  <input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required />
                                </div>
                              </div>
                              <div className="form-grid-2">
                                <div className="form-group">
                                  <label>Date</label>
                                  <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                  <label>Notes</label>
                                  <input type="text" value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
                                </div>
                              </div>
                              <button type="submit" className="primary-button">Submit Payment</button>
                            </form>

                            <div className="payment-history-mini">
                              <h4>Payment History</h4>
                              <table className="sheet-table history-table">
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Notes</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {[...elecPayments, ...waterPayments, ...rentPayments].sort((a,b) => b.datePaid.localeCompare(a.datePaid)).map(p => (
                                    <tr key={p.id}>
                                      <td>{p.datePaid}</td>
                                      <td>{p.billType.replace("utility_", "")}</td>
                                      <td>{formatPeso(p.amount)}</td>
                                      <td>{p.notes}</td>
                                      <td>
                                        {mode === "personal" && (
                                          <button className="danger-link" onClick={() => onDeletePayment(p.id)}>Delete</button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                  {elecPayments.length + waterPayments.length + rentPayments.length === 0 && (
                                    <tr><td colSpan={5}>No payments found</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="receipt-preview-section">
        <div className="section-title-row">
          <div>
            <h3>Receipt Preview</h3>
            <p>Select Utility or Rent from the tracker table to view receipt.</p>
          </div>

          {selectedReceipt && (
            <button
              className="secondary-button"
              onClick={() => setSelectedReceipt(null)}
            >
              Hide Receipt
            </button>
          )}
        </div>

        {!selectedReceipt && (
          <div className="empty-receipt-card">
            <strong>No receipt selected</strong>
            <p>Click U or R in the receipt column above.</p>
          </div>
        )}

        {selectedUtilityReceipt && (
          <div className="receipt-preview-wrap">
            <UtilityBillCard
              tenant={tenant}
              bill={selectedUtilityReceipt}
              payments={payments.filter(p => p.billId === selectedUtilityReceipt.id && (p.billType === "utility_electric" || p.billType === "utility_water"))}
              onDeleteBill={onDeleteUtilityBill}
            />
          </div>
        )}

        {selectedRentReceipt && (
          <div className="receipt-preview-wrap">
            <RentBillCard
              tenant={tenant}
              bill={selectedRentReceipt}
              payments={payments.filter(p => p.billId === selectedRentReceipt.id && p.billType === "rent")}
              onDeleteBill={onDeleteRentBill}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default TenantDetailsPage;