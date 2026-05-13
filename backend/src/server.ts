import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from "path";
import { db } from "./db";

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Extended Request type to include auth info
type DataScope = "demo" | "personal";

declare global {
  namespace Express {
    interface Request {
      user?: {
        mode: DataScope;
      };
      dataScope?: DataScope;
      isAuthenticated?: boolean;
      isPersonal?: boolean;
    }
  }
}


// Authentication Middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token;

  if (!token) {
    req.isPersonal = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { authenticated: boolean };
    req.isPersonal = decoded.authenticated;
  } catch (error) {
    req.isPersonal = false;
  }
  next();
};

// Guard for Personal-only actions (Writes/Deletes)
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isPersonal) {
    return res.status(401).json({ message: "Unauthorized. Personal mode required." });
  }
  next();
};

app.use(authenticate);

const PORT = process.env.PORT || 5000;

app.get("/", (_req: Request, res: Response) => {  res.json({
    message: "Tenant Billing Backend is running",
  });
});

app.get("/api/health", async (_req: Request, res: Response) => {  try {
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

// Authentication Routes
app.post("/api/auth/login", (req: Request, res: Response) => {
    const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ authenticated: true }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.json({ message: "Login successful", mode: "personal" });
  }

  res.status(401).json({ message: "Invalid password" });
});

app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out", mode: "demo" });
});

app.get("/api/auth/me", (req: Request, res: Response) => {
  res.json({
    authenticated: !!req.isPersonal,
    mode: req.isPersonal ? "personal" : "demo",
  });
});

app.get("/api/tenants", async (req: Request, res: Response) => {
  try {
    const scope = req.isPersonal ? "personal" : "demo";
    const [rows] = await db.query(
      `
      SELECT
        id,
        name,
        room_no AS roomNo,
        monthly_rent AS monthlyRent,
        status
      FROM tenants
      WHERE data_scope = ?
      ORDER BY id DESC
    `,
      [scope]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tenants" });
  }
});

app.post("/api/tenants", requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, roomNo, monthlyRent, status } = req.body;

    if (!name || !roomNo || !monthlyRent) {
      return res.status(400).json({
        message: "Name, room number, and monthly rent are required",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO tenants (name, room_no, monthly_rent, status, data_scope)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, roomNo, monthlyRent, status || "active", "personal"]
    );

    res.status(201).json({
      message: "Tenant added successfully",
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add tenant" });
  }
});

app.put("/api/tenants/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = Number(req.params.id);
    const { name, roomNo, monthlyRent, status } = req.body;

    if (!tenantId) {
      return res.status(400).json({ message: "Valid tenant ID is required" });
    }

    if (!name || !roomNo || monthlyRent === undefined || !status) {
      return res.status(400).json({
        message: "Name, room number, monthly rent, and status are required",
      });
    }

    const [result] = await db.query(
      `
      UPDATE tenants
      SET
        name = ?,
        room_no = ?,
        monthly_rent = ?,
        status = ?
      WHERE id = ? AND data_scope = 'personal'
      `,
      [name, roomNo, monthlyRent, status, tenantId]
    );

    res.json({ message: "Tenant updated successfully", result });
  } catch (error) {
    console.error("Update tenant error:", error);
    res.status(500).json({ message: "Failed to update tenant" });
  }
});

app.delete("/api/tenants/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = Number(req.params.id);

    if (!tenantId) {
      return res.status(400).json({ message: "Valid tenant ID is required" });
    }

    // Verify ownership before deleting related data
    const [tenants] = await db.query<any[]>(
      "SELECT id FROM tenants WHERE id = ? AND data_scope = 'personal'",
      [tenantId]
    );

    if (tenants.length === 0) {
      return res.status(404).json({ message: "Tenant not found or unauthorized" });
    }

    // Delete related bills and payments (only for personal scope)
    await db.query(
      "DELETE FROM utility_bills WHERE tenant_id = ? AND data_scope = 'personal'",
      [tenantId]
    );
    await db.query(
      "DELETE FROM rent_bills WHERE tenant_id = ? AND data_scope = 'personal'",
      [tenantId]
    );
    await db.query(
      "DELETE FROM payments WHERE tenant_id = ? AND data_scope = 'personal'",
      [tenantId]
    );

    const [result] = await db.query(
      "DELETE FROM tenants WHERE id = ? AND data_scope = 'personal'",
      [tenantId]
    );

    res.json({ message: "Tenant deleted successfully", result });
  } catch (error) {
    console.error("Delete tenant error:", error);
    res.status(500).json({ message: "Failed to delete tenant" });
  }
});

app.get("/api/utility-bills", async (req: Request, res: Response) => {
  try {
    const scope = req.isPersonal ? "personal" : "demo";
    const [rows] = await db.query(
      `
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
        amount_paid AS amountPaid,
        DATE_FORMAT(electric_paid_date, '%M %d, %Y') AS electricPaidDate,
        DATE_FORMAT(water_paid_date, '%M %d, %Y') AS waterPaidDate
      FROM utility_bills
      WHERE data_scope = ?
      ORDER BY id DESC
    `,
      [scope]
    );

    res.json(rows);
  } catch (error) {
    console.error("Fetch utility bills error:", error);
    res.status(500).json({ message: "Failed to fetch utility bills" });
  }
});

app.post("/api/utility-bills", requireAuth, async (req: Request, res: Response) => {
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
      electricPaidDate,
      waterPaidDate,
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
      return res.status(400).json({ message: "Required utility bill fields are missing" });
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
        amount_paid,
        electric_paid_date,
        water_paid_date,
        data_scope
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        electricPaidDate || null,
        waterPaidDate || null,
        "personal",
      ]
    );

    res.status(201).json({ message: "Utility bill added successfully", result });
  } catch (error) {
    console.error("Add utility bill error:", error);
    res.status(500).json({ message: "Failed to add utility bill" });
  }
});

app.get("/api/rent-bills", async (req: Request, res: Response) => {
  try {
    const scope = req.isPersonal ? "personal" : "demo";
    const [rows] = await db.query(
      `
      SELECT
        id,
        tenant_id AS tenantId,
        billing_period AS billingPeriod,
        DATE_FORMAT(due_date, '%M %d, %Y') AS dueDate,
        rent_amount AS rentAmount,
        previous_unpaid_balance AS previousUnpaidBalance,
        amount_paid AS amountPaid,
        DATE_FORMAT(rent_paid_date, '%M %d, %Y') AS rentPaidDate
      FROM rent_bills
      WHERE data_scope = ?
      ORDER BY id DESC
    `,
      [scope]
    );

    res.json(rows);
  } catch (error) {
    console.error("Fetch rent bills error:", error);
    res.status(500).json({ message: "Failed to fetch rent bills" });
  }
});

app.post("/api/rent-bills", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      tenantId,
      billingPeriod,
      dueDate,
      rentAmount,
      previousUnpaidBalance,
      amountPaid,
      rentPaidDate,
    } = req.body;

    if (!tenantId || !billingPeriod || !dueDate || rentAmount === undefined) {
      return res.status(400).json({ message: "Required rent bill fields are missing" });
    }

    const [result] = await db.query(
      `
      INSERT INTO rent_bills (
        tenant_id,
        billing_period,
        due_date,
        rent_amount,
        previous_unpaid_balance,
        amount_paid,
        rent_paid_date,
        data_scope
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        tenantId,
        billingPeriod,
        dueDate,
        rentAmount,
        previousUnpaidBalance || 0,
        amountPaid || 0,
        rentPaidDate || null,
        "personal",
      ]
    );

    res.status(201).json({ message: "Rent bill added successfully", result });
  } catch (error) {
    console.error("Add rent bill error:", error);
    res.status(500).json({ message: "Failed to add rent bill" });
  }
});

app.delete("/api/utility-bills/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const billId = Number(req.params.id);

    if (!billId) {
      return res.status(400).json({ message: "Valid utility bill ID is required" });
    }

    const [result] = await db.query(
      "DELETE FROM utility_bills WHERE id = ? AND data_scope = 'personal'",
      [billId]
    );

    // Delete related payments (only if bill was in personal scope)
    if ((result as any).affectedRows > 0) {
      await db.query(
        `
        DELETE FROM payments
        WHERE bill_id = ? AND bill_type IN ('utility_electric', 'utility_water') AND data_scope = 'personal'
        `,
        [billId]
      );
    }

    res.json({ message: "Utility bill deleted successfully", result });
  } catch (error) {
    console.error("Delete utility bill error:", error);
    res.status(500).json({ message: "Failed to delete utility bill" });
  }
});

app.delete("/api/rent-bills/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const billId = Number(req.params.id);

    if (!billId) {
      return res.status(400).json({ message: "Valid rent bill ID is required" });
    }

    const [result] = await db.query(
      "DELETE FROM rent_bills WHERE id = ? AND data_scope = 'personal'",
      [billId]
    );

    // Delete related payments (only if bill was in personal scope)
    if ((result as any).affectedRows > 0) {
      await db.query(
        `
        DELETE FROM payments
        WHERE bill_id = ? AND bill_type = 'rent' AND data_scope = 'personal'
        `,
        [billId]
      );
    }

    res.json({ message: "Rent bill deleted successfully", result });
  } catch (error) {
    console.error("Delete rent bill error:", error);
    res.status(500).json({ message: "Failed to delete rent bill" });
  }
});

app.get("/api/settings", async (_req: Request, res: Response) => {
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

app.put("/api/settings", requireAuth, async (req: Request, res: Response) => {
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

app.get("/api/payments", async (req: Request, res: Response) => {
  try {
    const scope = req.isPersonal ? "personal" : "demo";
    const [rows] = await db.query(
      `
      SELECT
        id,
        tenant_id AS tenantId,
        bill_type AS billType,
        bill_id AS billId,
        amount,
        DATE_FORMAT(date_paid, '%Y-%m-%d') AS datePaid,
        notes
      FROM payments
      WHERE data_scope = ?
      ORDER BY id DESC
    `,
      [scope]
    );
    res.json(rows);
  } catch (error) {
    console.error("Fetch payments error:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

app.get("/api/payments/tenant/:tenantId", async (req: Request, res: Response) => {
  try {
    const tenantId = Number(req.params.tenantId);
    const scope = req.isPersonal ? "personal" : "demo";
    const [rows] = await db.query(
      `
      SELECT
        id,
        tenant_id AS tenantId,
        bill_type AS billType,
        bill_id AS billId,
        amount,
        DATE_FORMAT(date_paid, '%Y-%m-%d') AS datePaid,
        notes
      FROM payments
      WHERE tenant_id = ? AND data_scope = ?
      ORDER BY id DESC
    `,
      [tenantId, scope]
    );
    res.json(rows);
  } catch (error) {
    console.error("Fetch tenant payments error:", error);
    res.status(500).json({ message: "Failed to fetch tenant payments" });
  }
});

app.post("/api/payments", requireAuth, async (req: Request, res: Response) => {
  try {
    const { tenantId, billType, billId, amount, datePaid, notes } = req.body;
    if (!tenantId || !billType || !billId || amount === undefined || !datePaid) {
      return res.status(400).json({ message: "Missing required payment fields" });
    }
    const [result] = await db.query(
      `
      INSERT INTO payments (tenant_id, bill_type, bill_id, amount, date_paid, notes, data_scope)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [tenantId, billType, billId, amount, datePaid, notes || null, "personal"]
    );
    res.status(201).json({ message: "Payment added successfully", result });
  } catch (error) {
    console.error("Add payment error:", error);
    res.status(500).json({ message: "Failed to add payment" });
  }
});

app.delete("/api/payments/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const paymentId = Number(req.params.id);

    if (!paymentId) {
      return res.status(400).json({ message: "Valid payment ID is required" });
    }

    const [result] = await db.query(
      "DELETE FROM payments WHERE id = ? AND data_scope = 'personal'",
      [paymentId]
    );

    res.json({ message: "Payment deleted successfully", result });
  } catch (error) {
    console.error("Delete payment error:", error);
    res.status(500).json({ message: "Failed to delete payment" });
  }
});


app.get("/api/calendar/months", async (_req: Request, res: Response) => {
    try {
    const [rows] = await db.query(`
      SELECT DISTINCT
        month_key AS monthKey,
        year,
        num_month AS numMonth,
        month_name AS monthName,
        short_month AS shortMonth,
        month_label AS monthLabel
      FROM calendar_dates
      ORDER BY month_key ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Fetch calendar months error:", error);
    res.status(500).json({
      message: "Failed to fetch calendar months",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});