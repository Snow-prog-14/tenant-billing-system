export type Tenant = {
  id: number;
  name: string;
  roomNo: string;
  monthlyRent: number;
  status: "active" | "inactive";
};

export type UtilityBill = {
  id: number;
  tenantId: number;

  billingDate: string;
  billingPeriod: string;
  dueDate: string;

  previousWaterReading: number;
  currentWaterReading: number;
  waterRate: number;

  previousElectricReading: number;
  currentElectricReading: number;
  electricRate: number;
  additionalCharges: number;

  previousUnpaidBalance: number;
  amountPaid: number;
};

export type RentBill = {
  id: number;
  tenantId: number;

  billingPeriod: string;
  dueDate: string;

  rentAmount: number;
  previousUnpaidBalance: number;
  amountPaid: number;
};

export type Page = "dashboard" | "tenants" | "utility" | "rent" | "settings";

export type BillingSettings = {
  waterRate: number;
  electricRate: number;
  defaultMonthlyRent: number;
  utilityDueDay: number;
  rentDueDay: number;
};