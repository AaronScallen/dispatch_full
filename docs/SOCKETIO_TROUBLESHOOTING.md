# Socket.IO Troubleshooting Guide

## Recent Fixes Applied

### Issue: Missing Headers in Production

**Problem:** Socket.IO connections failing in production with "Missing Headers" error in browser console.

**Root Cause:** The Socket.IO CORS configuration was missing required headers for WebSocket handshake and upgrade requests.

### Solutions Implemented

#### 1. Enhanced Server-Side CORS Headers

Updated both Express CORS and Socket.IO CORS configurations to include:

- `X-Requested-With` - Required for AJAX and Socket.IO requests
- `Accept` - Content negotiation header
- `Origin` - Origin identification
- `Access-Control-Request-Method` - Preflight request header
- `Access-Control-Request-Headers` - Preflight request header
- `HEAD` method - Required for health checks and handshakes

#### 2. Added Socket.IO Production Options

```javascript
{
  connectTimeout: 45000,      // 45 seconds for initial connection
  upgradeTimeout: 10000,      // 10 seconds for WebSocket upgrade
  maxHttpBufferSize: 1e6,     // 1MB buffer size
  perMessageDeflate: false,   // Disable compression for better compatibility
}
```

#### 3. Enhanced Client-Side Configuration

Added reconnection logic and timeouts:

```javascript
{
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 20000,
}
```

#### 4. Added Explicit CORS Middleware

Ensures CORS headers are set before Socket.IO handshake:

```javascript
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    // ... additional headers
  }
  next();
});
```

## Verification Steps

### 1. Check Server Logs on Render

After deploying, check your Render logs for:

**Good signs:**

```
✅ Database connected successfully!
🚀 DISPATCH SERVER RUNNING
Socket connected: abc123 from https://dispatch-full.vercel.app
Transport upgraded to: websocket
```

**Bad signs:**

```
Socket.IO blocked origin: https://unknown-origin.com
Socket.IO connection error: { code: 'ECONNREFUSED', ... }
```

### 2. Check Browser Console

Open your deployed site and check the browser console (F12):

**Good signs:**

```
WebSocket connection to 'wss://your-backend.onrender.com/socket.io/...' succeeded
Connected to backend ✓
```

**Bad signs:**

```
❌ Failed to load resource: the server responded with a status of 400
❌ WebSocket connection failed: Missing required headers
❌ CORS policy: No 'Access-Control-Allow-Origin' header
```

### 3. Test Socket.IO Endpoint

Test the Socket.IO endpoint directly:

```bash
curl -i https://your-backend.onrender.com/socket.io/?EIO=4&transport=polling
```

Expected response should include:

```
HTTP/2 200
access-control-allow-origin: https://dispatch-full.vercel.app
access-control-allow-credentials: true
content-type: text/plain; charset=UTF-8
```

## Common Production Issues

### Issue 1: WebSocket Upgrade Failing

**Symptoms:**

- Connection starts with polling but never upgrades to WebSocket
- Console shows "Transport upgraded to: websocket" never appears

**Solutions:**

1. Ensure Render allows WebSocket connections (it does by default)
2. Check if a CDN (like Cloudflare) is blocking WebSocket upgrades
3. Verify `transports: ["polling", "websocket"]` is set on both client and server

### Issue 2: Connection Drops After Initial Success

**Symptoms:**

- Initial connection works
- Connection drops after 30-60 seconds
- Reconnection attempts fail

**Solutions:**

1. Check `pingTimeout` and `pingInterval` settings
2. Verify Render service isn't sleeping (free tier sleeps after inactivity)
3. Check browser console for "Transport error" messages

### Issue 3: CORS Errors Only in Production

**Symptoms:**

- Works fine in development
- Fails in production with CORS errors
- Different errors for different browsers

**Solutions:**

1. Verify `FRONTEND_URL` environment variable is set correctly on Render
2. Ensure the frontend URL in `allowedOrigins` matches exactly (including https://)
3. Check for trailing slashes in URLs
4. Verify Stack Auth isn't intercepting requests

## Environment Variables Checklist

Make sure these are set on Render:

### Required

- [x] `NODE_ENV` = `production`
- [x] `FRONTEND_URL` = `https://your-vercel-app.vercel.app`
- [x] `DB_HOST`, `DB_USER`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`

### Recommended

- [x] `PORT` = `5000` (Render overrides this, but good for consistency)

## Testing Checklist After Deployment

Run through this checklist after deploying:

1. **Backend Health Check**
   - [ ] Visit `https://your-backend.onrender.com/health`
   - [ ] Should return JSON with `status: "healthy"`

2. **Socket.IO Endpoint**
   - [ ] Visit `https://your-backend.onrender.com/socket.io/` in browser
   - [ ] Should return JSON starting with `0{...`

3. **Frontend Connection**
   - [ ] Open `https://your-frontend.vercel.app`
   - [ ] Check for green "Connected" status
   - [ ] No CORS errors in console

4. **Real-Time Updates**
   - [ ] Open frontend in two browser tabs
   - [ ] Make a change in admin panel
   - [ ] Verify both tabs update in real-time

5. **WebSocket Upgrade**
   - [ ] Check Network tab in DevTools
   - [ ] Find Socket.IO connections
   - [ ] Verify upgrade to WebSocket occurs

## Advanced Debugging

### Enable Socket.IO Debug Logs

On the **client side** (browser console):

```javascript
localStorage.debug = "socket.io-client:*";
// Refresh the page
```

On the **server side** (Render environment variables):

```
DEBUG=socket.io:*
```

### Check Network Tab

1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket) or "socket.io"
3. Look for:
   - Initial polling request (should return 200)
   - WebSocket upgrade request (should return 101 Switching Protocols)
   - Ping/pong frames (keepalive)

### Common Error Codes

- **400 Bad Request** - CORS issue or malformed handshake
- **403 Forbidden** - Origin not allowed in CORS config
- **404 Not Found** - Socket.IO path incorrect
- **502 Bad Gateway** - Backend server not responding (check if it's sleeping)
- **503 Service Unavailable** - Backend server crashed or restarting

## If Problems Persist

1. **Check Render Status Page**: https://status.render.com/
2. **Review Render Logs**: Dashboard → Your Service → Logs
3. **Test with Postman** or curl to isolate client vs server issues
4. **Temporarily enable more verbose logging** in production
5. **Check if backend URL changed** after redeployment

## Contact Support

If you've tried all the above and still have issues:

1. Export your Render logs (last 1000 lines)
2. Export browser console logs (with timestamps)
3. Include your Socket.IO connection code
4. Note your Render region and plan type

## Quick Reference: Socket.IO Connection Flow

```
1. Client initiates connection
   └─> HTTP POST to /socket.io/?EIO=4&transport=polling

2. Server responds with session ID
   └─> Response includes CORS headers

3. Client sends handshake
   └─> Includes origin, credentials

4. Server validates origin
   └─> Checks against allowedOrigins

5. Connection established (polling)
   └─> Client polls for messages

6. Client attempts upgrade to WebSocket
   └─> HTTP GET with Upgrade: websocket header

7. Server responds with 101 Switching Protocols
   └─> Connection upgraded to WebSocket

8. Bidirectional communication begins
   └─> Ping/pong keepalive every 25 seconds
```

Each step must succeed for Socket.IO to work properly in production.
