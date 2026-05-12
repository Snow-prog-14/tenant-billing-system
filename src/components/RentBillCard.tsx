import type { RentBill, Tenant } from "../types/billing";
import {
  calculateTotalRentDue,
  formatPeso,
} from "../utils/billingCalculations";

type RentBillCardProps = {
  tenant: Tenant;
  bill: RentBill;
};

function RentBillCard({ tenant, bill }: RentBillCardProps) {
  const totalDue = calculateTotalRentDue(bill);

  return (
    <section className="bill-card rent-card">
      <div className="bill-title">MONTHLY TENANT RENT</div>

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
          <span>Billing Period:</span>
          <strong>{bill.billingPeriod}</strong>
        </div>
        <div>
          <span>Due Date:</span>
          <strong>{bill.dueDate}</strong>
        </div>
      </div>

      <div className="section-header room">ROOM RENT</div>

      <div className="bill-row amount">
        <span>Rent Amount</span>
        <strong>{formatPeso(bill.rentAmount)}</strong>
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

export default RentBillCard;