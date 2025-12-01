# Quick Start: User Tracking Setup

## Run This Single Command

From the `server` directory:

```bash
node migrations/run_migration.js
```

That's it! The migration will:

- ✅ Add user tracking columns to all tables
- ✅ Create performance indexes
- ✅ Set up automatic timestamp triggers
- ✅ Handle all database updates safely

## What You'll See

The logged-in user will appear at the bottom right of the admin panel:

```
┌─────────────────────────┐
│ ● John Doe              │
│   john@example.com      │
└─────────────────────────┘
```

## Verify It Worked

After migration, check any table:

```bash
psql -U your_username -d dispatch_db -c "\d absences"
```

You should see new columns:

- created_by_email
- created_by_name
- updated_by_email
- updated_by_name
- created_at
- updated_at

## Need Help?

See `USER_TRACKING_IMPLEMENTATION.md` for detailed documentation.
