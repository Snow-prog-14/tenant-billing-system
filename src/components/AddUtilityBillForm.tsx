import { useEffect, useMemo, useState } from "react";
import type { CalendarMonth, Tenant, UtilityBill } from "../types/billing";

type AddUtilityBillFormProps = {
  tenants: Tenant[];
  utilityBills: UtilityBill[];
  calendarMonths: CalendarMonth[];
  waterRate: number;
  electricRate: number;
  utilityDueDay: number;
  onAddUtilityBill: (bill: Omit<UtilityBill, "id">) => void;
};

function formatDateLong(date: Date | string) {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  return parsedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toInputDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function getFallbackCalendarMonths(): CalendarMonth[] {
  const months: CalendarMonth[] = [];
  const startYear = 2025;
  const endYear = 2027;

  for (let year = startYear; year <= endYear; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      const date = new Date(year, month - 1, 1);

      const monthName = date.toLocaleDateString("en-US", {
        month: "long",
      });

      const shortMonth = date.toLocaleDateString("en-US", {
        month: "short",
      });

      months.push({
monthKey: Number(`${year}${String(month).padStart(2, "0")}`),        year,
        numMonth: month,
        monthName,
        shortMonth,
        monthLabel: `${monthName} ${year}`,
      });
    }
  }

  return months;
}

function getBillingDateFromMonth(monthValue: string) {
  if (!monthValue) {
    return "";
  }

  const [year, month] = monthValue.split("-").map(Number);
  const billingDate = new Date(year, month - 1, 25);

  return toInputDate(billingDate);
}

function getBillingPeriodFromMonth(monthValue: string) {
  if (!monthValue) {
    return "";
  }

  const [year, month] = monthValue.split("-").map(Number);

  const startDate = new Date(year, month - 2, 25);
  const endDate = new Date(year, month - 1, 25);

  return `${formatDateLong(startDate)} – ${formatDateLong(endDate)}`;
}

function getMonthValue(month: CalendarMonth) {
  return `${month.year}-${String(month.numMonth).padStart(2, "0")}`;
}

function getDueDateFromBillingMonth(monthValue: string, utilityDueDay: number) {
  if (!monthValue) {
    return "";
  }

  const [year, month] = monthValue.split("-").map(Number);

  const dueDate = new Date(year, month, utilityDueDay);

  return toInputDate(dueDate);
}

function AddUtilityBillForm({
  tenants,
  utilityBills,
  calendarMonths,
  waterRate,
  electricRate,
  utilityDueDay,
  onAddUtilityBill,
}: AddUtilityBillFormProps) {
  const [tenantId, setTenantId] = useState("");
  const [billingMonth, setBillingMonth] = useState("");
  const [billingMonthSearch, setBillingMonthSearch] = useState("");
  const [isBillingMonthOpen, setIsBillingMonthOpen] = useState(false);
  const [billingDate, setBillingDate] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [previousWaterReading, setPreviousWaterReading] = useState("");
  const [currentWaterReading, setCurrentWaterReading] = useState("");

  const [previousElectricReading, setPreviousElectricReading] = useState("");
  const [currentElectricReading, setCurrentElectricReading] = useState("");

  const [additionalCharges, setAdditionalCharges] = useState("0");
  const [previousUnpaidBalance, setPreviousUnpaidBalance] = useState("0");
  const [amountPaid, setAmountPaid] = useState("0");
  const [electricPaidDate, setElectricPaidDate] = useState("");
const [waterPaidDate, setWaterPaidDate] = useState("");

  const selectedTenant = tenants.find((tenant) => tenant.id === Number(tenantId));
  const availableCalendarMonths =
  calendarMonths.length > 0 ? calendarMonths : getFallbackCalendarMonths();

  const filteredCalendarMonths = availableCalendarMonths.filter((month) =>
  month.monthLabel.toLowerCase().includes(billingMonthSearch.toLowerCase())
);

function selectBillingMonth(month: CalendarMonth) {
  setBillingMonth(getMonthValue(month));
  setBillingMonthSearch(month.monthLabel);
  setIsBillingMonthOpen(false);
}

  function handleBillingMonthSearch(value: string) {
  setBillingMonthSearch(value);

  const selectedMonth = availableCalendarMonths.find(
    (month) => month.monthLabel.toLowerCase() === value.toLowerCase()
  );

  if (selectedMonth) {
    setBillingMonth(getMonthValue(selectedMonth));
  }
}

  const latestBillForTenant = useMemo(() => {
    if (!tenantId) {
      return null;
    }

    const tenantBills = utilityBills.filter(
      (bill) => bill.tenantId === Number(tenantId)
    );

    if (tenantBills.length === 0) {
      return null;
    }

    return tenantBills
      .slice()
      .sort(
        (a, b) =>
          new Date(b.billingDate).getTime() - new Date(a.billingDate).getTime()
      )[0];
  }, [tenantId, utilityBills]);

  useEffect(() => {
    if (!latestBillForTenant) {
      setPreviousWaterReading("");
      setPreviousElectricReading("");
      return;
    }

    setPreviousWaterReading(String(latestBillForTenant.currentWaterReading));
    setPreviousElectricReading(String(latestBillForTenant.currentElectricReading));
  }, [latestBillForTenant]);

  useEffect(() => {
    if (!billingMonth) {
      setBillingDate("");
      setBillingPeriod("");
      setDueDate("");
      return;
    }

    setBillingDate(getBillingDateFromMonth(billingMonth));
    setBillingPeriod(getBillingPeriodFromMonth(billingMonth));
    setDueDate(getDueDateFromBillingMonth(billingMonth, utilityDueDay));
  }, [billingMonth, utilityDueDay]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !tenantId ||
      !billingDate ||
      !billingPeriod.trim() ||
      !dueDate ||
      !previousWaterReading ||
      !currentWaterReading ||
      !previousElectricReading ||
      !currentElectricReading
    ) {
      alert("Please complete all required fields.");
      return;
    }

    onAddUtilityBill({
      tenantId: Number(tenantId),

      billingDate,
      billingPeriod: billingPeriod.trim(),
      dueDate,

      previousWaterReading: Number(previousWaterReading),
      currentWaterReading: Number(currentWaterReading),
      waterRate,

      previousElectricReading: Number(previousElectricReading),
      currentElectricReading: Number(currentElectricReading),
      electricRate,
      additionalCharges: Number(additionalCharges),

      previousUnpaidBalance: Number(previousUnpaidBalance),
      amountPaid: Number(amountPaid),

      electricPaidDate: electricPaidDate || null,
waterPaidDate: waterPaidDate || null,
    });

    setTenantId("");
    setBillingMonth("");
    setBillingMonthSearch("");
    setBillingDate("");
    setBillingPeriod("");
    setDueDate("");
    setPreviousWaterReading("");
    setCurrentWaterReading("");
    setPreviousElectricReading("");
    setCurrentElectricReading("");
    setAdditionalCharges("0");
    setPreviousUnpaidBalance("0");
    setAmountPaid("0");
    setElectricPaidDate("");
    setWaterPaidDate("");
  }

  return (
    <form className="utility-form-modern" onSubmit={handleSubmit}>
      <div className="form-section full-span">
        <div className="form-section-header">
          <div>
            <span>Step 1</span>
            <h4>Tenant and Billing Cycle</h4>
          </div>

          {selectedTenant && (
            <strong>
              Room {selectedTenant.roomNo} · {selectedTenant.name}
            </strong>
          )}
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label htmlFor="utilityTenant">Tenant</label>
            <select
              id="utilityTenant"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
            >
              <option value="">Select tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  Room {tenant.roomNo} - {tenant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="billingMonth">Billing Month</label>
   <div className="searchable-select">
  <input
    id="rentBillingMonth"
    type="text"
    value={billingMonthSearch}
    onChange={(event) => handleBillingMonthSearch(event.target.value)}
    onFocus={() => setIsBillingMonthOpen(true)}
    onBlur={() => {
      setTimeout(() => setIsBillingMonthOpen(false), 150);
    }}
    placeholder="Search billing month"
    autoComplete="off"
  />

  <button
    type="button"
    className="searchable-select-arrow"
    onMouseDown={(event) => {
      event.preventDefault();
      setIsBillingMonthOpen((current) => !current);
    }}
  >
    ▾
  </button>

  {isBillingMonthOpen && (
    <div className="searchable-select-menu">
      {filteredCalendarMonths.length > 0 ? (
        filteredCalendarMonths.map((month) => (
          <button
            key={month.monthKey}
            type="button"
            className="searchable-select-option"
            onMouseDown={(event) => {
              event.preventDefault();
              selectBillingMonth(month);
            }}
          >
            <span>{month.monthLabel}</span>
            <small>{month.shortMonth} {month.year}</small>
          </button>
        ))
      ) : (
        <div className="searchable-select-empty">No month found</div>
      )}
    </div>
  )}
</div>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="billingDate">Billing Date</label>
            <input
              id="billingDate"
              type="date"
              value={billingDate}
              onChange={(event) => setBillingDate(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="billingPeriod">Billing Period</label>
            <input
              id="billingPeriod"
              type="text"
              value={billingPeriod}
              onChange={(event) => setBillingPeriod(event.target.value)}
              placeholder="Auto-filled from billing month"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <div>
            <span>Step 2</span>
            <h4>Water Reading</h4>
          </div>

          <strong>Rate: ₱{waterRate.toFixed(2)}</strong>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="previousWater">Previous Water</label>
            <input
              id="previousWater"
              type="number"
              step="0.01"
              value={previousWaterReading}
              onChange={(event) => setPreviousWaterReading(event.target.value)}
              placeholder="Auto-filled"
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentWater">Current Water</label>
            <input
              id="currentWater"
              type="number"
              step="0.01"
              value={currentWaterReading}
              onChange={(event) => setCurrentWaterReading(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <div>
            <span>Step 3</span>
            <h4>Electric Reading</h4>
          </div>

          <strong>Rate: ₱{electricRate.toFixed(2)}</strong>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="previousElectric">Previous Electric</label>
            <input
              id="previousElectric"
              type="number"
              step="0.01"
              value={previousElectricReading}
              onChange={(event) =>
                setPreviousElectricReading(event.target.value)
              }
              placeholder="Auto-filled"
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentElectric">Current Electric</label>
            <input
              id="currentElectric"
              type="number"
              step="0.01"
              value={currentElectricReading}
              onChange={(event) =>
                setCurrentElectricReading(event.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="form-section full-span">
        <div className="form-section-header">
          <div>
            <span>Step 4</span>
            <h4>Payment and Balance</h4>
          </div>
        </div>

<div className="form-grid-5">
            <div className="form-group">
            <label htmlFor="additionalCharges">Additional Charges</label>
            <input
              id="additionalCharges"
              type="number"
              step="0.01"
              value={additionalCharges}
              onChange={(event) => setAdditionalCharges(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="previousBalance">Previous Balance</label>
            <input
              id="previousBalance"
              type="number"
              step="0.01"
              value={previousUnpaidBalance}
              onChange={(event) => setPreviousUnpaidBalance(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amountPaid">Amount Paid</label>
            <input
              id="amountPaid"
              type="number"
              step="0.01"
              value={amountPaid}
              onChange={(event) => setAmountPaid(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="electricPaidDate">Electric Date Paid</label>
            <input
              id="electricPaidDate"
              type="date"
              value={electricPaidDate}
              onChange={(event) => setElectricPaidDate(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="waterPaidDate">Water Date Paid</label>
            <input
              id="waterPaidDate"
              type="date"
              value={waterPaidDate}
              onChange={(event) => setWaterPaidDate(event.target.value)}
            />
          </div>

          <button className="primary-button form-submit-button" type="submit">
            Add Utility Bill
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddUtilityBillForm;