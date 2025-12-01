# Admin Login Tracking System

## Overview

This system tracks all admin user logins to the dispatch application for security auditing and compliance purposes. Login data is stored in a PostgreSQL/Neon database table.

## Database Schema

### Table: `admin_login_logs`

Stores login events for admin users.

| Column          | Type               | Description                                   |
| --------------- | ------------------ | --------------------------------------------- |
| id              | SERIAL PRIMARY KEY | Unique identifier for each login event        |
| user_id         | VARCHAR(255)       | Stack Auth user ID                            |
| user_email      | VARCHAR(255)       | Email address of the user                     |
| login_timestamp | TIMESTAMP          | When the login occurred (UTC, auto-generated) |
| ip_address      | VARCHAR(45)        | IP address of the client (IPv4 or IPv6)       |
| user_agent      | TEXT               | Browser user agent string                     |
| session_info    | JSONB              | Additional session metadata in JSON format    |

### Indexes

- `idx_admin_login_logs_user_id` - Fast queries by user ID
- `idx_admin_login_logs_timestamp` - Fast time-based queries
- `idx_admin_login_logs_email` - Fast queries by email

## Setup Instructions

### 1. Run the Database Migration

Navigate to the server directory and run the migration:

```bash
cd server
node migrations/run_migration.js migrations/create_admin_login_logs.sql
```

Or manually execute the SQL file in your Neon dashboard.

### 2. Verify the Table Exists

Connect to your database and verify:

```sql
SELECT * FROM admin_login_logs LIMIT 5;
```

### 3. Test the Implementation

1. Start your server: `npm run dev` (in server directory)
2. Start your frontend: `npm run dev` (in front directory)
3. Navigate to `/admin` in your browser
4. Login with your admin credentials
5. Check the database for the login record:

```sql
SELECT * FROM admin_login_logs ORDER BY login_timestamp DESC LIMIT 10;
```

## API Endpoints

### POST /api/admin-login

Logs an admin login event.

**Request Body:**

```json
{
  "user_id": "stack_user_123",
  "user_email": "admin@example.com",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "session_info": {
    "display_name": "Admin User",
    "primary_email_verified": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login logged successfully"
}
```

### GET /api/admin-login-logs

Retrieves admin login history.

**Query Parameters:**

- `limit` (optional, default: 100) - Maximum number of records to return
- `user_id` (optional) - Filter by specific user ID
- `user_email` (optional) - Filter by specific email

**Examples:**

```
GET /api/admin-login-logs?limit=50
GET /api/admin-login-logs?user_id=stack_user_123
GET /api/admin-login-logs?user_email=admin@example.com
GET /api/admin-login-logs?user_id=stack_user_123&limit=20
```

**Response:**

```json
[
  {
    "id": 1,
    "user_id": "stack_user_123",
    "user_email": "admin@example.com",
    "login_timestamp": "2025-12-01T10:30:00.000Z",
    "ip_address": null,
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "session_info": {
      "display_name": "Admin User",
      "primary_email_verified": true
    }
  }
]
```

## Implementation Details

### Client-Side (Admin Page)

The admin page (`front/app/admin/page.tsx`) automatically logs user access when:

1. The page loads
2. The user is authenticated
3. The Stack Auth user object is available

The tracking uses a `useEffect` hook that runs once on component mount:

```typescript
useEffect(() => {
  const logAdminLogin = async () => {
    if (user) {
      await axios.post(`${API}/admin-login`, {
        user_id: user.id,
        user_email: user.primaryEmail || "unknown",
        user_agent: navigator.userAgent,
        session_info: {
          /* ... */
        },
      });
    }
  };
  logAdminLogin();
}, [user]);
```

### Server-Side (Express API)

The server endpoint (`server/index.js`) receives login data and inserts it into the database:

```javascript
app.post("/api/admin-login", async (req, res) => {
  const { user_id, user_email, ip_address, user_agent, session_info } =
    req.body;
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
    ]
  );
});
```

## Security Considerations

1. **Privacy**: The system logs user activity. Ensure compliance with privacy regulations (GDPR, etc.)
2. **Data Retention**: Consider implementing a data retention policy to periodically delete old logs
3. **Access Control**: The `/api/admin-login-logs` endpoint should be protected to prevent unauthorized access
4. **IP Address**: Currently set to `null` on client-side. Can be captured server-side using `req.ip` if needed

## Future Enhancements

### 1. Add IP Address Capture

Modify the server endpoint to capture the client's IP:

```javascript
app.post("/api/admin-login", async (req, res) => {
  const { user_id, user_email, user_agent, session_info } = req.body;
  const ip_address = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  await pool.query(/* ... */, [user_id, user_email, ip_address, /* ... */]);
});
```

### 2. Add Authentication to Login Logs Endpoint

Protect the logs endpoint to require admin authentication:

```javascript
app.get("/api/admin-login-logs", authenticateAdmin, async (req, res) => {
  // ... existing code
});
```

### 3. Create Admin Dashboard View

Create a UI component to display login logs in the admin panel.

### 4. Add Logout Tracking

Track when users log out by adding a similar endpoint for logout events.

### 5. Add Data Retention Policy

Automatically delete logs older than X days:

```sql
DELETE FROM admin_login_logs
WHERE login_timestamp < NOW() - INTERVAL '90 days';
```

## Troubleshooting

### Login not being logged

1. Check browser console for errors
2. Verify the server is running
3. Check server logs for database connection issues
4. Ensure the migration was run successfully

### Database connection errors

1. Verify your `.env` file has correct database credentials
2. Check that the `admin_login_logs` table exists
3. Ensure your database user has INSERT permissions

### Testing queries

```sql
-- View all logins
SELECT * FROM admin_login_logs ORDER BY login_timestamp DESC;

-- Count logins per user
SELECT user_email, COUNT(*) as login_count
FROM admin_login_logs
GROUP BY user_email
ORDER BY login_count DESC;

-- Recent logins (last 24 hours)
SELECT * FROM admin_login_logs
WHERE login_timestamp > NOW() - INTERVAL '24 hours'
ORDER BY login_timestamp DESC;
```

## Questions or Issues?

If you encounter any issues with the login tracking system, check:

1. Database table exists and has correct schema
2. Server endpoint is accessible
3. Frontend is sending the correct data format
4. User object from Stack Auth is properly loaded
