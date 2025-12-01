// Script to run database migrations
require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "dispatch_db",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  try {
    console.log("🔄 Starting migration...");
    console.log(`📁 Database: ${process.env.DB_NAME || "dispatch_db"}`);

    const sqlFile = path.join(__dirname, "add_user_tracking.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    await pool.query(sql);

    console.log("✅ Migration completed successfully!");
    console.log("\nThe following columns were added to all tables:");
    console.log("  - created_by_email");
    console.log("  - created_by_name");
    console.log("  - updated_by_email");
    console.log("  - updated_by_name");
    console.log("  - created_at");
    console.log("  - updated_at");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error.message);
    process.exit(1);
  }
}

runMigration();
