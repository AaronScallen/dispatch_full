# User Tracking Implementation Summary

## Overview

This implementation adds comprehensive user tracking to the dispatch system, logging who created and updated each record across all database tables. It also displays the currently logged-in user at the bottom right of the admin panel.

## Changes Made

### 1. Database Changes (`server/migrations/add_user_tracking.sql`)

Added the following columns to all tables (absences, downed_equipment, on_call_staff, notices, emergency_alerts):

- `created_by_email` - Email of user who created the record
- `created_by_name` - Display name of user who created the record
- `updated_by_email` - Email of user who last updated the record
- `updated_by_name` - Display name of user who last updated the record
- `created_at` - Timestamp when record was created
- `updated_at` - Timestamp when record was last updated

Also includes:

- Performance indexes on user tracking columns
- Automatic triggers to update `updated_at` timestamp on changes

### 2. Backend API Changes (`server/index.js`)

Updated all POST and PUT endpoints to:

- Accept user information (`created_by_email`, `created_by_name`, `updated_by_email`, `updated_by_name`)
- Store user information in the database with each create/update operation

Affected endpoints:

- POST `/api/absences` - Now tracks who created the absence
- PUT `/api/absences/:id` - Now tracks who updated the absence
- POST `/api/equipment` - Now tracks who reported the equipment
- PUT `/api/equipment/:id` - Now tracks who updated the equipment status
- POST `/api/oncall` - Now tracks who added the on-call staff
- PUT `/api/oncall/:id` - Now tracks who updated the staff info
- POST `/api/notices` - Now tracks who posted the notice
- PUT `/api/notices/:id` - Now tracks who updated the notice
- POST `/api/alerts` - Now tracks who triggered the alert
- PUT `/api/alerts/:id/dismiss` - Now tracks who dismissed the alert

### 3. TypeScript Types (`front/types/index.ts`)

Added optional user tracking fields to all interfaces:

- `Absence`
- `Equipment`
- `OnCall`
- `Notice`
- `Alert`

### 4. Admin Panel (`front/app/admin/page.tsx`)

Updated all submit handlers to:

- Include the logged-in user's email and display name with every API request
- Automatically populate user tracking fields on create and update operations

Added a user display component:

- Fixed position at bottom right of the screen
- Shows the logged-in user's name and email
- Green animated pulse indicator for active status
- Clean, minimal design that doesn't obstruct content

## Setup Instructions

### Step 1: Run the Database Migration

Navigate to the server directory and run:

```bash
cd server
node migrations/run_migration.js
```

Or manually using psql:

```bash
psql -U your_username -d dispatch_db -f server/migrations/add_user_tracking.sql
```

### Step 2: Restart the Backend Server

```bash
cd server
npm start
```

### Step 3: Restart the Frontend

```bash
cd front
npm run dev
```

## Usage

### For Administrators

Once logged in to the admin panel:

1. Your name will appear at the bottom right corner of the screen
2. Any records you create or update will automatically track your user information
3. The green pulse indicator shows you're actively logged in

### Viewing User History

To see who created or modified records, you can query the database:

```sql
-- See who created absences
SELECT badge_number, location_name, created_by_name, created_at
FROM absences
ORDER BY created_at DESC;

-- See recent updates with user info
SELECT title, updated_by_name, updated_at
FROM notices
WHERE updated_at IS NOT NULL
ORDER BY updated_at DESC;

-- Get audit trail for equipment
SELECT
  equipment_id_number,
  title,
  created_by_name as created_by,
  created_at,
  updated_by_name as updated_by,
  updated_at
FROM downed_equipment
ORDER BY updated_at DESC NULLS LAST;
```

## Benefits

1. **Accountability** - Every change is tracked to a specific user
2. **Audit Trail** - Complete history of who created and modified records
3. **User Visibility** - Users can see they're logged in and active
4. **Data Integrity** - Helps identify sources of data issues
5. **Compliance** - Meets requirements for tracking changes in regulated environments

## Future Enhancements

Possible additions:

- Admin panel UI to display creation/update history on each record
- Activity log page showing recent changes by all users
- User-specific dashboards showing their contributions
- Email notifications when records are modified
- Advanced filtering by user in the admin panel

## Troubleshooting

### Migration fails

- Check database connection settings in `.env`
- Ensure PostgreSQL server is running
- Verify you have permission to alter tables

### User info not saving

- Ensure you're logged in via Stack Auth
- Check browser console for errors
- Verify backend is receiving user data in request payload

### User display not appearing

- Confirm Stack Auth is properly configured
- Check that `useUser()` hook is returning user data
- Verify you're on the admin page (`/admin`)
