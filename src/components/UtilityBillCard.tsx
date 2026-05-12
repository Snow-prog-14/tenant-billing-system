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

  const electricPayments = payments.filter(
    (payment) => payment.billType === "utility_electric"
  );
  const waterPayments = payments.filter(
    (payment) => payment.billType === "utility_water"
  );

  const elecPaid = electricPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );
  const waterPaid = waterPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

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
      <section className="modern-bill-card premium-bill-card utility-bill-card" ref={billRef}>
        <div className="modern-bill-header utility-header premium-bill-header">
          <div>
            <p className="bill-label">Utility Bill</p>
            <h2>Monthly Tenant Utility Bill</h2>
            <p className="bill-subtitle">{bill.billingPeriod}</p>
          </div>

          <div className="bill-header-side">
            <div className="bill-pill">Room {tenant.roomNo}</div>
            <strong>{formatPeso(totalDue)}</strong>
            <span>Remaining Balance</span>
          </div>
        </div>

        <div className="bill-action-bar">
          <button className="secondary-button compact-button" onClick={handlePrint}>
            Print
          </button>

          <button className="primary-button compact-button" onClick={handleSaveAsPhoto}>
            Save as Photo
          </button>

          {onDeleteBill && (
            <button
              className="danger-button compact-button"
              onClick={() => onDeleteBill(bill.id)}
            >
              Delete
            </button>
          )}
        </div>

        <div className="modern-bill-body">
          <div className="tenant-summary premium-summary">
            <div>
              <span>Tenant Name</span>
              <strong>{tenant.name}</strong>
            </div>
            <div>
              <span>Billing Date</span>
              <strong>{bill.billingDate}</strong>
            </div>
            <div>
              <span>Due Date</span>
              <strong>{bill.dueDate}</strong>
            </div>
            <div>
              <span>Total Bill</span>
              <strong>{formatPeso(totalBill)}</strong>
            </div>
          </div>

          <div className="bill-breakdown-grid">
            <div className="modern-section premium-section">
              <div className="modern-section-title">
                <h3>Water</h3>
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
                <span>Paid</span>
                <strong className="paid-text">{formatPeso(waterPaid)}</strong>
              </div>
              <div className="modern-row">
                <span>Balance</span>
                <strong>{formatPeso(waterBill - waterPaid)}</strong>
              </div>
            </div>

            <div className="modern-section premium-section">
              <div className="modern-section-title">
                <h3>Electricity</h3>
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
                <span>Paid</span>
                <strong className="paid-text">{formatPeso(elecPaid)}</strong>
              </div>
              <div className="modern-row">
                <span>Balance</span>
                <strong>{formatPeso(electricBill - elecPaid)}</strong>
              </div>
            </div>
          </div>

          <div className="modern-section payment-history-section premium-section">
            <div className="modern-section-title">
              <h3>Payment History</h3>
              <strong>{formatPeso(totalPaid)}</strong>
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
                  {[...payments]
                    .sort((a, b) => b.datePaid.localeCompare(a.datePaid))
                    .map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.datePaid}</td>
                        <td>{payment.billType.replace("utility_", "")}</td>
                        <td>{formatPeso(payment.amount)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-note">No payments recorded yet.</p>
            )}
          </div>

          <div className="modern-total premium-total">
            <span>Total Remaining Balance</span>
            <strong>{formatPeso(totalDue)}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default UtilityBillCard;