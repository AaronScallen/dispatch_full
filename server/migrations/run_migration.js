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
    // Get migration file from command line args or use default
    const migrationFile = process.argv[2] || "add_user_tracking.sql";
    
    console.log("🔄 Starting migration...");
    console.log(`📁 Database: ${process.env.DB_NAME || "dispatch_db"}`);
    console.log(`📄 Migration file: ${migrationFile}`);

    const sqlFile = path.join(__dirname, migrationFile);
    
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`Migration file not found: ${sqlFile}`);
    }
    
    const sql = fs.readFileSync(sqlFile, "utf8");

    await pool.query(sql);

    console.log("✅ Migration completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error.message);
    process.exit(1);
  }
}

runMigration();
