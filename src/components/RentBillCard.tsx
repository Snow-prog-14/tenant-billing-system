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

  const rentPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );
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
      <section className="modern-bill-card premium-bill-card rent-bill-card" ref={billRef}>
        <div className="modern-bill-header rent-header premium-bill-header">
          <div>
            <p className="bill-label">Rent Bill</p>
            <h2>Monthly Tenant Rent</h2>
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
          <div className="tenant-summary premium-summary rent-summary">
            <div>
              <span>Tenant Name</span>
              <strong>{tenant.name}</strong>
            </div>
            <div>
              <span>Due Date</span>
              <strong>{bill.dueDate}</strong>
            </div>
            <div>
              <span>Total Rent</span>
              <strong>{formatPeso(totalBill)}</strong>
            </div>
          </div>

      <div className="modern-section premium-section">
  <div className="modern-section-title">
    <h3>Room Rent</h3>
    <strong>{formatPeso(totalBill)}</strong>
  </div>

  <div className="modern-row">
    <span>Rent Paid</span>
    <strong className="paid-text">{formatPeso(rentPaid)}</strong>
  </div>
</div>

          <div className="modern-section payment-history-section premium-section">
            <div className="modern-section-title">
              <h3>Payment History</h3>
              <strong>{formatPeso(rentPaid)}</strong>
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
                  {[...payments]
                    .sort((a, b) => b.datePaid.localeCompare(a.datePaid))
                    .map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.datePaid}</td>
                        <td>{formatPeso(payment.amount)}</td>
                        <td>{payment.notes || "—"}</td>
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

export default RentBillCard;