# Database Migrations

## User Tracking Migration

This migration adds user tracking capabilities to all tables in the dispatch system.

### What it does:

- Adds `created_by_email` and `created_by_name` columns to track who created each record
- Adds `updated_by_email` and `updated_by_name` columns to track who last updated each record
- Adds `created_at` and `updated_at` timestamp columns
- Creates indexes for better query performance
- Sets up automatic triggers to update the `updated_at` timestamp on record changes

### How to run:

#### Option 1: Using psql command line

```bash
psql -U your_username -d dispatch_db -f add_user_tracking.sql
```

#### Option 2: Using pgAdmin

1. Open pgAdmin and connect to your database
2. Right-click on your database → Query Tool
3. Open the `add_user_tracking.sql` file
4. Execute the script

#### Option 3: Using Node.js (from server directory)

```bash
node -e "const {Pool}=require('pg');require('dotenv').config();const pool=new Pool({user:process.env.DB_USER,host:process.env.DB_HOST,database:process.env.DB_NAME,password:process.env.DB_PASSWORD,port:process.env.DB_PORT});const fs=require('fs');pool.query(fs.readFileSync('./migrations/add_user_tracking.sql','utf8')).then(()=>{console.log('Migration completed');process.exit(0);}).catch(e=>{console.error(e);process.exit(1);});"
```

### Verification:

After running the migration, you can verify it worked by checking the table structure:

```sql
\d absences
```

You should see the new columns: `created_by_email`, `created_by_name`, `updated_by_email`, `updated_by_name`, `created_at`, and `updated_at`.

### Notes:

- The migration is safe to run multiple times (uses `IF NOT EXISTS` and `IF EXISTS` clauses)
- Existing records will have `NULL` values for the new columns
- New records created through the admin panel will automatically populate these fields
