# 🚨 URGENT: Fix 502 Bad Gateway

**Error:** `502 Bad Gateway` means Render can't reach your server.

---

## 🔍 Why 502 Bad Gateway?

The server at Render is either:
1. ❌ **Crashing on startup** (most likely)
2. ❌ **Not starting at all**
3. ❌ **Taking too long to start** (timeout)
4. ❌ **Missing required environment variables**

---

## ✅ IMMEDIATE STEPS:

### Step 1: Check Render Logs (DO THIS FIRST!)

1. **Go to:** https://dashboard.render.com
2. **Click your service:** "tonpay-africa"
3. **Click "Logs" tab**
4. **Scroll to bottom** - look for errors

**What errors do you see?**
- `Error: Cannot connect to MongoDB` ← MongoDB issue
- `Error: Missing environment variable` ← Missing env vars
- `SyntaxError` ← Code error
- `Error: Port already in use` ← Port conflict

**Copy the LAST 20-30 lines of logs and share them!**

---

### Step 2: Check Deployment Status

1. **Render Dashboard** → Your Service → **"Deployments" tab**
2. **Look at latest deployment:**
   - **Status:** What does it show?
     - ✅ "Live" = Should be working
     - ❌ "Build Failed" = Build error
     - ❌ "Deploy Failed" = Deployment error
     - ⏳ "In Progress" = Still deploying

**What status do you see?**

---

### Step 3: Verify Environment Variables

**Missing env vars can cause crashes!**

1. **Render Dashboard** → Your Service → **"Environment" tab**
2. **Check these EXIST:**

#### Required (Must Have):
- ✅ `MONGODB_URI` - Your MongoDB connection string
- ✅ `JWT_SECRET` - JWT secret key
- ✅ `NODE_ENV` - Should be `production`

#### Recommended (Should Have):
- ✅ `FRONTEND_URL` - `https://tonpay-africa.vercel.app` (for CORS)
- ✅ `PAYSTACK_SECRET_KEY` - For bank verification
- ✅ `VTPASS_API_KEY` - For airtime/data
- ✅ `VTPASS_PUBLIC_KEY` - For airtime/data
- ✅ `TELEGRAM_BOT_TOKEN` - For Telegram login

3. **If any are missing:**
   - Add them NOW
   - Save
   - Render will auto-redeploy

---

### Step 4: Manual Redeploy

If deployment is stuck or failed:

1. **Render Dashboard** → Your Service → **"Manual Deploy" tab**
2. **Click "Clear build cache & deploy"**
3. **Wait 3-5 minutes**
4. **Check logs again**

---

## ⏱️ Why Is Deployment Taking So Long?

**Render free tier is slow:**
- Normal deploy: **2-5 minutes**
- If server crashes: Render retries (can take **10-15 minutes**)
- If build fails: Keeps retrying

**To speed up:**
1. ✅ Fix errors in logs first
2. ✅ Ensure all env vars are set
3. ✅ Use "Clear build cache & deploy" (forces fresh start)

---

## 🔧 Most Likely Issues & Fixes:

### Issue 1: Server Crashing on MongoDB Connection
**Error:** `Cannot connect to MongoDB` or `timeout`
**Fix:**
- Check `MONGODB_URI` in Render is correct
- Make sure MongoDB Atlas allows `0.0.0.0/0` (all IPs)
- Server should continue even if MongoDB fails (but check logs)

### Issue 2: Missing Environment Variables
**Error:** `Missing environment variable` or `undefined`
**Fix:**
- Add ALL required env vars in Render
- Check `JWT_SECRET` especially (required)

### Issue 3: Build Command Failing
**Error:** `npm ci` failing
**Fix:**
- Changed to `npm install --only=production` (more forgiving)
- Pushed to GitHub - Render will redeploy

### Issue 4: Port Not Set
**Error:** Server not listening
**Fix:**
- Render auto-assigns PORT
- Make sure code uses `process.env.PORT || 5000`

---

## 📝 What I Just Changed:

1. **Updated `render.yaml`:**
   - Changed `buildCommand` from `npm ci --only=production` to `npm install --only=production`
   - This is more forgiving if package-lock.json is missing

2. **Pushed to GitHub:**
   - Render will auto-redeploy

---

## 🎯 NEXT STEPS:

1. ✅ **Check Render Logs** - What errors do you see?
2. ✅ **Verify Environment Variables** - Are they all set?
3. ✅ **Wait for Auto-Redeploy** - 3-5 minutes after push
4. ✅ **If Still 502:** Check logs again and share errors

---

## 📋 What to Share:

Please share:
1. **Last 30 lines of Render Logs** - Copy and paste them
2. **Deployment Status** - What does it show?
3. **Environment Variables List** - Which ones are set?

**This will help me identify the exact issue!** 🔍

---

**Check Render logs NOW and share what you see!** 🚨

