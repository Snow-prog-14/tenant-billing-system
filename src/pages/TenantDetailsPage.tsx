import { useMemo, useState } from "react";
import RentBillCard from "../components/RentBillCard";
import UtilityBillCard from "../components/UtilityBillCard";
import type { RentBill, Tenant, UtilityBill } from "../types/billing";
import {
  calculateElectricBill,
  calculateElectricConsumption,
  calculateTotalRentDue,
  calculateTotalUtilityDue,
  calculateWaterBill,
  calculateWaterConsumption,
  formatPeso,
} from "../utils/billingCalculations";

type TenantDetailsPageProps = {
  tenant: Tenant;
  utilityBills: UtilityBill[];
  rentBills: RentBill[];
  onBack: () => void;
  onDeleteUtilityBill: (billId: number) => void;
  onDeleteRentBill: (billId: number) => void;
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

function formatPaidStatus(amountPaid: number) {
  return Number(amountPaid) > 0 ? "Paid" : "";
}

function TenantDetailsPage({
  tenant,
  utilityBills,
  rentBills,
  onBack,
  onDeleteUtilityBill,
  onDeleteRentBill,
}: TenantDetailsPageProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<SelectedReceipt>(null);

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

  const totalUtilityDue = tenantUtilityBills.reduce(
    (sum, bill) => sum + calculateTotalUtilityDue(bill),
    0
  );

  const totalRentDue = tenantRentBills.reduce(
    (sum, bill) => sum + calculateTotalRentDue(bill),
    0
  );

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
          <button className="ghost-button" onClick={onBack}>
            ← Back to Tenants
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
          <strong>{formatPeso(totalUtilityDue + totalRentDue)}</strong>
        </div>
      </div>

      <div className="tenant-summary-grid compact-summary">
        <div className="dashboard-card">
          <span>Total Utility Due</span>
          <strong>{formatPeso(totalUtilityDue)}</strong>
          <p>Water and electricity balance</p>
        </div>

        <div className="dashboard-card">
          <span>Total Rent Due</span>
          <strong>{formatPeso(totalRentDue)}</strong>
          <p>Rent balance</p>
        </div>

        <div className="dashboard-card">
          <span>Utility Records</span>
          <strong>{tenantUtilityBills.length}</strong>
          <p>Monthly utility bills</p>
        </div>

        <div className="dashboard-card">
          <span>Rent Records</span>
          <strong>{tenantRentBills.length}</strong>
          <p>Monthly rent bills</p>
        </div>
      </div>

      <div className="ledger-board">
        <div className="ledger-board-header">
          <div>
            <h3>Monthly Billing Tracker</h3>
            <p>Main payment tracker grouped by billing month.</p>
          </div>
        </div>

        <div className="ledger-main-table-wrap">
          <table className="sheet-table ledger-main-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Electricity</th>
                <th>Date Paid</th>
                <th>Water</th>
                <th>Date Paid</th>
                <th>Rent</th>
                <th>Date Paid</th>
                <th>Receipt</th>
              </tr>
            </thead>

            <tbody>
              {ledgerRows.map((row) => {
                const utilityBill = row.utilityBill;
                const rentBill = row.rentBill;

                return (
                  <tr key={row.monthKey}>
                    <td>{row.monthLabel}</td>

                    <td>
                      {utilityBill
                        ? formatPeso(calculateElectricBill(utilityBill))
                        : ""}
                    </td>

                    <td>
                      {utilityBill
                        ? formatPaidStatus(utilityBill.amountPaid)
                        : ""}
                    </td>

                    <td>
                      {utilityBill
                        ? formatPeso(calculateWaterBill(utilityBill))
                        : ""}
                    </td>

                    <td>
                      {utilityBill
                        ? formatPaidStatus(utilityBill.amountPaid)
                        : ""}
                    </td>

                    <td>{rentBill ? formatPeso(rentBill.rentAmount) : ""}</td>

                    <td>
                      {rentBill ? formatPaidStatus(rentBill.amountPaid) : ""}
                    </td>

                    <td>
                      <div className="receipt-actions">
                        {utilityBill && (
                          <button
                            className="secondary-button compact-button"
                            onClick={() =>
                              setSelectedReceipt({
                                type: "utility",
                                id: utilityBill.id,
                              })
                            }
                          >
                            Utility
                          </button>
                        )}

                        {rentBill && (
                          <button
                            className="secondary-button compact-button"
                            onClick={() =>
                              setSelectedReceipt({
                                type: "rent",
                                id: rentBill.id,
                              })
                            }
                          >
                            Rent
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {ledgerRows.length === 0 && (
                <tr>
                  <td colSpan={8}>No monthly records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ledger-mini-grid">
          <div className="ledger-table-card">
            <table className="sheet-table mini-sheet-table">
              <thead>
                <tr>
                  <th>Consumption</th>
                  <th>Electricity</th>
                  <th>Water</th>
                </tr>
              </thead>

              <tbody>
                {tenantUtilityBills.map((bill) => (
                  <tr key={`consumption-${bill.id}`}>
                    <td>{getMonthLabelFromDate(bill.billingDate)}</td>
                    <td>{calculateElectricConsumption(bill).toFixed(1)}</td>
                    <td>{calculateWaterConsumption(bill).toFixed(1)}</td>
                  </tr>
                ))}

                {tenantUtilityBills.length === 0 && (
                  <tr>
                    <td colSpan={3}>No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="ledger-table-card">
            <table className="sheet-table mini-sheet-table submeter-table">
              <thead>
                <tr>
                  <th>Submeter</th>
                  <th>Electricity</th>
                  <th>Water</th>
                </tr>
              </thead>

              <tbody>
                {tenantUtilityBills.map((bill) => (
                  <tr key={`submeter-${bill.id}`}>
                    <td>{getMonthLabelFromDate(bill.billingDate)}</td>
                    <td>{bill.currentElectricReading.toFixed(2)}</td>
                    <td>{bill.currentWaterReading.toFixed(2)}</td>
                  </tr>
                ))}

                {tenantUtilityBills.length === 0 && (
                  <tr>
                    <td colSpan={3}>No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
            <p>Click Utility or Rent in the receipt column above.</p>
          </div>
        )}

        {selectedUtilityReceipt && (
          <div className="receipt-preview-wrap">
            <UtilityBillCard
              tenant={tenant}
              bill={selectedUtilityReceipt}
              onDeleteBill={onDeleteUtilityBill}
            />
          </div>
        )}

        {selectedRentReceipt && (
          <div className="receipt-preview-wrap">
            <RentBillCard
              tenant={tenant}
              bill={selectedRentReceipt}
              onDeleteBill={onDeleteRentBill}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default TenantDetailsPage;