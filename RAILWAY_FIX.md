# 🔧 Fix Railway Deployment Error

## Problem
Railway error: `sh: 1: cd: can't cd to server` or `Missing script: "start"`

This happens because Railway is trying to build/run from the root directory, but your code is in the `server` folder.

## ✅ Solution: Set Root Directory (REQUIRED)

**This is the ONLY reliable way to fix this!**

### Step-by-Step:

1. **Go to Railway Dashboard:** https://railway.app
2. **Click on your project**
3. **Click on your service** (the backend service)
4. **Click "Settings" tab** (gear icon or Settings button)
5. **Scroll down to "Root Directory"**
6. **Type:** `server` (just the word "server", no slash)
7. **Click "Save"** or "Update"
8. **Railway will automatically redeploy** (watch the Deployments tab)

### Visual Guide:
```
Railway Dashboard
  → Your Project
    → Your Service (backend)
      → Settings Tab
        → Root Directory: [server] ← Type here
        → Save
```

## ⚠️ Important Notes:

- **Root Directory must be set BEFORE the first deploy**
- If you already deployed, set it now and Railway will redeploy
- The Root Directory tells Railway: "All my code is in the `server` folder"
- After setting this, Railway will:
  - Look for `package.json` in `server/package.json` ✅
  - Run `npm install` in the `server` folder ✅
  - Run `npm start` from the `server` folder ✅

## 🔄 After Setting Root Directory:

1. Railway will automatically trigger a new deployment
2. Watch the "Deployments" tab for progress
3. Build should complete successfully
4. Check logs - you should see: `✅ Server running on port 5000`

## 🆘 If Root Directory Setting Doesn't Appear:

Some Railway interfaces might have it in a different location:

1. Try: **Service Settings** → **General** → **Root Directory**
2. Or: **Settings** → **Deploy** → **Root Directory**
3. Or: Click the **three dots (⋯)** menu → **Settings** → **Root Directory**

If you still can't find it:
- Make sure you're on the **service** level (not project level)
- Try refreshing the page
- Check Railway's documentation for the latest UI

## ✅ Verify It's Working

After redeploy, check:
1. Railway logs should show: `✅ Server running on port 5000`
2. Visit: `https://your-railway-url/health`
3. Should return: `{"status":"healthy"}`

---

**Still having issues?** Check Railway logs for more details.

