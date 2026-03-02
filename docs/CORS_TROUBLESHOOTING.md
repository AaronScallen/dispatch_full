# CORS Error Troubleshooting Guide

## ⚠️ URGENT FIX APPLIED

**Date:** March 2, 2026
**Issue:** 302 Redirects blocking CORS preflight requests

### Changes Made to Fix the Issue

I've updated the server code to handle OPTIONS requests immediately before any middleware that could cause redirects. The key changes:

1. **Added early OPTIONS handler** - Responds to preflight requests immediately
2. **Fixed CORS origin callback** - Changed to return `true` instead of origin string
3. **Added preflight caching** - Reduces server load with 24-hour cache
4. **Improved logging** - Better visibility into CORS issues

### 🚀 **NEXT STEPS TO DEPLOY THE FIX:**

#### 1. Commit and Push Changes

```bash
cd c:\Users\e056277\Desktop\Programming\next_projects\dispatch_full
git add server/index.js
git commit -m "Fix CORS 302 redirect issues on preflight requests"
git push origin main
```

#### 2. Render Will Auto-Deploy

- Render will automatically detect the push and redeploy
- Watch the logs at: https://dashboard.render.com/
- Deployment takes ~2-3 minutes

#### 3. Clear Browser Cache

After deployment, **IMPORTANT**:

- Open DevTools (F12)
- Right-click the refresh button → "Empty Cache and Hard Reload"
- Or use Ctrl+Shift+Delete to clear all cached data

#### 4. Test the Admin Page

- Go to: https://dispatch-full.vercel.app/admin
- Check browser console - CORS errors should be gone
- Verify data loads properly

---

## Current Issue Background

Your production site was experiencing CORS errors with **302 Redirect** responses from the backend.

## What the Error Means

The backend was redirecting requests instead of responding with proper CORS headers. This indicates the server is either:

- Not running properly
- Missing environment variables
- Having database connection issues
- Being redirected by Render's infrastructure

## Diagnostic Steps (For Future Reference)

### 1. Check if Backend is Running

Visit your backend health endpoint directly in a browser:

```
https://dispatch-full.onrender.com/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-02-24T...",
  "uptime": 123.45,
  "environment": "production",
  "database": "connected"
}
```

**If you get:**

- ❌ **404 or "Application failed to respond"** → Server isn't starting
- ❌ **500 error** → Server is crashing
- ❌ **Redirect** → Check Render logs immediately
- ✅ **JSON response** → Server is running! Proceed to step 2

### 2. Check Render Logs

1. Go to Render Dashboard
2. Click on your backend service
3. Go to "Logs" tab
4. Look for:

**Good signs:**

```
✅ Database connected successfully!
🚀 DISPATCH SERVER RUNNING
   Environment: production
   Port: 5000
   Allowed Origins: https://dispatch-full.vercel.app, ...
```

**Bad signs:**

```
❌ FATAL DATABASE ERROR
❌ Missing required environment variables
💥 UNCAUGHT EXCEPTION
Error: connect ECONNREFUSED
```

### 3. Verify Environment Variables on Render

In your Render dashboard, check these variables are set:

**Required:**

- ✅ `NODE_ENV` = `production`
- ✅ `DB_HOST` = (your Render PostgreSQL host)
- ✅ `DB_USER` = (your database user)
- ✅ `DB_NAME` = (your database name)
- ✅ `DB_PASSWORD` = (your database password)
- ✅ `DB_PORT` = `5432`

**Optional but important:**

- ✅ `FRONTEND_URL` = `https://dispatch-full.vercel.app`

### 4. Test CORS Headers Manually

Use curl to test CORS:

```bash
curl -H "Origin: https://dispatch-full.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     -v \
     https://dispatch-full.onrender.com/api/absences
```

**Look for these headers in the response:**

```
Access-Control-Allow-Origin: https://dispatch-full.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### 5. Check Database Connection

If the server is running but health check fails:

1. In Render dashboard, find your PostgreSQL database
2. Check "Connections" - should show active connections
3. Verify the internal database URL matches what's in your environment variables
4. Try connecting manually using the connection string

### 6. Force Redeploy on Render

Sometimes Render caches old code:

1. Go to Render Dashboard → Your service
2. Click "Manual Deploy" → "Deploy latest commit"
3. OR: Click "Settings" → "Clear build cache & deploy"
4. Wait for deployment to complete
5. Check logs again

## Common Issues & Solutions

### Issue: "302 Redirect" on all requests

**Cause:** Server isn't actually starting or has crashed immediately after startup

**Solutions:**

1. Check Render logs for crash messages
2. Verify all environment variables are set
3. Check database connection
4. Look for "Missing required environment variables" error

### Issue: "Application failed to respond"

**Cause:** Server crashed during startup, likely database connection failure

**Solutions:**

1. Verify PostgreSQL database is running
2. Check DB credentials are correct (copy from database internal URL)
3. Ensure DB_HOST uses the **internal** hostname (ends with `.internal`)
4. Check if database is in the same region as web service

### Issue: CORS headers missing but server responds

**Cause:** CORS middleware not configured properly or requests bypassing it

**Solutions:**

1. Ensure latest code is deployed
2. Check the origin in allowed list: `https://dispatch-full.vercel.app`
3. Verify no trailing slashes in origin URL
4. Check request is actually reaching Express (not being caught by something else)

### Issue: "ERR_CONNECTION_RESET"

**Cause:** Server is crashing during request handling

**Solutions:**

1. Check for uncaught exceptions in Render logs
2. Look for database query errors
3. Check if database pool is exhausted
4. Review recent code changes for bugs

## Step-by-Step Recovery Plan

### If Server Won't Start:

1. **Check Latest Deployment**
   - Ensure your latest code with CORS fixes is deployed
   - Commit ID should match your latest push

2. **Verify Environment Variables**
   - All required variables present
   - No typos in variable names
   - Database credentials are correct

3. **Check Database**
   - PostgreSQL instance is running
   - Credentials work (test with psql or admin panel)
   - Tables exist (run migrations if needed)

4. **Review Logs**
   - Look for the exact error message
   - Note the timestamp when it fails
   - Check if it's during startup or during request handling

5. **Redeploy**
   - Clear build cache
   - Trigger manual deployment
   - Watch logs in real-time

### If Server Runs But CORS Fails:

1. **Test Health Endpoint**

   ```bash
   curl https://dispatch-full.onrender.com/health
   ```

2. **Test with Origin Header**

   ```bash
   curl -H "Origin: https://dispatch-full.vercel.app" \
        https://dispatch-full.onrender.com/health
   ```

3. **Check Response Headers**
   - Should include `Access-Control-Allow-Origin`
   - Should include `Access-Control-Allow-Credentials`

4. **If Headers Missing**
   - Verify latest code is deployed
   - Check `allowedOrigins` array in code
   - Ensure `https://dispatch-full.vercel.app` is in the list
   - No extra spaces or characters in URL

## Quick Diagnostic Commands

### Test Backend Health

```bash
curl https://dispatch-full.onrender.com/health
```

### Test CORS Preflight

```bash
curl -X OPTIONS https://dispatch-full.onrender.com/api/absences \
  -H "Origin: https://dispatch-full.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

### Test API Endpoint

```bash
curl https://dispatch-full.onrender.com/api/absences \
  -H "Origin: https://dispatch-full.vercel.app" \
  -v
```

## What Changed in Latest Update

### Server Code Changes:

1. ✅ CORS now uses function-based origin validation
2. ✅ Added explicit pre-flight handling (`app.options('*', cors())`)
3. ✅ Added `trust proxy` setting for Render
4. ✅ Added uncaught exception handlers
5. ✅ Improved logging to show allowed origins
6. ✅ Added better error messages

### Required Actions:

1. **Commit the changes:**

   ```bash
   git add server/index.js
   git commit -m "Fix CORS configuration for production"
   git push
   ```

2. **Verify deployment on Render:**
   - Should auto-deploy from GitHub
   - Watch logs during deployment
   - Look for "Allowed Origins" in startup logs

3. **Test immediately after deployment:**
   - Visit `/health` endpoint
   - Check frontend can connect
   - Verify Socket.IO connects

## Expected Logs After Fix

```
-----------------------------------------------
🚀 DISPATCH SERVER RUNNING
   Environment: production
   Port: 5000
   Allowed Origins: https://dispatch-full.vercel.app, http://localhost:3000, http://localhost:3001
   Time: 2026-02-24T...
-----------------------------------------------
```

## If Still Not Working

1. **Provide the following information:**
   - Render logs (last 50 lines)
   - Response from `/health` endpoint
   - Output from CORS test curl command
   - Environment variables (WITHOUT passwords)

2. **Try these nuclear options:**
   - Delete and recreate the Render service
   - Delete and recreate environment variables
   - Create a new PostgreSQL database and migrate data
   - Use a completely fresh deployment

## Contact Support

If none of these steps work:

- Render Support: https://render.com/docs
- Check Render Status Page: https://status.render.com/

---

**Last Updated:** February 24, 2026
**Related Files:** `server/index.js`
