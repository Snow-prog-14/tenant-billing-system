import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 5000;

app.get("/", (_req, res) => {
  res.json({
    message: "Tenant Billing Backend is running",
  });
});

app.get("/api/health", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");

    res.json({
      status: "ok",
      database: "connected",
      test: rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      database: "not connected",
      message: "Could not connect to MySQL database",
    });
  }
});

app.get("/api/tenants", async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        name,
        room_no AS roomNo,
        monthly_rent AS monthlyRent,
        status
      FROM tenants
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tenants",
    });
  }
});

app.post("/api/tenants", async (req, res) => {

 app.delete("/api/tenants/:id", async (req, res) => {
  try {
    const tenantId = Number(req.params.id);

    if (!tenantId) {
      return res.status(400).json({
        message: "Valid tenant ID is required",
      });
    }

    // Delete related bills first, because MySQL enjoys being strict.
    await db.query(
      `
      DELETE FROM utility_bills
      WHERE tenant_id = ?
      `,
      [tenantId]
    );

    await db.query(
      `
      DELETE FROM rent_bills
      WHERE tenant_id = ?
      `,
      [tenantId]
    );

    const [result] = await db.query(
      `
      DELETE FROM tenants
      WHERE id = ?
      `,
      [tenantId]
    );

    res.json({
      message: "Tenant deleted successfully",
      result,
    });
  } catch (error) {
    console.error("Delete tenant error:", error);

    res.status(500).json({
      message: "Failed to delete tenant",
      error,
    });
  }
});

  try {
    const { name, roomNo, monthlyRent, status } = req.body;

    if (!name || !roomNo || !monthlyRent) {
      return res.status(400).json({
        message: "Name, room number, and monthly rent are required",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO tenants (name, room_no, monthly_rent, status)
      VALUES (?, ?, ?, ?)
      `,
      [name, roomNo, monthlyRent, status || "active"]
    );

    res.status(201).json({
      message: "Tenant added successfully",
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add tenant",
    });
  }
});

app.delete("/api/tenants/:id", async (req, res) => {
  try {
    const tenantId = Number(req.params.id);

    if (!tenantId) {
      return res.status(400).json({
        message: "Valid tenant ID is required",
      });
    }

    await db.query(
      `
      DELETE FROM utility_bills
      WHERE tenant_id = ?
      `,
      [tenantId]
    );

    await db.query(
      `
      DELETE FROM rent_bills
      WHERE tenant_id = ?
      `,
      [tenantId]
    );

    const [result] = await db.query(
      `
      DELETE FROM tenants
      WHERE id = ?
      `,
      [tenantId]
    );

    res.json({
      message: "Tenant deleted successfully",
      result,
    });
  } catch (error) {
    console.error("Delete tenant error:", error);

    res.status(500).json({
      message: "Failed to delete tenant",
    });
  }
});

app.get("/api/utility-bills", async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        tenant_id AS tenantId,
        DATE_FORMAT(billing_date, '%M %d, %Y') AS billingDate,
        billing_period AS billingPeriod,
        DATE_FORMAT(due_date, '%M %d, %Y') AS dueDate,

        previous_water_reading AS previousWaterReading,
        current_water_reading AS currentWaterReading,
        water_rate AS waterRate,

        previous_electric_reading AS previousElectricReading,
        current_electric_reading AS currentElectricReading,
        electric_rate AS electricRate,
        additional_charges AS additionalCharges,

        previous_unpaid_balance AS previousUnpaidBalance,
        amount_paid AS amountPaid
      FROM utility_bills
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Fetch utility bills error:", error);

    res.status(500).json({
      message: "Failed to fetch utility bills",
    });
  }
});

app.post("/api/utility-bills", async (req, res) => {
  try {
    const {
      tenantId,
      billingDate,
      billingPeriod,
      dueDate,
      previousWaterReading,
      currentWaterReading,
      waterRate,
      previousElectricReading,
      currentElectricReading,
      electricRate,
      additionalCharges,
      previousUnpaidBalance,
      amountPaid,
    } = req.body;

    if (
      !tenantId ||
      !billingDate ||
      !billingPeriod ||
      !dueDate ||
      previousWaterReading === undefined ||
      currentWaterReading === undefined ||
      waterRate === undefined ||
      previousElectricReading === undefined ||
      currentElectricReading === undefined ||
      electricRate === undefined
    ) {
      return res.status(400).json({
        message: "Required utility bill fields are missing",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO utility_bills (
        tenant_id,
        billing_date,
        billing_period,
        due_date,
        previous_water_reading,
        current_water_reading,
        water_rate,
        previous_electric_reading,
        current_electric_reading,
        electric_rate,
        additional_charges,
        previous_unpaid_balance,
        amount_paid
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        tenantId,
        billingDate,
        billingPeriod,
        dueDate,
        previousWaterReading,
        currentWaterReading,
        waterRate,
        previousElectricReading,
        currentElectricReading,
        electricRate,
        additionalCharges || 0,
        previousUnpaidBalance || 0,
        amountPaid || 0,
      ]
    );

    res.status(201).json({
      message: "Utility bill added successfully",
      result,
    });
  } catch (error) {
    console.error("Add utility bill error:", error);

    res.status(500).json({
      message: "Failed to add utility bill",
    });
  }
});

app.get("/api/rent-bills", async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        tenant_id AS tenantId,
        billing_period AS billingPeriod,
        DATE_FORMAT(due_date, '%M %d, %Y') AS dueDate,
        rent_amount AS rentAmount,
        previous_unpaid_balance AS previousUnpaidBalance,
        amount_paid AS amountPaid
      FROM rent_bills
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Fetch rent bills error:", error);

    res.status(500).json({
      message: "Failed to fetch rent bills",
    });
  }
});

app.post("/api/rent-bills", async (req, res) => {
  try {
    const {
      tenantId,
      billingPeriod,
      dueDate,
      rentAmount,
      previousUnpaidBalance,
      amountPaid,
    } = req.body;

    if (!tenantId || !billingPeriod || !dueDate || rentAmount === undefined) {
      return res.status(400).json({
        message: "Required rent bill fields are missing",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO rent_bills (
        tenant_id,
        billing_period,
        due_date,
        rent_amount,
        previous_unpaid_balance,
        amount_paid
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        tenantId,
        billingPeriod,
        dueDate,
        rentAmount,
        previousUnpaidBalance || 0,
        amountPaid || 0,
      ]
    );

    res.status(201).json({
      message: "Rent bill added successfully",
      result,
    });
  } catch (error) {
    console.error("Add rent bill error:", error);

    res.status(500).json({
      message: "Failed to add rent bill",
    });
  }
});

app.delete("/api/utility-bills/:id", async (req, res) => {
  try {
    const billId = Number(req.params.id);

    if (!billId) {
      return res.status(400).json({
        message: "Valid utility bill ID is required",
      });
    }

    const [result] = await db.query(
      `
      DELETE FROM utility_bills
      WHERE id = ?
      `,
      [billId]
    );

    res.json({
      message: "Utility bill deleted successfully",
      result,
    });
  } catch (error) {
    console.error("Delete utility bill error:", error);

    res.status(500).json({
      message: "Failed to delete utility bill",
    });
  }
});

app.delete("/api/rent-bills/:id", async (req, res) => {
  try {
    const billId = Number(req.params.id);

    if (!billId) {
      return res.status(400).json({
        message: "Valid rent bill ID is required",
      });
    }

    const [result] = await db.query(
      `
      DELETE FROM rent_bills
      WHERE id = ?
      `,
      [billId]
    );

    res.json({
      message: "Rent bill deleted successfully",
      result,
    });
  } catch (error) {
    console.error("Delete rent bill error:", error);

    res.status(500).json({
      message: "Failed to delete rent bill",
    });
  }
});

app.get("/api/settings", async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        water_rate AS waterRate,
        electric_rate AS electricRate,
        default_monthly_rent AS defaultMonthlyRent,
        utility_due_day AS utilityDueDay,
        rent_due_day AS rentDueDay
      FROM billing_settings
      ORDER BY id ASC
      LIMIT 1
    `);

    const settingsRows = rows as any[];

    if (settingsRows.length === 0) {
      return res.status(404).json({
        message: "Settings not found",
      });
    }

    res.json(settingsRows[0]);
  } catch (error) {
    console.error("Fetch settings error:", error);

    res.status(500).json({
      message: "Failed to fetch settings",
    });
  }
});

app.put("/api/settings", async (req, res) => {
  try {
    const {
      waterRate,
      electricRate,
      defaultMonthlyRent,
      utilityDueDay,
      rentDueDay,
    } = req.body;

    if (
      waterRate === undefined ||
      electricRate === undefined ||
      defaultMonthlyRent === undefined ||
      utilityDueDay === undefined ||
      rentDueDay === undefined
    ) {
      return res.status(400).json({
        message: "All settings fields are required",
      });
    }

    await db.query(
      `
      UPDATE billing_settings
      SET
        water_rate = ?,
        electric_rate = ?,
        default_monthly_rent = ?,
        utility_due_day = ?,
        rent_due_day = ?
      WHERE id = 1
      `,
      [
        waterRate,
        electricRate,
        defaultMonthlyRent,
        utilityDueDay,
        rentDueDay,
      ]
    );

    res.json({
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Update settings error:", error);

    res.status(500).json({
      message: "Failed to update settings",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});