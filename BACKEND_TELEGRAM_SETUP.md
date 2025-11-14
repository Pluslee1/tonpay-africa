# 🔧 Backend Setup for Telegram Mini App

## 🎯 The Problem

Your frontend is currently using a proxy that points to `localhost:5000`. This works in development, but when your app runs in Telegram (via ngrok), it can't reach `localhost:5000` because that's only on your computer.

## ✅ Solution: Make Backend Publicly Accessible

You need **TWO ngrok tunnels**:
1. **Frontend** (port 5173) - Already set up
2. **Backend** (port 5000) - Need to set up

---

## 🚀 Quick Setup Guide

### Step 1: Start Your Backend

```bash
cd server
npm start
```

Make sure it's running on port 5000.

### Step 2: Create ngrok Tunnel for Backend

**Open a NEW terminal window** and run:

```bash
ngrok http 5000
```

You'll get a URL like: `https://xyz789.ngrok-free.app`

**Copy this URL** - this is your backend public URL.

### Step 3: Update Frontend to Use Public Backend URL

You have two options:

#### Option A: Update vite.config.js (Development)

Update the proxy target to use your ngrok backend URL:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'https://xyz789.ngrok-free.app', // Your ngrok backend URL
    changeOrigin: true,
    secure: true
  }
}
```

#### Option B: Use Environment Variable (Better for Production)

1. **Create `.env` file in root:**
```env
VITE_API_BASE_URL=https://xyz789.ngrok-free.app
```

2. **Update `vite.config.js`:**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  // ... existing config
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    allowedHosts: [
      'atoneable-leisha-nonancestral.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io',
      'localhost'
    ],
    proxy: {
      '/api': {
        target: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
```

3. **Update axios calls to use environment variable:**

Create or update `src/config/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// For axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

## 📋 Complete Setup Checklist

### Terminal 1: Frontend
```bash
npm run dev
```
Runs on: `http://localhost:5173`

### Terminal 2: Backend
```bash
cd server
npm start
```
Runs on: `http://localhost:5000`

### Terminal 3: ngrok for Frontend
```bash
ngrok http 5173
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### Terminal 4: ngrok for Backend
```bash
ngrok http 5000
```
Copy the HTTPS URL (e.g., `https://xyz789.ngrok-free.app`)

---

## 🔄 Update Your Configuration

### 1. Update Frontend Proxy

Edit `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'https://xyz789.ngrok-free.app', // Your backend ngrok URL
    changeOrigin: true,
    secure: true
  }
}
```

### 2. Update CORS in Backend

Make sure your backend allows requests from your frontend ngrok URL.

Check `server/middleware/security.js` or `server/index.js`:

```javascript
const corsConfig = {
  origin: [
    'http://localhost:5173',
    'https://abc123.ngrok-free.app', // Your frontend ngrok URL
    'https://atoneable-leisha-nonancestral.ngrok-free.dev', // Your current frontend URL
    /\.ngrok-free\.dev$/, // Allow all ngrok URLs
    /\.ngrok\.io$/,
  ],
  credentials: true
};
```

### 3. Restart Everything

1. Restart frontend: `npm run dev`
2. Restart backend: `npm start` (in server folder)
3. Restart both ngrok tunnels

---

## 🧪 Test Your Setup

### Test Backend Directly

Open in browser:
```
https://xyz789.ngrok-free.app/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "database": "connected"
}
```

### Test Frontend → Backend

1. Open your frontend ngrok URL in browser
2. Open browser console (F12)
3. Check Network tab
4. Try an action that calls the API (e.g., fetch rate)
5. Verify the request goes to your backend ngrok URL

---

## 🎯 Production Setup

For production, you'll want to:

1. **Deploy Backend:**
   - Railway: https://railway.app
   - Render: https://render.com
   - Heroku: https://heroku.com
   - Or your own VPS

2. **Deploy Frontend:**
   - Vercel: https://vercel.com
   - Netlify: https://netlify.com

3. **Update URLs:**
   - Update `vite.config.js` proxy to production backend URL
   - Or use environment variables
   - Update Telegram bot Mini App URL to production frontend URL

---

## 🐛 Common Issues

### Issue: CORS Error

**Fix:** Update backend CORS to include your frontend ngrok URL:
```javascript
origin: [
  'https://your-frontend-ngrok-url.ngrok-free.app',
  /\.ngrok-free\.dev$/,
]
```

### Issue: Backend Not Accessible

**Fix:** 
- Make sure backend is running: `cd server && npm start`
- Make sure ngrok is pointing to port 5000: `ngrok http 5000`
- Check ngrok URL is HTTPS (not HTTP)

### Issue: API Calls Still Go to localhost

**Fix:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Restart frontend dev server
- Check vite.config.js proxy is updated

---

## 📝 Quick Command Reference

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend  
cd server && npm start

# Terminal 3: Frontend ngrok
ngrok http 5173

# Terminal 4: Backend ngrok
ngrok http 5000
```

---

## ✅ Final Checklist

- [ ] Backend running on port 5000
- [ ] Backend ngrok tunnel active (port 5000)
- [ ] Frontend ngrok tunnel active (port 5173)
- [ ] vite.config.js proxy updated with backend ngrok URL
- [ ] Backend CORS updated to allow frontend ngrok URL
- [ ] Test backend health endpoint works
- [ ] Test frontend can call backend API
- [ ] Telegram Mini App can access backend

---

**Your backend is now accessible from Telegram!** 🎉

