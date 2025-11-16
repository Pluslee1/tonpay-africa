# ✅ Fix Admin Login & Banking Health

**Issues Fixed:**
1. Admin login not working
2. Banking health not showing

---

## ✅ What I Fixed:

### 1. **Admin Login Issue:**
- **Problem:** Login was sending both `email` and `phone` with same value
- **Fix:** Now sends only `email` OR `phone` based on input format
- **Fix:** Added proper error handling and success check
- **Fix:** Properly sets `isAdmin` flag after login

### 2. **Banking Health Check Issue:**
- **Problem:** `checkPaystackHealth` wasn't handling Paystack API response correctly
- **Fix:** Now properly checks `result.success` before accessing balance
- **Fix:** Returns proper error messages when Paystack API fails
- **Fix:** Includes currency in response

---

## ✅ How to Test:

### Test Admin Login:

1. **Visit:** https://tonpay-africa.vercel.app/admin
2. **Login with admin credentials:**
   - Email: `admin@tonpay.com` (or your admin email)
   - Password: Your admin password

**If you don't have an admin account:**
- You need to create one first using the script
- Or update an existing user to admin role in MongoDB

### Test Banking Health:

1. **After logging in as admin**
2. **Go to Admin Dashboard**
3. **Check "Health" section:**
   - Should show Paystack status (Healthy/Unhealthy)
   - Should show Paystack balance if healthy

---

## 🔧 If Admin Login Still Fails:

### Check 1: Do you have an admin account?

**Create admin account:**
1. **Render Dashboard** → Your Service → **Shell** tab (or run locally)
2. **Run:**
   ```bash
   cd server
   node scripts/create-admin.js admin@tonpay.com yourpassword
   ```
3. **This creates admin with:**
   - Email: `admin@tonpay.com`
   - Password: `yourpassword`
   - Role: `admin`

### Check 2: Check Browser Console

1. **Press F12** → **Console tab**
2. **Try to login**
3. **Look for errors:**
   - CORS errors? (should be fixed)
   - 401 Unauthorized? (wrong credentials)
   - 403 Forbidden? (user not admin)
   - Network errors? (API URL issue)

### Check 3: Check Network Tab

1. **Press F12** → **Network tab**
2. **Try to login**
3. **Click on `/api/auth/login` request**
4. **Check:**
   - **Status:** Should be 200 (success) or 401 (wrong credentials)
   - **Response:** Should show `success: true` and `accessToken`

---

## 🔧 If Banking Health Still Not Showing:

### Check 1: Is Paystack API Key Set?

1. **Render Dashboard** → **Environment** tab
2. **Check `PAYSTACK_SECRET_KEY`:**
   - Should be your Paystack secret key
   - Should start with `sk_live_` or `sk_test_`

### Check 2: Check Render Logs

1. **Render Dashboard** → **Logs** tab
2. **Look for errors:**
   - `Paystack health check error`
   - `Failed to fetch balance`
   - `Invalid authorization key`

### Check 3: Test Paystack API

The health check calls `paystack.getBalance()`. If this fails, health will show as "unhealthy".

---

## 📝 Changes Made:

### `server/routes/admin.js`:
- Fixed `checkPaystackHealth()` to properly handle API response
- Added error logging
- Returns proper error messages

### `src/context/AuthContext.jsx`:
- Fixed login to send only email OR phone (not both)
- Added success check
- Properly sets `isAdmin` flag

---

**After Render redeploys, admin login and banking health should work!** 🚀

