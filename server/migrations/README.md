# Database Migrations

This directory contains database migrations for the dispatch system.

## Available Migrations

### 1. User Tracking Migration (`add_user_tracking.sql`)

Adds user tracking capabilities to all tables in the dispatch system.

**What it does:**

- Adds `created_by_email` and `created_by_name` columns to track who created each record
- Adds `updated_by_email` and `updated_by_name` columns to track who last updated each record
- Adds `created_at` and `updated_at` timestamp columns
- Creates indexes for better query performance
- Sets up automatic triggers to update the `updated_at` timestamp on record changes

### 2. Admin Login Tracking Migration (`create_admin_login_logs.sql`)

Creates a table to track admin user logins for security auditing.

**What it does:**

- Creates `admin_login_logs` table
- Adds indexes for efficient querying
- Tracks user ID, email, timestamp, IP address, user agent, and session info

See `docs/ADMIN_LOGIN_TRACKING.md` for detailed documentation.

## How to Run Migrations

### Recommended: Using the Migration Runner Script

From the `server` directory:

```bash
# Run user tracking migration
node migrations/run_migration.js add_user_tracking.sql

# Run admin login tracking migration
node migrations/run_migration.js create_admin_login_logs.sql
```

### Alternative Methods

#### Option 1: Using psql command line

```bash
psql -U your_username -d dispatch_db -f migrations/add_user_tracking.sql
psql -U your_username -d dispatch_db -f migrations/create_admin_login_logs.sql
```

#### Option 2: Using pgAdmin

1. Open pgAdmin and connect to your database
2. Right-click on your database → Query Tool
3. Open the migration SQL file
4. Execute the script

#### Option 3: Through Neon Dashboard

1. Log into your Neon dashboard
2. Navigate to the SQL Editor
3. Copy and paste the migration SQL
4. Execute

## Verification

After running migrations, verify the changes:

```sql
-- Check user tracking columns
\d absences

-- Check admin login logs table
\d admin_login_logs

-- View recent admin logins
SELECT * FROM admin_login_logs ORDER BY login_timestamp DESC LIMIT 10;
```

## Notes

- All migrations are safe to run multiple times (use `IF NOT EXISTS`/`IF EXISTS` clauses)
- Existing records will have `NULL` values for new columns
- New records created through the admin panel will automatically populate tracking fields
- Make sure your `.env` file is properly configured before running migrations
