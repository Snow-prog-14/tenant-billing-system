export type Tenant = {
  id: number;
  name: string;
  roomNo: string;
  monthlyRent: number;
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