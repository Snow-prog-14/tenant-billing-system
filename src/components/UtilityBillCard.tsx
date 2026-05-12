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
  const waterConsumption = calculateWaterConsumption(bill);
  const waterBill = calculateWaterBill(bill);

  const electricConsumption = calculateElectricConsumption(bill);
  const electricBill = calculateElectricBill(bill);

  const totalDue = calculateTotalUtilityDue(bill);

  return (
    <section className="bill-card">
      <div className="bill-title">MONTHLY TENANT UTILITY BILL</div>

      <div className="bill-info">
        <div>
          <span>Tenant Name:</span>
          <strong>{tenant.name}</strong>
        </div>
        <div>
          <span>Unit / Room No.:</span>
          <strong>{tenant.roomNo}</strong>
        </div>
        <div>
          <span>Billing Date:</span>
          <strong>{bill.billingDate}</strong>
        </div>
        <div>
          <span>Billing Period:</span>
          <strong>{bill.billingPeriod}</strong>
        </div>
        <div>
          <span>Due Date:</span>
          <strong>{bill.dueDate}</strong>
        </div>
      </div>

      <div className="section-header water">WATER BILL</div>

      <div className="bill-row">
        <span>Previous Reading (cu.m)</span>
        <strong>{bill.previousWaterReading}</strong>
      </div>
      <div className="bill-row">
        <span>Current Reading (cu.m)</span>
        <strong>{bill.currentWaterReading}</strong>
      </div>
      <div className="bill-row">
        <span>Consumption (cu.m)</span>
        <strong>{waterConsumption.toFixed(1)}</strong>
      </div>
      <div className="bill-row">
        <span>Rate per cu.m</span>
        <strong>{formatPeso(bill.waterRate)}</strong>
      </div>
      <div className="bill-row amount">
        <span>Water Bill Amount</span>
        <strong>{formatPeso(waterBill)}</strong>
      </div>

      <div className="section-header electric">ELECTRICITY BILL</div>

      <div className="bill-row">
        <span>Previous Reading (kWh)</span>
        <strong>{bill.previousElectricReading}</strong>
      </div>
      <div className="bill-row">
        <span>Current Reading (kWh)</span>
        <strong>{bill.currentElectricReading}</strong>
      </div>
      <div className="bill-row">
        <span>Consumption (kWh)</span>
        <strong>{electricConsumption.toFixed(1)}</strong>
      </div>
      <div className="bill-row">
        <span>Rate per kWh</span>
        <strong>{formatPeso(bill.electricRate)}</strong>
      </div>
      <div className="bill-row">
        <span>Additional Charges</span>
        <strong>{formatPeso(bill.additionalCharges)}</strong>
      </div>
      <div className="bill-row amount">
        <span>Electricity Bill Amount</span>
        <strong>{formatPeso(electricBill)}</strong>
      </div>

      <div className="section-header balance">PAYMENT AND BALANCE</div>

      <div className="bill-row">
        <span>Previous Unpaid Balance</span>
        <strong>{formatPeso(bill.previousUnpaidBalance)}</strong>
      </div>
      <div className="bill-row">
        <span>Amount Paid</span>
        <strong>{formatPeso(bill.amountPaid)}</strong>
      </div>

      <div className="total-row">
        <span>Total Amount Due</span>
        <strong>{formatPeso(totalDue)}</strong>
      </div>
    </section>
  );
}

export default UtilityBillCard;