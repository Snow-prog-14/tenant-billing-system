import type { Tenant, UtilityBill } from "../types/billing";

export const tenants: Tenant[] = [
  {
    id: 1,
    name: "Angelica Aljas",
    roomNo: "1",
    monthlyRent: 3000,
  },
  {
    id: 2,
    name: "Hazie Carra De Guzman",
    roomNo: "2",
    monthlyRent: 3000,
  },
];

export const utilityBills: UtilityBill[] = [
  {
    id: 1,
    tenantId: 1,

    billingDate: "March 29, 2026",
    billingPeriod: "February 25 – March 29, 2026",
    dueDate: "April 2, 2026",

    previousWaterReading: 30.9,
    currentWaterReading: 36.4,
    waterRate: 42.6,

    previousElectricReading: 171.3,
    currentElectricReading: 237.2,
    electricRate: 16,
    additionalCharges: 0,

    previousUnpaidBalance: 29.01,
    amountPaid: 0,
  },
  {
    id: 2,
    tenantId: 2,

    billingDate: "March 25, 2026",
    billingPeriod: "February 25 – March 25, 2026",
    dueDate: "April 2, 2026",

    previousWaterReading: 65.1,
    currentWaterReading: 74.2,
    waterRate: 42.6,

    previousElectricReading: 322,
    currentElectricReading: 371.5,
    electricRate: 16,
    additionalCharges: 0,

    previousUnpaidBalance: 905.58,
    amountPaid: 1294,
  },
];