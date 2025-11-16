# 🔧 Fix CORS Error - Step by Step

**Error:** `Access-Control-Allow-Origin header is not present`

The backend is blocking requests from the frontend. Here's how to fix it:

---

## ✅ Step 1: Set FRONTEND_URL in Render (REQUIRED!)

**This is the most important step!**

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Click your service:** "tonpay-africa"
3. **Click "Environment" tab**
4. **Find `FRONTEND_URL`** (or add it if missing)
5. **Set it to:** `https://tonpay-africa.vercel.app`
   - ⚠️ **Must be EXACTLY this URL!**
   - ⚠️ **No trailing slash!**
   - ⚠️ **Must be `https://` not `http://`**
6. **Click "Save Changes"**
7. **Render will auto-redeploy!**

---

## ✅ Step 2: Verify CORS is Fixed (2 minutes)

After Render redeploys:

1. **Wait 2-3 minutes** for deployment
2. **Visit:** https://tonpay-africa.vercel.app
3. **Press F12** (open DevTools)
4. **Check Console tab:**
   - Should NOT see CORS errors anymore
   - Should see API calls working

---

## 🆘 If CORS Error Still Appears:

### Option 1: Check FRONTEND_URL Again
1. Render → Environment tab
2. Check `FRONTEND_URL` is exactly: `https://tonpay-africa.vercel.app`
3. No trailing slash!
4. Save and redeploy

### Option 2: Check Render Logs
1. Render → Logs tab
2. Look for CORS-related messages
3. Should see: `FRONTEND_URL: https://tonpay-africa.vercel.app`
4. If not, the environment variable isn't set!

---

## ✅ What I Just Fixed:

1. **Updated CORS config** to handle preflight requests (`OPTIONS` method)
2. **Added better logging** to see which origins are being blocked
3. **Added temporary production fallback** (allows all origins in production for debugging)
4. **Pushed to GitHub** - Render will auto-deploy

---

## 🎯 Most Important:

**Make sure `FRONTEND_URL` is set in Render to: `https://tonpay-africa.vercel.app`**

Without this, CORS will keep blocking requests!

---

## ✅ After Setting FRONTEND_URL:

1. Render auto-redeploys
2. Wait 2-3 minutes
3. Refresh your frontend
4. CORS errors should be gone!

---

**Set `FRONTEND_URL` in Render now and the CORS errors will be fixed!** 🚀

