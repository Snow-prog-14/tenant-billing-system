import { useRef } from "react";
import { toPng } from "html-to-image";
import type { Tenant, UtilityBill } from "../types/billing";
import {
  calculateElectricBill,
  calculateElectricConsumption,
  calculateTotalUtilityDue,
  calculateWaterBill,
  calculateWaterConsumption,
  formatPeso,
} from "../utils/billingCalculations";

type UtilityBillCardProps = {
  tenant: Tenant;
  bill: UtilityBill;
};

function UtilityBillCard({ tenant, bill }: UtilityBillCardProps) {
  const billRef = useRef<HTMLElement>(null);

  const waterConsumption = calculateWaterConsumption(bill);
  const waterBill = calculateWaterBill(bill);

  const electricConsumption = calculateElectricConsumption(bill);
  const electricBill = calculateElectricBill(bill);

  const totalDue = calculateTotalUtilityDue(bill);

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
              <span>Previous Reading</span>
              <strong>{bill.previousWaterReading} cu.m</strong>
            </div>
            <div className="modern-row">
              <span>Current Reading</span>
              <strong>{bill.currentWaterReading} cu.m</strong>
            </div>
            <div className="modern-row">
              <span>Consumption</span>
              <strong>{waterConsumption.toFixed(1)} cu.m</strong>
            </div>
            <div className="modern-row">
              <span>Rate per cu.m</span>
              <strong>{formatPeso(bill.waterRate)}</strong>
            </div>
          </div>

          <div className="modern-section">
            <div className="modern-section-title">
              <h3>Electricity Bill</h3>
              <strong>{formatPeso(electricBill)}</strong>
            </div>

            <div className="modern-row">
              <span>Previous Reading</span>
              <strong>{bill.previousElectricReading} kWh</strong>
            </div>
            <div className="modern-row">
              <span>Current Reading</span>
              <strong>{bill.currentElectricReading} kWh</strong>
            </div>
            <div className="modern-row">
              <span>Consumption</span>
              <strong>{electricConsumption.toFixed(1)} kWh</strong>
            </div>
            <div className="modern-row">
              <span>Rate per kWh</span>
              <strong>{formatPeso(bill.electricRate)}</strong>
            </div>
            <div className="modern-row">
              <span>Additional Charges</span>
              <strong>{formatPeso(bill.additionalCharges)}</strong>
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

export default UtilityBillCard;