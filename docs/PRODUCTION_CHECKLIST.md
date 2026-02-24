# Production Deployment Checklist

## Pre-Deployment

### Code Review

- [ ] All console.log statements reviewed (kept only necessary ones)
- [ ] Error handling implemented for all API endpoints
- [ ] Environment variables properly configured
- [ ] No sensitive data hardcoded in source code
- [ ] .gitignore properly configured (.env files excluded)
- [ ] All dependencies are production-ready versions

### Security

- [ ] CORS configured with specific allowed origins (no wildcards in production)
- [ ] Security headers enabled (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- [ ] Database connections use SSL in production
- [ ] Stack Auth configured with production domains
- [ ] No API keys or secrets committed to repository

### Backend (Server)

- [ ] Environment variables validated on startup
- [ ] Health check endpoint (`/health`) working
- [ ] Database connection pooling configured
- [ ] Graceful shutdown handling implemented
- [ ] Production logging configured
- [ ] Error responses don't leak sensitive information

### Frontend

- [ ] Environment variables set for production
- [ ] Build succeeds without warnings
- [ ] Production build tested locally
- [ ] Socket.IO configured for Render compatibility (polling first)
- [ ] Error boundaries in place for React components

## Deployment Steps

### Backend (Render)

1. **Database Setup**
   - [ ] PostgreSQL instance created on Render
   - [ ] Database connection URL copied
   - [ ] All required tables created (run migrations)
   - [ ] Database accessible from backend service

2. **Web Service Configuration**
   - [ ] Repository connected to Render
   - [ ] Root directory set to `server`
   - [ ] Build command: `npm install`
   - [ ] Start command: `npm start`
   - [ ] Environment variables set:
     - [ ] `NODE_ENV=production`
     - [ ] `DB_HOST` (from PostgreSQL internal URL)
     - [ ] `DB_USER` (from PostgreSQL internal URL)
     - [ ] `DB_NAME` (from PostgreSQL internal URL)
     - [ ] `DB_PASSWORD` (from PostgreSQL internal URL)
     - [ ] `DB_PORT=5432`
     - [ ] `FRONTEND_URL` (will update after Vercel deployment)

3. **Verify Backend Deployment**
   - [ ] Service deployed successfully
   - [ ] Health check endpoint returns 200: `https://your-app.onrender.com/health`
   - [ ] Root endpoint accessible: `https://your-app.onrender.com/`
   - [ ] Database connection verified in logs
   - [ ] Copy backend URL for frontend configuration

### Frontend (Vercel)

1. **Stack Auth Configuration**
   - [ ] Stack Auth project created
   - [ ] Allowed origins include Vercel domain
   - [ ] Project ID and Publishable Key copied
   - [ ] Sign-in/sign-up pages configured

2. **Vercel Deployment**
   - [ ] Repository connected to Vercel
   - [ ] Framework preset: Next.js
   - [ ] Root directory set to `front`
   - [ ] Environment variables set:
     - [ ] `NEXT_PUBLIC_BACKEND_URL` (from Render deployment)
     - [ ] `NEXT_PUBLIC_STACK_PROJECT_ID` (from Stack Auth)
     - [ ] `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` (from Stack Auth)

3. **Verify Frontend Deployment**
   - [ ] Site deployed successfully
   - [ ] No build errors or warnings
   - [ ] Copy Vercel URL

### Post-Deployment Configuration

1. **Update Backend CORS**
   - [ ] Update Render environment variable `FRONTEND_URL` with Vercel URL
   - [ ] Redeploy backend service

2. **Update Stack Auth**
   - [ ] Add Vercel production URL to Stack Auth allowed origins
   - [ ] Add Render backend URL to Stack Auth allowed origins (if needed)
   - [ ] Verify redirect URLs are configured

## Testing

### Backend Testing

- [ ] Health check returns healthy status: `GET /health`
- [ ] API status endpoint works: `GET /api/status`
- [ ] Database queries working (test a GET endpoint)
- [ ] Socket.IO connections accepted
- [ ] CORS headers present in responses

### Frontend Testing

- [ ] Homepage loads without errors
- [ ] Sign-up flow works
- [ ] Sign-in flow works
- [ ] Admin page accessible after login
- [ ] Socket.IO connection established (check connection status indicator)
- [ ] Real-time updates working

### Integration Testing

- [ ] Create an absence record - appears on dashboard immediately
- [ ] Create equipment issue - broadcasts to all clients
- [ ] Create emergency alert - banner appears and sound plays
- [ ] Update records - changes reflected in real-time
- [ ] Delete records - updates broadcast correctly

### Cross-Browser Testing

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if applicable)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Monitoring

### Set Up Monitoring

- [ ] Render dashboard bookmarked
- [ ] Vercel dashboard bookmarked
- [ ] Database metrics visible
- [ ] Error tracking configured (optional: Sentry, LogRocket)

### Regular Checks

- [ ] Check `/health` endpoint daily
- [ ] Monitor Render logs for errors
- [ ] Monitor database connection pool usage
- [ ] Check for failed deployments
- [ ] Review admin login logs periodically

## Performance Optimization (Optional)

- [ ] Database indexes created for frequently queried columns
- [ ] Image optimization enabled (if using images)
- [ ] Caching strategies implemented (if needed)
- [ ] CDN configured for static assets (Vercel handles this)

## Rollback Plan

### If Issues Occur

1. **Frontend Issues**
   - [ ] Revert to previous Vercel deployment via dashboard
   - [ ] Check environment variables are correct
2. **Backend Issues**
   - [ ] Check Render logs for errors
   - [ ] Verify database connection
   - [ ] Revert to previous deployment if needed
   - [ ] Verify environment variables

3. **Database Issues**
   - [ ] Check PostgreSQL logs in Render
   - [ ] Verify connection string
   - [ ] Check for migration issues

## Documentation

- [ ] Update DEPLOYMENT.md with actual URLs and current steps
- [ ] Document any custom configuration
- [ ] Note any issues encountered and solutions
- [ ] Share production URLs with team

## Final Checks

- [ ] All team members can access the application
- [ ] Admin users can sign in
- [ ] Data persists across page refreshes
- [ ] Real-time updates working on multiple devices simultaneously
- [ ] No console errors in production
- [ ] Mobile responsive design working
- [ ] Performance is acceptable (page load < 3 seconds)

## Environment Variables Reference

### Backend (.env)

```bash
NODE_ENV=production
PORT=5000
DB_HOST=<from_render_postgres>
DB_USER=<from_render_postgres>
DB_NAME=<from_render_postgres>
DB_PASSWORD=<from_render_postgres>
DB_PORT=5432
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-app.onrender.com
NEXT_PUBLIC_STACK_PROJECT_ID=<from_stack_auth>
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=<from_stack_auth>
```

## Support Contacts

- Render Support: https://render.com/docs
- Vercel Support: https://vercel.com/support
- Stack Auth Docs: https://docs.stack-auth.com/
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

**Last Updated:** February 24, 2026
**Deployed By:** [Your Name]
**Production URLs:**

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.onrender.com`
- Database: `[Render PostgreSQL Internal]`
