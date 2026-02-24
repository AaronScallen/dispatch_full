require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");

// --- CONFIGURATION ---
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
// Allow multiple origins for CORS (localhost for dev + production URL)
const allowedOrigins = [
  "https://dispatch-full.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

// Add additional frontend URLs from env if present
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
); // Allow requests from the Frontend
app.use(bodyParser.json()); // Parse JSON data from forms

// --- DATABASE CONNECTION ---
const isProduction = process.env.DB_HOST && process.env.DB_HOST !== "localhost";
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "dispatch_db",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// [DEBUG] Test Database Connection Immediately
// This prevents the "Start then Stop" issue by logging the exact error
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ FATAL DATABASE ERROR:");
    console.error("   " + err.message);
    console.error("   Please check your .env file password and database name.");
    // Keep the process alive slightly longer to read the error, then exit
    setTimeout(() => process.exit(1), 100);
  } else {
    console.log("✅ Database connected successfully!");
    release();
  }
});

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Use the same allowed origins as Express
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket Client Connected: " + socket.id);
  socket.on("disconnect", () => {
    // Optional: Log disconnection
  });
});

// --- HELPER: Broadcast Updates ---
// This function re-fetches data and sends it to the TV immediately
const broadcastUpdate = async (table, orderBy, eventName) => {
  try {
    let query = `SELECT * FROM ${table} ORDER BY ${orderBy}`;

    // Special logic for alerts: Dashboard usually only needs active ones
    if (table === "emergency_alerts") {
      const activeResult = await pool.query(
        `SELECT * FROM emergency_alerts WHERE active = true ORDER BY id DESC`,
      );
      io.emit("update_alerts", activeResult.rows);
      return;
    }

    const result = await pool.query(query);
    io.emit(eventName, result.rows);
    console.log(`📢 Broadcasted update for: ${eventName}`);
  } catch (err) {
    console.error(`Error broadcasting ${table}:`, err);
  }
};

// --- API ROUTES ---

// Root Check
app.get("/", (req, res) => {
  res.send("Dispatch API is Online");
});

// === 1. ABSENCES ===
app.get("/api/absences", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM absences ORDER BY absence_date DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/absences", async (req, res) => {
  const {
    badge_number,
    location_name,
    covering_badge_number,
    absence_date,
    notes,
    created_by_email,
    created_by_name,
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO absences (badge_number, location_name, covering_badge_number, absence_date, notes, created_by_email, created_by_name) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        badge_number,
        location_name,
        covering_badge_number,
        absence_date,
        notes,
        created_by_email,
        created_by_name,
      ],
    );
    await broadcastUpdate("absences", "absence_date DESC", "update_absences");
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/api/absences/:id", async (req, res) => {
  const {
    badge_number,
    location_name,
    covering_badge_number,
    absence_date,
    notes,
    updated_by_email,
    updated_by_name,
  } = req.body;
  try {
    await pool.query(
      "UPDATE absences SET badge_number=$1, location_name=$2, covering_badge_number=$3, absence_date=$4, notes=$5, updated_by_email=$6, updated_by_name=$7 WHERE id=$8",
      [
        badge_number,
        location_name,
        covering_badge_number,
        absence_date,
        notes,
        updated_by_email,
        updated_by_name,
        req.params.id,
      ],
    );
    await broadcastUpdate("absences", "absence_date DESC", "update_absences");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete("/api/absences/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM absences WHERE id=$1", [req.params.id]);
    await broadcastUpdate("absences", "absence_date DESC", "update_absences");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// === 2. EQUIPMENT ===
app.get("/api/equipment", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM downed_equipment ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/equipment", async (req, res) => {
  const {
    equipment_type,
    equipment_id_number,
    title,
    status,
    notes,
    created_by_email,
    created_by_name,
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO downed_equipment (equipment_type, equipment_id_number, title, status, notes, created_by_email, created_by_name) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        equipment_type,
        equipment_id_number,
        title,
        status,
        notes,
        created_by_email,
        created_by_name,
      ],
    );
    await broadcastUpdate("downed_equipment", "id DESC", "update_equipment");
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/api/equipment/:id", async (req, res) => {
  const {
    equipment_type,
    equipment_id_number,
    title,
    status,
    notes,
    updated_by_email,
    updated_by_name,
  } = req.body;
  try {
    await pool.query(
      "UPDATE downed_equipment SET equipment_type=$1, equipment_id_number=$2, title=$3, status=$4, notes=$5, updated_by_email=$6, updated_by_name=$7 WHERE id=$8",
      [
        equipment_type,
        equipment_id_number,
        title,
        status,
        notes,
        updated_by_email,
        updated_by_name,
        req.params.id,
      ],
    );
    await broadcastUpdate("downed_equipment", "id DESC", "update_equipment");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete("/api/equipment/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM downed_equipment WHERE id=$1", [
      req.params.id,
    ]);
    await broadcastUpdate("downed_equipment", "id DESC", "update_equipment");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// === 3. ON CALL STAFF ===
app.get("/api/oncall", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM on_call_staff ORDER BY id ASC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/oncall", async (req, res) => {
  const {
    department_name,
    person_name,
    phone_number,
    created_by_email,
    created_by_name,
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO on_call_staff (department_name, person_name, phone_number, created_by_email, created_by_name) VALUES ($1, $2, $3, $4, $5)",
      [
        department_name,
        person_name,
        phone_number,
        created_by_email,
        created_by_name,
      ],
    );
    await broadcastUpdate("on_call_staff", "id ASC", "update_oncall");
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/api/oncall/:id", async (req, res) => {
  const {
    department_name,
    person_name,
    phone_number,
    updated_by_email,
    updated_by_name,
  } = req.body;
  try {
    await pool.query(
      "UPDATE on_call_staff SET department_name=$1, person_name=$2, phone_number=$3, updated_by_email=$4, updated_by_name=$5 WHERE id=$6",
      [
        department_name,
        person_name,
        phone_number,
        updated_by_email,
        updated_by_name,
        req.params.id,
      ],
    );
    await broadcastUpdate("on_call_staff", "id ASC", "update_oncall");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete("/api/oncall/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM on_call_staff WHERE id=$1", [req.params.id]);
    await broadcastUpdate("on_call_staff", "id ASC", "update_oncall");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// === 4. NOTICES ===
app.get("/api/notices", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notices ORDER BY notice_date DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/notices", async (req, res) => {
  const {
    notice_date,
    title,
    text_content,
    created_by_email,
    created_by_name,
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO notices (notice_date, title, text_content, created_by_email, created_by_name) VALUES ($1, $2, $3, $4, $5)",
      [notice_date, title, text_content, created_by_email, created_by_name],
    );
    await broadcastUpdate("notices", "notice_date DESC", "update_notices");
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/api/notices/:id", async (req, res) => {
  const {
    notice_date,
    title,
    text_content,
    updated_by_email,
    updated_by_name,
  } = req.body;
  try {
    await pool.query(
      "UPDATE notices SET notice_date=$1, title=$2, text_content=$3, updated_by_email=$4, updated_by_name=$5 WHERE id=$6",
      [
        notice_date,
        title,
        text_content,
        updated_by_email,
        updated_by_name,
        req.params.id,
      ],
    );
    await broadcastUpdate("notices", "notice_date DESC", "update_notices");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete("/api/notices/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM notices WHERE id=$1", [req.params.id]);
    await broadcastUpdate("notices", "notice_date DESC", "update_notices");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// === 5. ALERTS ===
app.get("/api/alerts", async (req, res) => {
  try {
    // Get active alerts for display
    const result = await pool.query(
      "SELECT * FROM emergency_alerts WHERE active = true ORDER BY id DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/alerts", async (req, res) => {
  const { severity_level, title, created_by_email, created_by_name } = req.body;
  try {
    await pool.query(
      "INSERT INTO emergency_alerts (severity_level, title, active, created_by_email, created_by_name) VALUES ($1, $2, true, $3, $4)",
      [severity_level, title, created_by_email, created_by_name],
    );
    await broadcastUpdate("emergency_alerts", "id DESC", "update_alerts");
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/api/alerts/:id/dismiss", async (req, res) => {
  const { updated_by_email, updated_by_name } = req.body;
  try {
    await pool.query(
      "UPDATE emergency_alerts SET active = false, updated_by_email=$1, updated_by_name=$2 WHERE id=$3",
      [updated_by_email, updated_by_name, req.params.id],
    );
    await broadcastUpdate("emergency_alerts", "id DESC", "update_alerts");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/alerts/clear", async (req, res) => {
  try {
    await pool.query("UPDATE emergency_alerts SET active = false");
    await broadcastUpdate("emergency_alerts", "id DESC", "update_alerts");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// === ADMIN LOGIN TRACKING ===
app.post("/api/admin-login", async (req, res) => {
  const { user_id, user_email, ip_address, user_agent, session_info } =
    req.body;

  try {
    await pool.query(
      `INSERT INTO admin_login_logs 
       (user_id, user_email, ip_address, user_agent, session_info) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user_id,
        user_email,
        ip_address,
        user_agent,
        session_info ? JSON.stringify(session_info) : null,
      ],
    );
    res
      .status(201)
      .json({ success: true, message: "Login logged successfully" });
  } catch (err) {
    console.error("Error logging admin login:", err);
    res.status(500).send(err.message);
  }
});

// Get admin login history (optional - for viewing logs)
app.get("/api/admin-login-logs", async (req, res) => {
  const { limit = 100, user_id, user_email } = req.query;

  try {
    let query = "SELECT * FROM admin_login_logs";
    const params = [];
    const conditions = [];

    if (user_id) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(user_id);
    }

    if (user_email) {
      conditions.push(`user_email = $${params.length + 1}`);
      params.push(user_email);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += ` ORDER BY login_timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching admin login logs:", err);
    res.status(500).send(err.message);
  }
});

// --- START SERVER ---
server.listen(PORT, () => {
  console.log(`-----------------------------------------------`);
  console.log(`🚀 DISPATCH SERVER RUNNING ON PORT ${PORT}`);
  console.log(`-----------------------------------------------`);
});
