# 🔧 Fix Render Deployment Failure

Your Render deployment shows "Failed deploy". Let's fix it!

---

## Step 1: Check Render Logs

1. **Go to Render Dashboard** → Your Project
2. **Click on "tonpay-africa" service**
3. **Go to "Logs" tab**
4. **Look for error messages** - this will tell us what's wrong

Common errors:
- Missing environment variables
- Build command failing
- Start command failing
- Port configuration issues

---

## Step 2: Common Fixes

### Fix 1: Check Root Directory
1. Go to **Settings** tab
2. **Root Directory** should be: `server`
3. If not set, set it to `server` and save

### Fix 2: Check Build/Start Commands
1. Go to **Settings** tab
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. Save

### Fix 3: Check Environment Variables
Make sure these are set:
- `NODE_ENV=production`
- `PORT=5000` (or let Render auto-assign)
- `MONGODB_URI=your_mongodb_uri`
- All other required variables

### Fix 4: Check Node Version
1. Go to **Settings** tab
2. **Node Version:** Should be `20` or `18`
3. Save

---

## Step 3: Manual Redeploy

After fixing settings:
1. Go to **"Manual Deploy"** tab
2. Click **"Deploy latest commit"**
3. Watch the logs

---

## Step 4: Check Specific Errors

### If logs show "Cannot find module":
- Root Directory might be wrong
- Dependencies not installing

### If logs show "Port already in use":
- Remove `PORT` from environment variables (let Render assign it)

### If logs show "MongoDB connection failed":
- Check `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### If logs show "Missing script: start":
- Root Directory must be `server`
- Or Start Command should be `cd server && npm start`

---

## Quick Fix Checklist

- [ ] Root Directory = `server`
- [ ] Build Command = `npm install`
- [ ] Start Command = `npm start`
- [ ] Node Version = `20` or `18`
- [ ] All environment variables set
- [ ] MongoDB URI correct
- [ ] Manual redeploy triggered

---

**Share the error from Render logs and I'll help you fix it specifically!** 🔍

