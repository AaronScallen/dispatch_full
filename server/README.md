# Dispatch Server (Backend)

Express.js + Socket.IO server for the Dispatch management system.

## Features

- RESTful API for CRUD operations
- Real-time updates via Socket.IO
- PostgreSQL database integration
- CORS configured for secure cross-origin requests
- Admin login tracking
- Health check endpoint for monitoring
- Graceful shutdown handling

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment Variables**

   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:

   ```bash
   NODE_ENV=development  # or production
   PORT=5000

   # Database Configuration
   DB_HOST=localhost    # or your database host
   DB_USER=postgres     # your database user
   DB_NAME=dispatch_db  # your database name
   DB_PASSWORD=your_password
   DB_PORT=5432

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

3. **Set Up Database**

   Create a PostgreSQL database and run the migrations:

   ```bash
   cd migrations
   node run_migration.js
   ```

   Or manually run the SQL files in the `migrations/` folder.

4. **Start the Server**

   Development mode:

   ```bash
   npm run dev
   ```

   Production mode:

   ```bash
   npm start
   ```

## API Endpoints

### Health & Status

- `GET /` - API online check
- `GET /health` - Health check with database status
- `GET /api/status` - API status and version

### Absences

- `GET /api/absences` - Get all absences
- `POST /api/absences` - Create new absence
- `PUT /api/absences/:id` - Update absence
- `DELETE /api/absences/:id` - Delete absence

### Equipment

- `GET /api/equipment` - Get all equipment issues
- `POST /api/equipment` - Create new equipment issue
- `PUT /api/equipment/:id` - Update equipment issue
- `DELETE /api/equipment/:id` - Delete equipment issue

### On-Call Staff

- `GET /api/oncall` - Get on-call staff
- `POST /api/oncall` - Add on-call staff
- `PUT /api/oncall/:id` - Update on-call staff
- `DELETE /api/oncall/:id` - Remove on-call staff

### Notices

- `GET /api/notices` - Get all notices
- `POST /api/notices` - Create new notice
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice

### Emergency Alerts

- `GET /api/alerts` - Get active alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id/dismiss` - Dismiss alert
- `POST /api/alerts/clear` - Clear all alerts

### Admin Tracking

- `POST /api/admin-login` - Log admin login
- `GET /api/admin-login-logs` - Get login history

## Socket.IO Events

### Server → Client

- `update_absences` - Absence data changed
- `update_equipment` - Equipment data changed
- `update_oncall` - On-call staff changed
- `update_notices` - Notices changed
- `update_alerts` - Emergency alerts changed

### Client → Server

- `connection` - Client connected
- `disconnect` - Client disconnected

## Environment Variables

| Variable       | Required | Default       | Description           |
| -------------- | -------- | ------------- | --------------------- |
| `NODE_ENV`     | No       | `development` | Environment mode      |
| `PORT`         | No       | `5000`        | Server port           |
| `DB_HOST`      | Yes\*    | `localhost`   | Database host         |
| `DB_USER`      | Yes\*    | `postgres`    | Database user         |
| `DB_NAME`      | Yes\*    | `dispatch_db` | Database name         |
| `DB_PASSWORD`  | Yes\*    | -             | Database password     |
| `DB_PORT`      | No       | `5432`        | Database port         |
| `FRONTEND_URL` | No       | -             | Frontend URL for CORS |

\*Required in production

## Production Deployment

See [PRODUCTION_CHECKLIST.md](../docs/PRODUCTION_CHECKLIST.md) for detailed deployment instructions.

### Quick Deploy to Render

1. Create PostgreSQL database on Render
2. Create Web Service pointing to this directory
3. Set environment variables
4. Deploy!

## Database Schema

The database includes the following tables:

- `absences` - Employee absence records
- `downed_equipment` - Equipment issues/outages
- `on_call_staff` - On-call personnel
- `notices` - General notices/announcements
- `emergency_alerts` - Active emergency alerts
- `admin_login_logs` - Admin login tracking

See `migrations/` folder for complete schema.

## Development

### Project Structure

```
server/
├── index.js           # Main server file
├── package.json       # Dependencies
├── .env.example       # Environment template
├── .gitignore        # Git ignore rules
└── migrations/        # Database migrations
    ├── *.sql         # SQL migration files
    └── run_migration.js
```

### Adding New Endpoints

1. Add route in `index.js`
2. Implement database query
3. Add error handling
4. Call `broadcastUpdate()` if data changes
5. Test endpoint

### Debugging

Enable detailed logging by setting:

```bash
NODE_ENV=development
```

This will show:

- Socket.IO connection/disconnection events
- Broadcast update messages
- Database connection details

## Troubleshooting

### Database Connection Fails

- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists
- Check firewall/network settings

### CORS Errors

- Add frontend URL to `allowedOrigins` in `index.js`
- Or set `FRONTEND_URL` environment variable

### Socket.IO Not Connecting

- Verify frontend Socket.IO client version matches server
- Check CORS configuration
- Ensure transports are set to `["polling", "websocket"]`

### Server Crashes on Startup

- Check for missing environment variables
- Verify database is accessible
- Review error logs

## Performance Tips

- Database pool is configured for 20 max connections
- Idle connections timeout after 30 seconds
- Use indexes on frequently queried columns
- Monitor `/health` endpoint for database status

## License

ISC

## Support

For issues or questions, please check:

- [Deployment Guide](../docs/DEPLOYMENT.md)
- [Production Checklist](../docs/PRODUCTION_CHECKLIST.md)
