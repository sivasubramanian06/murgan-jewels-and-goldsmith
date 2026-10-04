import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

/* =========================================================
   BASIC
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Murugan Goldsmith and Jewels API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    res.json({
      success: true,
      message: "Backend and PostgreSQL are connected",
      database: process.env.DB_NAME || "mgj_database",
      time: result.rows[0].time,
    });
  } catch (error) {
    console.error("❌ Health error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

/* =========================================================
   JWT AUTHENTICATION
========================================================= */

function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server authentication configuration is missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = decoded;

    next();
  } catch (error) {
    console.error("❌ JWT error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
}

/* =========================================================
   ADMIN LOGIN
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT id, username, password_hash
      FROM admin_users
      WHERE username = $1
      LIMIT 1
      `,
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const admin = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is missing",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin.id,
        username: admin.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Admin login failed",
    });
  }
});

/* =========================================================
   AUTH ME
========================================================= */

app.get("/api/auth/me", authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, username
      FROM admin_users
      WHERE id = $1
      LIMIT 1
      `,
      [req.admin.adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    res.json({
      success: true,
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Auth ME error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to verify admin",
    });
  }
});

/* =========================================================
   ADMIN TEST
========================================================= */

app.get("/api/admin/test", authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Admin authentication is working",
    admin: req.admin,
  });
});

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

async function getCustomerForOrder(client, customerName, phone) {
  const name = String(customerName || "").trim();
  const normalizedPhone = String(phone || "").replace(/\D/g, "");

  if (!name) {
    throw new Error("Customer name is required");
  }

  if (normalizedPhone.length !== 10) {
    throw new Error("Valid 10-digit Indian mobile number is required");
  }

  const result = await client.query(
    `
    INSERT INTO customers (
      name,
      phone
    )
    VALUES ($1, $2)
    ON CONFLICT (phone)
    DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
    `,
    [name, normalizedPhone]
  );

  return result.rows[0];
}

function calculateOrderAmounts({
  weight,
  goldRate,
  makingCharge,
  stoneCharge,
  otherCharge,
  advance,
}) {
  const weightValue = Number(weight) || 0;
  const goldRateValue = Number(goldRate) || 0;
  const makingRateValue = Number(makingCharge) || 0;
  const stoneValue = Number(stoneCharge) || 0;
  const otherValue = Number(otherCharge) || 0;
  const advanceValue = Number(advance) || 0;

  const goldValue = weightValue * goldRateValue;
  const makingAmount = weightValue * makingRateValue;

  const totalAmount =
    goldValue +
    makingAmount +
    stoneValue +
    otherValue;

  const balanceAmount = Math.max(
    totalAmount - advanceValue,
    0
  );

  return {
    weight: weightValue,
    goldRate: goldRateValue,
    makingCharge: makingRateValue,
    stoneCharge: stoneValue,
    otherCharge: otherValue,
    advance: advanceValue,
    goldValue,
    makingAmount,
    totalAmount,
    balanceAmount,
  };
}

/* =========================================================
   ADMIN ORDERS - GET ALL
========================================================= */

app.get(
  "/api/admin/orders",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          o.*,
          c.name AS customer_name,
          c.phone AS customer_phone,
          g.name AS goldsmith_name
        FROM orders o
        INNER JOIN customers c
          ON c.id = o.customer_id
        LEFT JOIN goldsmiths g
          ON g.id = o.goldsmith_id
        ORDER BY o.id DESC
      `);

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "❌ Admin get orders error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Unable to fetch orders",
      });
    }
  }
);

/* =========================================================
   ADMIN ORDERS - CREATE
========================================================= */

app.post(
  "/api/admin/orders",
  authenticateAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const {
        customerName,
        phone,
        jewellery,
        purity,
        weight,
        goldRate,
        makingCharge,
        advance,
        deliveryDate,
        status,
        goldIssued,
        goldReturned,
        wastage,
        notes,
        category,
        stoneCharge,
        otherCharge,
      } = req.body;

      const name = String(customerName || "").trim();
      const normalizedPhone = String(phone || "").replace(
        /\D/g,
        ""
      );
      const jewelleryName = String(jewellery || "").trim();

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Customer name is required",
        });
      }

      if (normalizedPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: "Valid 10-digit Indian mobile number is required",
        });
      }

      if (!jewelleryName) {
        return res.status(400).json({
          success: false,
          message: "Jewellery name is required",
        });
      }

      const selectedPurity = String(
        purity || "22K"
      ).trim();

      const calculation = calculateOrderAmounts({
        weight,
        goldRate,
        makingCharge,
        stoneCharge,
        otherCharge,
        advance,
      });

      await client.query("BEGIN");

      const customer = await getCustomerForOrder(
        client,
        name,
        normalizedPhone
      );

      const idResult = await client.query(
        `SELECT nextval('orders_id_seq') AS id`
      );

      const orderId = Number(idResult.rows[0].id);

      const orderCode = `MGJ-TRK-${1000 + orderId}`;
      const trackCode = orderCode;

      const orderResult = await client.query(
        `
        INSERT INTO orders (
          id,
          order_code,
          track_code,
          customer_id,
          jewellery,
          category,
          purity,
          weight_grams,
          gold_rate,
          making_charge,
          wastage_grams,
          stone_charge,
          other_charge,
          total_amount,
          advance_amount,
          balance_amount,
          gold_issued_grams,
          gold_returned_grams,
          status,
          order_date,
          delivery_date,
          notes
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16,
          $17,
          $18,
          $19,
          CURRENT_DATE,
          $20,
          $21
        )
        RETURNING *
        `,
        [
          orderId,
          orderCode,
          trackCode,
          customer.id,
          jewelleryName,
          category || null,
          selectedPurity,
          calculation.weight,
          calculation.goldRate,
          calculation.makingCharge,
          Number(wastage) || 0,
          calculation.stoneCharge,
          calculation.otherCharge,
          calculation.totalAmount,
          calculation.advance,
          calculation.balanceAmount,
          Number(goldIssued) || 0,
          Number(goldReturned) || 0,
          status || "Order Received",
          deliveryDate || null,
          notes || null,
        ]
      );

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: {
          order: orderResult.rows[0],
          customer,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "❌ Admin create order error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: error.message || "Unable to create order",
      });
    } finally {
      client.release();
    }
  }
);

/* =========================================================
   ADMIN ORDERS - UPDATE
   THIS FIXES:
   PUT /api/admin/orders/:id
========================================================= */

app.put(
  "/api/admin/orders/:id",
  authenticateAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const orderId = Number(req.params.id);

      if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      const {
        customerName,
        phone,
        jewellery,
        purity,
        weight,
        goldRate,
        makingCharge,
        advance,
        deliveryDate,
        status,
        goldIssued,
        goldReturned,
        wastage,
        notes,
        category,
        stoneCharge,
        otherCharge,
      } = req.body;

      await client.query("BEGIN");

      const existing = await client.query(
        `
        SELECT *
        FROM orders
        WHERE id = $1
        FOR UPDATE
        `,
        [orderId]
      );

      if (existing.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const oldOrder = existing.rows[0];

      const customer = await getCustomerForOrder(
        client,
        customerName,
        phone
      );

      const calculation = calculateOrderAmounts({
        weight,
        goldRate,
        makingCharge,
        stoneCharge,
        otherCharge,
        advance,
      });

      const updateResult = await client.query(
        `
        UPDATE orders
       SET
  customer_id = $1,
  jewellery = $2,
  category = $3,
  purity = $4,
  weight_grams = $5,
  gold_rate = $6,
  making_charge = $7,
  wastage_grams = $8,
  stone_charge = $9,
  other_charge = $10,
  total_amount = $11,
  advance_amount = $12,
  balance_amount = $13,
  gold_issued_grams = $14,
  gold_returned_grams = $15,
  status = $16,
  delivery_date = $17,
  notes = $18
WHERE id = $19
        RETURNING *
        `,
        [
          customer.id,
          String(jewellery || "").trim(),
          category || null,
          purity || "22K",
          calculation.weight,
          calculation.goldRate,
          calculation.makingCharge,
          Number(wastage) || 0,
          calculation.stoneCharge,
          calculation.otherCharge,
          calculation.totalAmount,
          calculation.advance,
          calculation.balanceAmount,
          Number(goldIssued) || 0,
          Number(goldReturned) || 0,
          status || oldOrder.status || "Order Received",
          deliveryDate || null,
          notes || null,
          orderId,
        ]
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        message: "Order updated successfully",
        data: {
          order: updateResult.rows[0],
          customer,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "❌ Admin update order error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: error.message || "Unable to update order",
      });
    } finally {
      client.release();
    }
  }
);

/* =========================================================
   ADMIN ORDERS - STATUS
========================================================= */

app.patch(
  "/api/admin/orders/:id/status",
  authenticateAdmin,
  async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const { status } = req.body;

      if (!Number.isInteger(orderId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const result = await pool.query(
        `
        UPDATE orders
SET
  status = $1
WHERE id = $2
        RETURNING *
        `,
        [status, orderId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Order status updated",
        data: {
          order: result.rows[0],
        },
      });
    } catch (error) {
      console.error(
        "❌ Status update error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Unable to update order status",
      });
    }
  }
);

/* =========================================================
   ADMIN ORDERS - GOLD
========================================================= */

app.patch(
  "/api/admin/orders/:id/gold",
  authenticateAdmin,
  async (req, res) => {
    try {
      const orderId = Number(req.params.id);

      const {
        goldIssued,
        goldReturned,
        wastage,
      } = req.body;

      const result = await pool.query(
        `
        UPDATE orders
SET
  gold_issued_grams = $1,
  gold_returned_grams = $2,
  wastage_grams = $3
WHERE id = $4
        RETURNING *
        `,
        [
          Number(goldIssued) || 0,
          Number(goldReturned) || 0,
          Number(wastage) || 0,
          orderId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Gold details updated",
        data: {
          order: result.rows[0],
        },
      });
    } catch (error) {
      console.error(
        "❌ Gold update error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Unable to update gold details",
      });
    }
  }
);

/* =========================================================
   ADMIN ORDERS - DELETE
========================================================= */

app.delete(
  "/api/admin/orders/:id",
  authenticateAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const orderId = Number(req.params.id);

      await client.query("BEGIN");

      const result = await client.query(
        `
        DELETE FROM orders
        WHERE id = $1
        RETURNING *
        `,
        [orderId]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: "Order deleted successfully",
        data: {
          order: result.rows[0],
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "❌ Delete order error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Unable to delete order",
      });
    } finally {
      client.release();
    }
  }
);

/* =========================================================
   CUSTOM ORDER - PUBLIC
========================================================= */

app.post("/api/orders", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customerName,
      phone,
      jewellery,
      purity,
      weight,
      makingCharge,
      stoneCharge,
      otherCharge,
      advance,
      deliveryDate,
      notes,
    } = req.body;

    const name = String(customerName || "").trim();

    const normalizedPhone = String(phone || "")
      .replace(/\D/g, "");

    const jewelleryName = String(
      jewellery || ""
    ).trim();

    const selectedPurity = String(
      purity || "22K"
    ).trim();

    const weightGrams = Number(weight) || 0;
    const makingRate = Number(makingCharge) || 0;
    const stoneAmount = Number(stoneCharge) || 0;
    const otherAmount = Number(otherCharge) || 0;
    const advanceAmount = Number(advance) || 0;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (normalizedPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message:
          "Valid 10-digit Indian mobile number is required",
      });
    }

    if (!jewelleryName) {
      return res.status(400).json({
        success: false,
        message: "Jewellery name is required",
      });
    }

    if (
      selectedPurity !== "22K" &&
      selectedPurity !== "18K"
    ) {
      return res.status(400).json({
        success: false,
        message: "Purity must be 22K or 18K",
      });
    }

    if (weightGrams <= 0) {
      return res.status(400).json({
        success: false,
        message: "Weight must be greater than 0",
      });
    }

    if (makingRate < 0) {
      return res.status(400).json({
        success: false,
        message: "Making charge cannot be negative",
      });
    }

    if (
      stoneAmount < 0 ||
      otherAmount < 0 ||
      advanceAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Charges and advance cannot be negative",
      });
    }

    await client.query("BEGIN");

    const rateResult = await client.query(`
      SELECT
        gold_22k_rate,
        gold_18k_rate
      FROM gold_rates
      ORDER BY effective_date DESC, id DESC
      LIMIT 1
    `);

    if (rateResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Gold rate has not been configured yet",
      });
    }

    const latestRate =
      selectedPurity === "18K"
        ? Number(rateResult.rows[0].gold_18k_rate)
        : Number(rateResult.rows[0].gold_22k_rate);

    if (!Number.isFinite(latestRate) || latestRate <= 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Invalid gold rate configured in database",
      });
    }

    const goldValue = weightGrams * latestRate;
    const makingAmount = weightGrams * makingRate;

    const totalAmount =
      goldValue +
      makingAmount +
      stoneAmount +
      otherAmount;

    const balanceAmount = Math.max(
      totalAmount - advanceAmount,
      0
    );

    const customerResult = await client.query(
      `
      INSERT INTO customers (
        name,
        phone
      )
      VALUES ($1, $2)
      ON CONFLICT (phone)
      DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, name, phone
      `,
      [
        name,
        normalizedPhone,
      ]
    );

    const customer = customerResult.rows[0];

    const idResult = await client.query(
      `SELECT nextval('orders_id_seq') AS id`
    );

    const orderId = Number(idResult.rows[0].id);

    const orderCode = `MGJ-CUS-${1000 + orderId}`;

    const orderResult = await client.query(
      `
      INSERT INTO orders (
        id,
        order_code,
        track_code,
        customer_id,
        goldsmith_id,
        jewellery,
        category,
        purity,
        weight_grams,
        gold_rate,
        making_charge,
        wastage_grams,
        stone_charge,
        other_charge,
        total_amount,
        advance_amount,
        balance_amount,
        gold_issued_grams,
        gold_returned_grams,
        status,
        order_date,
        delivery_date,
        notes
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        NULL,
        $5,
        'Custom Design',
        $6,
        $7,
        $8,
        $9,
        0,
        $10,
        $11,
        $12,
        $13,
        $14,
        0,
        0,
        'Order Received',
        CURRENT_DATE,
        $15,
        $16
      )
      RETURNING *
      `,
      [
        orderId,
        orderCode,
        orderCode,
        customer.id,
        jewelleryName,
        selectedPurity,
        weightGrams,
        latestRate,
        makingRate,
        stoneAmount,
        otherAmount,
        totalAmount,
        advanceAmount,
        balanceAmount,
        deliveryDate || null,
        notes || null,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Custom order created successfully",
      data: {
        order: orderResult.rows[0],
        customer,
        calculation: {
          goldValue,
          makingAmount,
          totalAmount,
          advanceAmount,
          balanceAmount,
        },
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "❌ Custom order error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to create custom order",
    });
  } finally {
    client.release();
  }
});

/* =========================================================
   TRACK ORDER
========================================================= */

app.get(
  "/api/orders/:trackCode",
  async (req, res) => {
    try {
      const trackCode = String(
        req.params.trackCode || ""
      ).trim();

      if (!trackCode) {
        return res.status(400).json({
          success: false,
          message: "Tracking code is required",
        });
      }

      const result = await pool.query(
        `
        SELECT
          o.*,
          c.name AS customer_name,
          c.phone AS customer_phone,
          g.name AS goldsmith_name
        FROM orders o
        INNER JOIN customers c
          ON c.id = o.customer_id
        LEFT JOIN goldsmiths g
          ON g.id = o.goldsmith_id
        WHERE UPPER(o.track_code) = UPPER($1)
        LIMIT 1
        `,
        [trackCode]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "❌ Track order error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Unable to find order",
      });
    }
  }
);

/* =========================================================
   ADMIN - OLD ORDER LIST
========================================================= */

app.get(
  "/api/orders",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          o.*,
          c.name AS customer_name,
          c.phone AS customer_phone,
          g.name AS goldsmith_name
        FROM orders o
        INNER JOIN customers c
          ON c.id = o.customer_id
        LEFT JOIN goldsmiths g
          ON g.id = o.goldsmith_id
        ORDER BY o.id DESC
      `);

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "❌ Get orders error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Unable to fetch orders",
      });
    }
  }
);

/* =========================================================
   GOLD RATES - GET
========================================================= */

app.get("/api/gold-rates", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        gold_22k_rate,
        gold_18k_rate,
        silver_rate,
        effective_date,
        created_at,
        updated_at
      FROM gold_rates
      ORDER BY effective_date DESC, id DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null,
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "❌ Get gold rate error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch gold rates",
    });
  }
});

/* =========================================================
   GOLD RATES - UPDATE
========================================================= */

app.post(
  "/api/gold-rates",
  authenticateAdmin,
  async (req, res) => {
    try {
      const {
        gold22kRate,
        gold18kRate,
        silverRate,
        effectiveDate,
      } = req.body;

      const gold22 = Number(gold22kRate);
      const gold18 = Number(gold18kRate);
      const silver = Number(silverRate);

      if (
        !Number.isFinite(gold22) ||
        gold22 <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid 22K gold rate is required",
        });
      }

      if (
        !Number.isFinite(gold18) ||
        gold18 <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid 18K gold rate is required",
        });
      }

      if (
        !Number.isFinite(silver) ||
        silver <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid silver rate is required",
        });
      }

      const dateValue =
        effectiveDate ||
        new Date().toISOString().slice(0, 10);

      const result = await pool.query(
        `
        INSERT INTO gold_rates (
          gold_22k_rate,
          gold_18k_rate,
          silver_rate,
          effective_date
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
          gold22,
          gold18,
          silver,
          dateValue,
        ]
      );

      res.json({
        success: true,
        message: "Gold rates updated successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "❌ Update gold rate error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Unable to update gold rates",
      });
    }
  }
);

/* =========================================================
   GOLDSMITHS - GET
========================================================= */

app.get(
  "/api/admin/goldsmiths",
  authenticateAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          name,
          phone,
          specialization,
          active,
          created_at,
          updated_at
        FROM goldsmiths
        ORDER BY
          active DESC,
          name ASC
      `);

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "❌ Get goldsmiths error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Unable to fetch goldsmiths",
      });
    }
  }
);

/* =========================================================
   GOLDSMITHS - CREATE
========================================================= */

app.post(
  "/api/admin/goldsmiths",
  authenticateAdmin,
  async (req, res) => {
    try {
      const {
        name,
        phone,
        specialization,
        active,
      } = req.body;

      const cleanName = String(
        name || ""
      ).trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Goldsmith name is required",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO goldsmiths (
          name,
          phone,
          specialization,
          active
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
          cleanName,
          phone || null,
          specialization ||
            "Gold Jewellery Making",
          active !== false,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Goldsmith added successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "❌ Create goldsmith error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Unable to add goldsmith",
      });
    }
  }
);

/* =========================================================
   GOLDSMITHS - UPDATE
========================================================= */

app.put(
  "/api/admin/goldsmiths/:id",
  authenticateAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const {
        name,
        phone,
        specialization,
        active,
      } = req.body;

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid goldsmith ID",
        });
      }

      const cleanName = String(
        name || ""
      ).trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Goldsmith name is required",
        });
      }

      const result = await pool.query(
        `
        UPDATE goldsmiths
        SET
          name = $1,
          phone = $2,
          specialization = $3,
          active = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
        `,
        [
          cleanName,
          phone || null,
          specialization ||
            "Gold Jewellery Making",
          active !== false,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Goldsmith not found",
        });
      }

      res.json({
        success: true,
        message: "Goldsmith updated successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "❌ Update goldsmith error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Unable to update goldsmith",
      });
    }
  }
);

/* =========================================================
   GOLDSMITHS - ACTIVE / INACTIVE
========================================================= */

app.patch(
  "/api/admin/goldsmiths/:id/status",
  authenticateAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { active } = req.body;

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid goldsmith ID",
        });
      }

      const result = await pool.query(
        `
        UPDATE goldsmiths
        SET
          active = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [
          active === true,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Goldsmith not found",
        });
      }

      res.json({
        success: true,
        message: active
          ? "Goldsmith activated"
          : "Goldsmith deactivated",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "❌ Goldsmith status error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to update goldsmith status",
      });
    }
  }
);

/* =========================================================
   GOLDSMITHS - DELETE
========================================================= */

app.delete(
  "/api/admin/goldsmiths/:id",
  authenticateAdmin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid goldsmith ID",
        });
      }

      await client.query("BEGIN");

      await client.query(
        `
        UPDATE orders
        SET
          goldsmith_id = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE goldsmith_id = $1
        `,
        [id]
      );

      const result = await client.query(
        `
        DELETE FROM goldsmiths
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Goldsmith not found",
        });
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: "Goldsmith deleted successfully",
        data: result.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "❌ Delete goldsmith error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Unable to delete goldsmith",
      });
    } finally {
      client.release();
    }
  }
);

/* =========================================================
   ASSIGN GOLDSMITH TO ORDER
========================================================= */

app.patch(
  "/api/admin/orders/:id/goldsmith",
  authenticateAdmin,
  async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const { goldsmithId } = req.body;

      if (!Number.isInteger(orderId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      let selectedGoldsmithId = null;

      if (
        goldsmithId !== null &&
        goldsmithId !== undefined &&
        goldsmithId !== ""
      ) {
        selectedGoldsmithId = Number(goldsmithId);

        if (
          !Number.isInteger(
            selectedGoldsmithId
          )
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid goldsmith ID",
          });
        }

        const goldsmithResult =
          await pool.query(
            `
            SELECT *
            FROM goldsmiths
            WHERE id = $1
            LIMIT 1
            `,
            [selectedGoldsmithId]
          );

        if (
          goldsmithResult.rows.length === 0
        ) {
          return res.status(404).json({
            success: false,
            message: "Goldsmith not found",
          });
        }
      }

      const result = await pool.query(
        `
        UPDATE orders
SET
  goldsmith_id = $1
WHERE id = $2
        RETURNING *
        `,
        [
          selectedGoldsmithId,
          orderId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      let goldsmith = null;

      if (selectedGoldsmithId) {
        const goldsmithResult =
          await pool.query(
            `
            SELECT *
            FROM goldsmiths
            WHERE id = $1
            LIMIT 1
            `,
            [selectedGoldsmithId]
          );

        goldsmith =
          goldsmithResult.rows[0] || null;
      }

      res.json({
        success: true,
        message: goldsmith
          ? "Goldsmith assigned successfully"
          : "Goldsmith assignment removed",
        data: {
          order: result.rows[0],
          goldsmith,
        },
      });
    } catch (error) {
      console.error(
        "❌ Assign goldsmith error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to assign goldsmith",
      });
    }
  }
);

/* =========================================================
   GET ORDERS FOR ONE GOLDSMITH
========================================================= */

app.get(
  "/api/admin/goldsmiths/:id/orders",
  authenticateAdmin,
  async (req, res) => {
    try {
      const goldsmithId = Number(
        req.params.id
      );

      if (!Number.isInteger(goldsmithId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid goldsmith ID",
        });
      }

      const result = await pool.query(
        `
        SELECT
          o.*,
          c.name AS customer_name,
          c.phone AS customer_phone
        FROM orders o
        INNER JOIN customers c
          ON c.id = o.customer_id
        WHERE o.goldsmith_id = $1
        ORDER BY
          o.delivery_date ASC NULLS LAST,
          o.id DESC
        `,
        [goldsmithId]
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "❌ Goldsmith orders error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to fetch goldsmith orders",
      });
    }
  }
);

/* =========================================================
   404
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use((error, req, res, next) => {
  console.error(
    "❌ Unhandled server error:",
    error
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log("");
    console.log("======================================");
    console.log("🚀 Murugan Goldsmith & Jewels Backend");
    console.log("======================================");
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
    console.log("🗄️ PostgreSQL: Connected through db.js");
    console.log("🔐 JWT Authentication: Enabled");
    console.log("💎 Goldsmith API: Enabled");
    console.log("📦 Admin Order API: Enabled");
    console.log("======================================");
    console.log("");
  }
);