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

  electricPaidDate?: string | null;
waterPaidDate?: string | null;
};

export type RentBill = {
  id: number;
  tenantId: number;

  billingPeriod: string;
  dueDate: string;

  rentAmount: number;
  previousUnpaidBalance: number;
  amountPaid: number;
  rentPaidDate?: string | null;
};

export type Payment = {
  id: number;
  tenantId: number;
  billType: "utility_electric" | "utility_water" | "rent";
  billId: number;
  amount: number;
  datePaid: string;
  notes?: string | null;
};

export type Page =
  | "dashboard"
  | "tenants"
  | "tenantDetails"
  | "utility"
  | "addUtility"
  | "rent"
  | "addRent"
  | "settings";

export type BillingSettings = {
  waterRate: number;
  electricRate: number;
  defaultMonthlyRent: number;
  utilityDueDay: number;
  rentDueDay: number;
};