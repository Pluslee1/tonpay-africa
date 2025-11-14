# 🚨 URGENT: Railway Build Error Fix

## Current Error
```
sh: 1: cd: can't cd to server
ERROR: failed to build
```

## ✅ IMMEDIATE FIX (Do This Now!)

### Step 1: Set Root Directory in Railway Dashboard

**This is CRITICAL - Do this FIRST:**

1. **Go to Railway Dashboard:** https://railway.app
2. **Click your project**
3. **Click your service** (the failing one)
4. **Click "Settings"** tab
5. **Find "Root Directory"** field
6. **Type exactly:** `server`
7. **Click "Save"**

### Step 2: Clear Build Command

After setting Root Directory:

1. **Still in Settings**
2. **Find "Build Command"** or "Build" section
3. **Clear it** (make it empty) OR set to: `npm install`
4. **Find "Start Command"**
5. **Set it to:** `npm start` (NOT `cd server && npm start`)
6. **Save**

### Step 3: Trigger Redeploy

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** or wait for auto-redeploy
3. Watch the build - it should work now!

---

## 🎯 Why This Works

When you set **Root Directory = `server`**:
- Railway changes its working directory to `server/` BEFORE building
- So `npm install` runs in `server/` automatically
- And `npm start` runs from `server/` automatically
- You DON'T need `cd server &&` anymore!

---

## ⚠️ Common Mistakes

### ❌ WRONG:
- Root Directory: (empty)
- Start Command: `cd server && npm start`

### ✅ CORRECT:
- Root Directory: `server`
- Start Command: `npm start`

---

## 🔍 Verify Settings

Your Railway service settings should look like:

```
Root Directory: server
Build Command: (empty or npm install)
Start Command: npm start
```

---

## 🆘 If It Still Doesn't Work

### Option A: Delete and Recreate Service

1. Delete the current service in Railway
2. Create a NEW service
3. **IMMEDIATELY** set Root Directory to `server` BEFORE first deploy
4. Add environment variables
5. Deploy

### Option B: Use Alternative Start Command

If Root Directory still doesn't work:

1. **Root Directory:** (leave empty)
2. **Start Command:** `sh -c "if [ -d server ]; then cd server && npm start; else npm start; fi"`

But **Option A (Root Directory) is the proper solution!**

---

## ✅ Success Indicators

After fixing, you should see in logs:

```
✅ Installing dependencies...
✅ Found package.json
✅ npm install completed
✅ Starting server...
✅ Server running on port 5000
```

---

## 📞 Still Stuck?

1. **Check Railway Logs** - Look for specific error messages
2. **Verify Repository Structure** - Make sure `server/` folder exists in your repo
3. **Check Root Directory** - Must be exactly `server` (lowercase, no slashes)
4. **Try Redeploy** - Sometimes Railway needs a fresh deploy after settings change

---

**The key is: Set Root Directory to `server` and remove all `cd server &&` commands!**

