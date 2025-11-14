# 🎯 Railway Root Directory Fix - Step by Step

## The Problem
Railway can't find your `server` folder because it's building from the root directory.

## The Solution
Set **Root Directory** to `server` in Railway dashboard.

---

## 📸 Step-by-Step with Screenshots Guide

### Step 1: Open Your Railway Project
1. Go to https://railway.app
2. Log in
3. Click on your project name

### Step 2: Open Your Service
1. You'll see your services listed
2. Click on your **backend service** (the one that's failing)

### Step 3: Open Settings
1. Look for a **"Settings"** tab or button
2. It might be:
   - A tab at the top: **Settings**
   - A gear icon ⚙️
   - A button: **"Settings"** or **"Configure"**
3. Click it

### Step 4: Find Root Directory
1. Scroll down in the Settings page
2. Look for **"Root Directory"** or **"Working Directory"**
3. It might be under:
   - **"Deploy"** section
   - **"General"** section
   - **"Build"** section

### Step 5: Set Root Directory
1. In the **Root Directory** field, type: `server`
2. **Important:** Just type `server` (no leading slash, no trailing slash)
3. Click **"Save"** or **"Update"**

### Step 6: Wait for Redeploy
1. Railway will automatically start a new deployment
2. Go to the **"Deployments"** or **"Logs"** tab
3. Watch it build - it should work now!

---

## ✅ What Should Happen

After setting Root Directory to `server`:

1. **Build Phase:**
   ```
   ✅ Installing dependencies...
   ✅ Found package.json in server/
   ✅ npm install completed
   ```

2. **Start Phase:**
   ```
   ✅ Starting server...
   ✅ Server running on port 5000
   ```

3. **Health Check:**
   - Visit: `https://your-railway-url/health`
   - Should return: `{"status":"healthy"}`

---

## 🆘 Still Having Issues?

### Issue: Can't find Root Directory setting
**Solution:** 
- Make sure you're on the **service** level, not project level
- Try different sections in Settings
- Refresh the page

### Issue: Root Directory doesn't save
**Solution:**
- Make sure you typed just `server` (no slashes)
- Try clicking "Save" again
- Check if there's an error message

### Issue: Still getting "can't cd to server"
**Solution:**
- Double-check Root Directory is set to exactly: `server`
- Make sure you saved the settings
- Check that Railway has redeployed (look at Deployments tab)
- Verify your repository has a `server` folder

### Issue: Build succeeds but start fails
**Solution:**
- Check that `server/package.json` has a `"start"` script
- Verify `server/index.js` exists
- Check Railway logs for specific error messages

---

## 📝 Alternative: If Root Directory Still Doesn't Work

If for some reason Root Directory doesn't work, you can try:

1. **In Railway Settings → Start Command:**
   ```
   sh -c "cd server && npm start"
   ```

2. **Or create a start script in root:**
   Create `start.sh` in root:
   ```bash
   #!/bin/bash
   cd server
   npm start
   ```
   Then set Start Command to: `bash start.sh`

But **Root Directory is the preferred and recommended method!**

---

## 🎉 Success!

Once Root Directory is set and deployment succeeds:
- ✅ Your backend is live!
- ✅ Copy the Railway URL
- ✅ Use it for `VITE_API_URL` in Vercel
- ✅ Continue with frontend deployment

---

**Need more help?** Check Railway's official docs or their Discord community.

