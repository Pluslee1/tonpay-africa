# 🚨 Fix 502 Bad Gateway + CORS Errors

**Two Issues:**
1. **502 Bad Gateway** - Server at Render is down or crashing
2. **CORS Errors** - Still happening (because server isn't running properly)

---

## 🔍 Why 502 Bad Gateway?

`502 Bad Gateway` means Render can't reach your server. Possible causes:
1. Server crashed on startup
2. Server isn't starting at all
3. Server is taking too long to start
4. Missing environment variables causing crash

---

## ✅ Step 1: Check Render Logs (URGENT!)

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Click your service:** "tonpay-africa"
3. **Click "Logs" tab**
4. **Scroll to bottom** - look for errors

**What to look for:**
- `Error: Cannot connect to MongoDB` ← MongoDB issue
- `Error: Missing environment variable` ← Missing env vars
- `Error: Port already in use` ← Port conflict
- `SyntaxError` or other code errors ← Code issue

**Share the error messages you see!**

---

## ✅ Step 2: Check Render Deployment Status

1. **Render Dashboard** → Your Service → **"Deployments" tab**
2. **Look at the latest deployment:**
   - **Status:** What does it show?
     - "Live" ✅ = Should be working
     - "Build Failed" ❌ = Build error
     - "Deploy Failed" ❌ = Deployment error
     - "In Progress" ⏳ = Still deploying

3. **If status is "Failed":**
   - Click on the failed deployment
   - Check error messages
   - **Share the errors!**

---

## ✅ Step 3: Verify Environment Variables in Render

**Missing env vars can cause server crashes!**

1. **Render Dashboard** → Your Service → **"Environment" tab**
2. **Check ALL these exist:**

### Required Environment Variables:

- ✅ `MONGODB_URI` - MongoDB connection string
- ✅ `FRONTEND_URL` - `https://tonpay-africa.vercel.app` (for CORS)
- ✅ `JWT_SECRET` - JWT secret key
- ✅ `PAYSTACK_SECRET_KEY` - Paystack secret key
- ✅ `VTPASS_API_KEY` - VTPass API key
- ✅ `VTPASS_PUBLIC_KEY` - VTPass public key
- ✅ `TELEGRAM_BOT_TOKEN` - Telegram bot token
- ✅ `NODE_ENV` - Should be `production`
- ✅ `PORT` - **DON'T SET THIS** - Render auto-assigns

3. **If any are missing:**
   - Add them
   - Save
   - Render will auto-redeploy

---

## ✅ Step 4: Manual Redeploy

If deployment is stuck:

1. **Render Dashboard** → Your Service → **"Manual Deploy" tab**
2. **Click "Deploy latest commit"**
3. **Wait 2-3 minutes**
4. **Check logs again**

---

## ⏱️ Why Is Deployment Taking So Long?

Render free tier can be slow:
- **Normal deploy:** 2-5 minutes
- **If server crashes:** Render retries (can take 10+ minutes)
- **If build fails:** Keeps retrying until it succeeds or you stop it

**To speed up:**
1. Fix the errors in logs
2. Ensure all env vars are set
3. Manual redeploy (forces fresh start)

---

## 🔧 Quick Fixes to Try:

### Fix 1: Check MongoDB Connection
- Make sure `MONGODB_URI` is correct in Render
- Format: `mongodb+srv://username:password@cluster.mongodb.net/tonpay-africa`
- Make sure MongoDB Atlas allows access from `0.0.0.0/0`

### Fix 2: Check All Required Env Vars
- Make sure ALL required vars are set in Render
- Missing vars can cause crashes

### Fix 3: Check Server Logs for Errors
- Look for specific error messages
- Fix those errors first

---

## 🎯 Most Likely Issues:

### Issue 1: Server Crashing on Startup
**Solution:** Check Render logs for crash errors

### Issue 2: Missing Environment Variables
**Solution:** Add all required env vars in Render

### Issue 3: MongoDB Connection Failed
**Solution:** Check `MONGODB_URI` and MongoDB Atlas IP whitelist

### Issue 4: Server Not Starting
**Solution:** Check if `startCommand` is correct (`npm start`)

---

## 📝 What to Share:

Please share:
1. **Render Logs** (last 50 lines) - What errors do you see?
2. **Deployment Status** - What does it show? (Live/Failed/In Progress)
3. **Environment Variables** - Which ones are set? (List them)

This will help me identify the exact issue!

---

**Check Render logs now and share the errors you see!** 🔍

