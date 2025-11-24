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
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.NEXT_PUBLIC_BACKEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json()); // Parse JSON data from forms

// --- DATABASE CONNECTION ---
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "dispatch_db",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
  ssl:
    process.env.DB_HOST !== "localhost" ? { rejectUnauthorized: false } : false,
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
    origin: "*", // Allow any client (TV, Phone, Laptop) to connect
    methods: ["GET", "POST", "PUT", "DELETE"],
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
        `SELECT * FROM emergency_alerts WHERE active = true ORDER BY id DESC`
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
      "SELECT * FROM absences ORDER BY absence_date DESC"
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
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO absences (badge_number, location_name, covering_badge_number, absence_date, notes) VALUES ($1, $2, $3, $4, $5)",
      [badge_number, location_name, covering_badge_number, absence_date, notes]
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
  } = req.body;
  try {
    await pool.query(
      "UPDATE absences SET badge_number=$1, location_name=$2, covering_badge_number=$3, absence_date=$4, notes=$5 WHERE id=$6",
      [
        badge_number,
        location_name,
        covering_badge_number,
        absence_date,
        notes,
        req.params.id,
      ]
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
      "SELECT * FROM downed_equipment ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/equipment", async (req, res) => {
  const { equipment_type, equipment_id_number, title, status, notes } =
    req.body;
  try {
    await pool.query(
      "INSERT INTO downed_equipment (equipment_type, equipment_id_number, title, status, notes) VALUES ($1, $2, $3, $4, $5)",
      [equipment_type, equipment_id_number, title, status, notes]
    );
    await broadcastUpdate("downed_equipment", "id DESC", "update_equipment");
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/api/equipment/:id", async (req, res) => {
  const { equipment_type, equipment_id_number, title, status, notes } =
    req.body;
  try {
    await pool.query(
      "UPDATE downed_equipment SET equipment_type=$1, equipment_id_number=$2, title=$3, status=$4, notes=$5 WHERE id=$6",
      [equipment_type, equipment_id_number, title, status, notes, req.params.id]
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
      "SELECT * FROM on_call_staff ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/oncall", async (req, res) => {
  const { department_name, person_name, phone_number } = req.body;
  try {
    await pool.query(
      "INSERT INTO on_call_staff (department_name, person_name, phone_number) VALUES ($1, $2, $3)",
      [department_name, person_name, phone_number]
    );
    await broadcastUpdate("on_call_staff", "id ASC", "update_oncall");
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/api/oncall/:id", async (req, res) => {
  const { department_name, person_name, phone_number } = req.body;
  try {
    await pool.query(
      "UPDATE on_call_staff SET department_name=$1, person_name=$2, phone_number=$3 WHERE id=$4",
      [department_name, person_name, phone_number, req.params.id]
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
      "SELECT * FROM notices ORDER BY notice_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/notices", async (req, res) => {
  const { notice_date, title, text_content } = req.body;
  try {
    await pool.query(
      "INSERT INTO notices (notice_date, title, text_content) VALUES ($1, $2, $3)",
      [notice_date, title, text_content]
    );
    await broadcastUpdate("notices", "notice_date DESC", "update_notices");
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/api/notices/:id", async (req, res) => {
  const { notice_date, title, text_content } = req.body;
  try {
    await pool.query(
      "UPDATE notices SET notice_date=$1, title=$2, text_content=$3 WHERE id=$4",
      [notice_date, title, text_content, req.params.id]
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
      "SELECT * FROM emergency_alerts WHERE active = true ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/alerts", async (req, res) => {
  const { severity_level, title } = req.body;
  try {
    await pool.query(
      "INSERT INTO emergency_alerts (severity_level, title, active) VALUES ($1, $2, true)",
      [severity_level, title]
    );
    await broadcastUpdate("emergency_alerts", "id DESC", "update_alerts");
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/api/alerts/:id/dismiss", async (req, res) => {
  try {
    await pool.query("UPDATE emergency_alerts SET active = false WHERE id=$1", [
      req.params.id,
    ]);
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

app.post("/api/verify-pin", (req, res) => {
  const { pin } = req.body;
  const CORRECT_PIN = process.env.ADMIN_PIN || "1234";

  if (pin === CORRECT_PIN) {
    res.json({ success: true, message: "Access Granted" });
  } else {
    res.status(401).json({ success: false, message: "Invalid PIN" });
  }
});

// --- START SERVER ---
server.listen(PORT, () => {
  console.log(`-----------------------------------------------`);
  console.log(`🚀 DISPATCH SERVER RUNNING ON PORT ${PORT}`);
  console.log(`-----------------------------------------------`);
});
