# Deployment Guide

This project consists of two parts:
- **Frontend (Next.js)** → Deploy to Vercel
- **Backend (Express.js + Socket.IO)** → Deploy to Render

## Backend Deployment (Render)

### 1. Create a PostgreSQL Database on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Name your database (e.g., `dispatch-db`)
4. Select the free tier or your preferred plan
5. Click "Create Database"
6. Copy the **Internal Database URL** for later use

### 2. Deploy the Backend Web Service
1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository: `AaronScallen/dispatch_full`
3. Configure the service:
   - **Name**: `dispatch-server` (or your preferred name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `PORT`: `5000` (Render will override this, but keep for consistency)
   - `FRONTEND_URL`: `https://your-vercel-app.vercel.app` (update after Vercel deployment)
   - `DB_USER`: (from PostgreSQL Internal URL)
   - `DB_HOST`: (from PostgreSQL Internal URL)
   - `DB_NAME`: (from PostgreSQL Internal URL)
   - `DB_PASSWORD`: (from PostgreSQL Internal URL)
   - `DB_PORT`: `5432`
5. Click "Create Web Service"
6. Copy your Render service URL (e.g., `https://dispatch-server.onrender.com`)

### 3. Setup Database Tables
After deployment, connect to your PostgreSQL database and run the schema setup:

```sql
-- Create tables for the dispatch system
CREATE TABLE IF NOT EXISTS absences (
    id SERIAL PRIMARY KEY,
    badge_number VARCHAR(50),
    location_name VARCHAR(100),
    covering_badge_number VARCHAR(50),
    absence_date DATE,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS downed_equipment (
    id SERIAL PRIMARY KEY,
    equipment_type VARCHAR(50),
    equipment_id_number VARCHAR(50),
    title VARCHAR(200),
    status VARCHAR(50),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS on_call_staff (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(100),
    person_name VARCHAR(100),
    phone_number VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS notices (
    id SERIAL PRIMARY KEY,
    notice_date DATE,
    title VARCHAR(200),
    text_content TEXT
);

CREATE TABLE IF NOT EXISTS emergency_alerts (
    id SERIAL PRIMARY KEY,
    severity_level VARCHAR(20),
    title VARCHAR(200),
    active BOOLEAN DEFAULT true
);
```

## Frontend Deployment (Vercel)

### 1. Setup Stack Auth
1. Go to [Stack Auth](https://app.stack-auth.com/)
2. Create a new project or use existing one
3. Copy your:
   - Project ID
   - Publishable Client Key
4. Configure your Stack Auth project:
   - Add your Vercel domain to allowed origins
   - Configure sign-in/sign-up pages

### 2. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `AaronScallen/dispatch_full`
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `front`
   - **Build Command**: `npm run build`
   - **Output Directory**: (leave default)
5. Add Environment Variables:
   - `NEXT_PUBLIC_BACKEND_URL`: `https://your-render-service.onrender.com` (from Render deployment)
   - `NEXT_PUBLIC_STACK_PROJECT_ID`: (from Stack Auth)
   - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`: (from Stack Auth)
6. Click "Deploy"

### 3. Update Backend CORS
After Vercel deployment, update your Render backend environment variable:
- `FRONTEND_URL`: Set to your actual Vercel deployment URL

## Post-Deployment Checklist

- [ ] PostgreSQL database is running and tables are created
- [ ] Render backend service is running and accessible
- [ ] Vercel frontend is deployed and accessible
- [ ] Stack Auth is configured with correct domains
- [ ] Backend `FRONTEND_URL` is set to Vercel URL
- [ ] Frontend `NEXT_PUBLIC_BACKEND_URL` is set to Render URL
- [ ] Test authentication flow (sign-up/sign-in)
- [ ] Test API endpoints and Socket.IO connection
- [ ] Verify admin dashboard functionality

## Testing the Deployment

1. Visit your Vercel URL
2. Try signing up/signing in
3. Navigate to `/admin` to test admin dashboard
4. Verify real-time updates are working (Socket.IO)
5. Test CRUD operations on all data tables

## Troubleshooting

### Backend Issues
- Check Render logs for database connection errors
- Verify all environment variables are set correctly
- Ensure PostgreSQL is in the same region as backend for better performance

### Frontend Issues
- Check Vercel deployment logs for build errors
- Verify Stack Auth environment variables
- Check browser console for API connection errors
- Ensure CORS is properly configured on backend

### Database Issues
- Use Render's built-in PostgreSQL shell to verify tables exist
- Check connection string format
- Ensure SSL is enabled for production database

## Notes
- Free tier on Render may have cold starts (first request takes ~30 seconds)
- Socket.IO requires WebSocket support (enabled by default on Render)
- Keep your `.env` files secure and never commit them to GitHub
