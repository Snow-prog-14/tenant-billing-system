import { useRef } from "react";
import { toPng } from "html-to-image";
import type { RentBill, Tenant } from "../types/billing";
import {
  calculateTotalRentDue,
  formatPeso,
} from "../utils/billingCalculations";

type RentBillCardProps = {
  tenant: Tenant;
  bill: RentBill;
  onDeleteBill?: (billId: number) => void;
};

function RentBillCard({
  tenant,
  bill,
  onDeleteBill,
}: RentBillCardProps) {
    const billRef = useRef<HTMLElement>(null);

  const totalDue = calculateTotalRentDue(bill);

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
          </div>

          <div className="modern-section">
            <div className="modern-section-title">
              <h3>Payment and Balance</h3>
            </div>

            <div className="modern-row">
              <span>Previous Unpaid Balance</span>
              <strong>{formatPeso(bill.previousUnpaidBalance)}</strong>
            </div>
            <div className="modern-row">
              <span>Amount Paid</span>
              <strong>{formatPeso(bill.amountPaid)}</strong>
            </div>
          </div>

          <div className="modern-total">
            <span>Total Amount Due</span>
            <strong>{formatPeso(totalDue)}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RentBillCard;