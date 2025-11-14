# 🎯 Railway Dashboard Fix - MUST DO THIS!

## The Problem
Railway keeps trying to build from root directory, even with Dockerfile.

## ✅ THE REAL FIX: Set Root Directory in Railway Dashboard

**You MUST do this in the Railway web interface - config files alone won't work!**

---

## 📋 Step-by-Step Instructions

### Step 1: Open Railway Dashboard
1. Go to **https://railway.app**
2. Log in
3. Click on your **project**

### Step 2: Open Your Service
1. You'll see your services listed
2. Click on the **backend service** (the one that's failing)

### Step 3: Open Settings
1. Look for **"Settings"** - it might be:
   - A tab at the top
   - A gear icon ⚙️
   - A button on the right side
   - Three dots menu (⋯) → Settings
2. **Click it**

### Step 4: Find Root Directory
Scroll down and look for:
- **"Root Directory"**
- **"Working Directory"** 
- **"Source Directory"**

It might be under:
- **"General"** section
- **"Deploy"** section
- **"Build"** section

### Step 5: Set Root Directory
1. In the **Root Directory** field
2. **Type exactly:** `server`
   - No leading slash: ❌ `/server`
   - No trailing slash: ❌ `server/`
   - Just: ✅ `server`
3. Click **"Save"** or **"Update"**

### Step 6: Verify
1. After saving, Railway will **automatically redeploy**
2. Go to **"Deployments"** tab
3. Watch the new deployment
4. It should work now!

---

## 🔍 How to Find Root Directory Setting

### If you can't find it:

1. **Try clicking on the service name** (not the project)
2. **Look for a "Configure" or "Settings" button**
3. **Check the right sidebar** - sometimes it's there
4. **Try the three dots menu (⋯)** next to the service name

### Railway UI might look like:
```
[Service Name]  [⚙️ Settings]  [⋯ Menu]
```

Or:
```
Service Settings
├── General
│   └── Root Directory: [server] ← HERE
├── Deploy
└── Variables
```

---

## ⚠️ Important Notes

- **Root Directory MUST be set in the dashboard** - config files don't override this
- **After setting it, Railway will auto-redeploy**
- **The setting persists** - you only need to set it once
- **If you delete and recreate the service, you'll need to set it again**

---

## 🆘 Still Can't Find It?

### Option A: Delete and Recreate Service
1. Delete the current service
2. Create a NEW service
3. **BEFORE deploying**, go to Settings
4. Set Root Directory to `server`
5. Then add environment variables
6. Then deploy

### Option B: Contact Railway Support
- Railway Discord: https://discord.gg/railway
- Or check Railway docs: https://docs.railway.app

---

## ✅ Success Indicators

After setting Root Directory and redeploying:

1. **Build logs should show:**
   ```
   ✅ Installing dependencies...
   ✅ Found package.json
   ✅ npm install completed
   ```

2. **Start logs should show:**
   ```
   ✅ Server running on port 5000
   ```

3. **Health check:**
   - Visit: `https://your-railway-url/health`
   - Should return: `{"status":"healthy"}`

---

## 🎯 Why This Works

When you set **Root Directory = `server`**:
- Railway changes its working directory to `server/` BEFORE everything
- All commands run from `server/` automatically
- No need for `cd server &&` commands
- Railway finds `package.json` in `server/package.json`
- Everything just works!

---

**This is the ONLY reliable way to fix the "can't cd to server" error!**

