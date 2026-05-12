import type { RentBill, UtilityBill } from "../types/billing";

export function calculateWaterConsumption(bill: UtilityBill): number {
  return bill.currentWaterReading - bill.previousWaterReading;
}

export function calculateWaterBill(bill: UtilityBill): number {
  return calculateWaterConsumption(bill) * bill.waterRate;
}

export function calculateElectricConsumption(bill: UtilityBill): number {
  return bill.currentElectricReading - bill.previousElectricReading;
}

export function calculateElectricBill(bill: UtilityBill): number {
  return (
    calculateElectricConsumption(bill) * bill.electricRate +
    bill.additionalCharges
  );
}

export function calculateTotalUtilityDue(bill: UtilityBill): number {
  return (
    calculateWaterBill(bill) +
    calculateElectricBill(bill) +
    bill.previousUnpaidBalance -
    bill.amountPaid
  );
}

export function calculateTotalRentDue(bill: RentBill): number {
  return bill.rentAmount + bill.previousUnpaidBalance - bill.amountPaid;
}

export function formatPeso(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}