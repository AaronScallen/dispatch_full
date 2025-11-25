# Dispatch Full - Emergency Dispatch Management System

A real-time emergency dispatch management system with a Next.js frontend and Express.js backend.

## Features

- 🔐 **Authentication** - Stack Auth integration for secure user management
- 👨‍💼 **Admin Dashboard** - Manage all dispatch operations
- 📊 **Real-time Updates** - Socket.IO for instant data synchronization
- 📋 **Absence Management** - Track staff absences and coverage
- 🚨 **Emergency Alerts** - Broadcast critical alerts to all displays
- 🔧 **Equipment Tracking** - Monitor downed equipment status
- 📞 **On-Call Directory** - Quick access to on-call staff contacts
- 📌 **Notice Board** - Share important notices and updates

## Project Structure

```
dispatch_full/
├── front/          # Next.js frontend (Deploy to Vercel)
│   ├── app/        # Next.js 13+ app directory
│   ├── components/ # React components
│   ├── stack/      # Stack Auth configuration
│   └── types/      # TypeScript types
│
└── server/         # Express.js backend (Deploy to Render)
    └── index.js    # Main server file with API routes
```

## Tech Stack

### Frontend

- **Framework**: Next.js 16 (React 19)
- **Authentication**: Stack Auth
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO Client
- **Language**: TypeScript

### Backend

- **Framework**: Express.js
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **ORM**: pg (node-postgres)

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stack Auth account

### Backend Setup

1. Navigate to server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file (use `.env.example` as template):

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=dispatch_db
DB_PASSWORD=your_password
DB_PORT=5432
```

4. Setup database tables (see DEPLOYMENT.md for schema)

5. Start server:

```bash
npm start
```

### Frontend Setup

1. Navigate to front directory:

```bash
cd front
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` file (use `.env.example` as template):

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_key
```

4. Start development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions for:

- Render (Backend + PostgreSQL)
- Vercel (Frontend)
- Stack Auth configuration

## Environment Variables

### Backend (Render)

- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Vercel deployment URL
- `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT` - PostgreSQL credentials

### Frontend (Vercel)

- `NEXT_PUBLIC_BACKEND_URL` - Render backend URL
- `NEXT_PUBLIC_STACK_PROJECT_ID` - Stack Auth project ID
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` - Stack Auth client key

## API Endpoints

### Absences

- `GET /api/absences` - List all absences
- `POST /api/absences` - Create absence
- `PUT /api/absences/:id` - Update absence
- `DELETE /api/absences/:id` - Delete absence

### Equipment

- `GET /api/equipment` - List downed equipment
- `POST /api/equipment` - Report downed equipment
- `PUT /api/equipment/:id` - Update equipment status
- `DELETE /api/equipment/:id` - Remove equipment entry

### On-Call Staff

- `GET /api/oncall` - List on-call staff
- `POST /api/oncall` - Add on-call staff
- `PUT /api/oncall/:id` - Update on-call info
- `DELETE /api/oncall/:id` - Remove on-call staff

### Notices

- `GET /api/notices` - List all notices
- `POST /api/notices` - Create notice
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice

### Emergency Alerts

- `GET /api/alerts` - Get active alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id/dismiss` - Dismiss alert
- `POST /api/alerts/clear` - Clear all alerts

## Socket.IO Events

- `update_absences` - Absence data updated
- `update_equipment` - Equipment data updated
- `update_oncall` - On-call staff updated
- `update_notices` - Notice board updated
- `update_alerts` - Emergency alerts updated

## Contributing

1. Create a feature branch from `master`
2. Make your changes
3. Test locally
4. Create a pull request

## License

Private project - All rights reserved

## Support

For issues or questions, contact the development team.
