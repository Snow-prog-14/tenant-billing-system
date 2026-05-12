import { useRef } from "react";
import { toPng } from "html-to-image";
import type { Payment, RentBill, Tenant } from "../types/billing";
import { formatPeso } from "../utils/billingCalculations";

type RentBillCardProps = {
  tenant: Tenant;
  bill: RentBill;
  payments: Payment[];
  onDeleteBill?: (billId: number) => void;
};

function RentBillCard({
  tenant,
  bill,
  payments,
  onDeleteBill,
}: RentBillCardProps) {
    const billRef = useRef<HTMLElement>(null);

  const rentPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalBill = bill.rentAmount + bill.previousUnpaidBalance;
  const totalDue = totalBill - rentPaid;

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
    link.download = `${tenant.name}-rent-bill.png`;
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
        <div className="modern-bill-header rent-header">
          <div>
            <p className="bill-label">Rent Bill</p>
            <h2>Monthly Tenant Rent</h2>
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
              <h3>Room Rent</h3>
              <strong>{formatPeso(bill.rentAmount)}</strong>
            </div>

            <div className="modern-row">
              <span>Monthly Rent</span>
              <strong>{formatPeso(bill.rentAmount)}</strong>
            </div>
            <div className="modern-row">
              <span>Rent Paid</span>
              <strong className="paid-text">{formatPeso(rentPaid)}</strong>
            </div>
            <div className="modern-row">
              <span>Rent Balance</span>
              <strong>{formatPeso(bill.rentAmount - rentPaid)}</strong>
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
                    <th>Amount</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.sort((a,b) => b.datePaid.localeCompare(a.datePaid)).map(p => (
                    <tr key={p.id}>
                      <td>{p.datePaid}</td>
                      <td>{formatPeso(p.amount)}</td>
                      <td>{p.notes}</td>
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

export default RentBillCard;