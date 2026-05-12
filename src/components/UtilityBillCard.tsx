import { useRef } from "react";
import { toPng } from "html-to-image";
import type { Payment, Tenant, UtilityBill } from "../types/billing";
import {
  calculateElectricBill,
  calculateElectricConsumption,
  calculateWaterBill,
  calculateWaterConsumption,
  formatPeso,
} from "../utils/billingCalculations";

type UtilityBillCardProps = {
  tenant: Tenant;
  bill: UtilityBill;
  payments: Payment[];
  onDeleteBill?: (billId: number) => void;
};

function UtilityBillCard({
  tenant,
  bill,
  payments,
  onDeleteBill,
}: UtilityBillCardProps) {
    const billRef = useRef<HTMLElement>(null);

  const waterConsumption = calculateWaterConsumption(bill);
  const waterBill = calculateWaterBill(bill);

  const electricConsumption = calculateElectricConsumption(bill);
  const electricBill = calculateElectricBill(bill);

  const electricPayments = payments.filter(p => p.billType === "utility_electric");
  const waterPayments = payments.filter(p => p.billType === "utility_water");

  const elecPaid = electricPayments.reduce((sum, p) => sum + p.amount, 0);
  const waterPaid = waterPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalBill = waterBill + electricBill + bill.previousUnpaidBalance;
  const totalPaid = elecPaid + waterPaid;
  const totalDue = totalBill - totalPaid;

  function handlePrint() {
    window.print();
  }

  async function handleSaveAsPhoto() {
    if (!billRef.current) {
      return;
    }

    const dataUrl = await toPng(billRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = `${tenant.name}-utility-bill.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <div className="bill-wrapper">
      <div className="bill-actions">
  <button className="secondary-button" onClick={handlePrint}>
    Print
  </button>

  <button className="primary-button" onClick={handleSaveAsPhoto}>
    Save as Photo
  </button>

  {onDeleteBill && (
    <button
      className="danger-button"
      onClick={() => onDeleteBill(bill.id)}
    >
      Delete
    </button>
  )}
</div>

      <section className="modern-bill-card" ref={billRef}>
        <div className="modern-bill-header utility-header">
          <div>
            <p className="bill-label">Utility Bill</p>
            <h2>Monthly Tenant Utility Bill</h2>
          </div>

          <div className="bill-pill">Room {tenant.roomNo}</div>
        </div>

        <div className="modern-bill-body">
          <div className="tenant-summary">
            <div>
              <span>Tenant Name</span>
              <strong>{tenant.name}</strong>
            </div>
            <div>
              <span>Billing Date</span>
              <strong>{bill.billingDate}</strong>
            </div>
            <div>
              <span>Billing Period</span>
              <strong>{bill.billingPeriod}</strong>
            </div>
            <div>
              <span>Due Date</span>
              <strong>{bill.dueDate}</strong>
            </div>
          </div>

          <div className="modern-section">
            <div className="modern-section-title">
              <h3>Water Bill</h3>
              <strong>{formatPeso(waterBill)}</strong>
            </div>

            <div className="modern-row">
              <span>Consumption</span>
              <strong>{waterConsumption.toFixed(1)} cu.m</strong>
            </div>
            <div className="modern-row">
              <span>Rate</span>
              <strong>{formatPeso(bill.waterRate)}</strong>
            </div>
            <div className="modern-row">
              <span>Water Paid</span>
              <strong className="paid-text">{formatPeso(waterPaid)}</strong>
            </div>
            <div className="modern-row">
              <span>Water Balance</span>
              <strong>{formatPeso(waterBill - waterPaid)}</strong>
            </div>
          </div>

          <div className="modern-section">
            <div className="modern-section-title">
              <h3>Electricity Bill</h3>
              <strong>{formatPeso(electricBill)}</strong>
            </div>

            <div className="modern-row">
              <span>Consumption</span>
              <strong>{electricConsumption.toFixed(1)} kWh</strong>
            </div>
            <div className="modern-row">
              <span>Rate</span>
              <strong>{formatPeso(bill.electricRate)}</strong>
            </div>
            <div className="modern-row">
              <span>Electric Paid</span>
              <strong className="paid-text">{formatPeso(elecPaid)}</strong>
            </div>
            <div className="modern-row">
              <span>Electric Balance</span>
              <strong>{formatPeso(electricBill - elecPaid)}</strong>
            </div>
          </div>

          <div className="modern-section payment-history-section">
            <div className="modern-section-title">
              <h3>Payment History</h3>
            </div>
            {payments.length > 0 ? (
              <table className="receipt-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.sort((a,b) => b.datePaid.localeCompare(a.datePaid)).map(p => (
                    <tr key={p.id}>
                      <td>{p.datePaid}</td>
                      <td>{p.billType.replace("utility_", "")}</td>
                      <td>{formatPeso(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No payments recorded yet.</p>
            )}
          </div>

          <div className="modern-total">
            <span>Total Remaining Balance</span>
            <strong>{formatPeso(totalDue)}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default UtilityBillCard;