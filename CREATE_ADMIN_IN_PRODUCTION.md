# ✅ Create Admin Account in Production

**You have an admin account locally, but it's in your LOCAL MongoDB, not production!**

You need to create the same admin account in your **PRODUCTION MongoDB Atlas** (which Render uses).

---

## ✅ Step 1: Create Admin in Production MongoDB (5 minutes)

### Option A: Using Render Shell (Easiest)

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Click your service:** "tonpay-africa"
3. **Click "Shell" tab** (or "Connect" → "Shell")
4. **Run:**
   ```bash
   cd server
   node scripts/create-admin.js admin@tonpay.com yourpassword
   ```
   (Replace with your actual admin email and password)

5. **Should see:**
   ```
   ✅ Connected to MongoDB
   ✅ Created/Updated admin user
   Email: admin@tonpay.com
   Role: admin
   ```

### Option B: Using MongoDB Atlas Directly

1. **Go to MongoDB Atlas:** https://cloud.mongodb.com
2. **Click "Browse Collections"**
3. **Find database:** `tonpay-africa`
4. **Find collection:** `users`
5. **Find your admin user** (if exists)
6. **Update role to:** `"admin"` (if not already)

---

## ✅ Step 2: Verify Admin Account (2 minutes)

### Check if Admin Exists:

1. **Render Dashboard** → **Shell** tab
2. **Run:**
   ```bash
   cd server
   node -e "
   import('mongoose').then(async (mongoose) => {
     const dotenv = await import('dotenv');
     dotenv.config();
     await mongoose.default.connect(process.env.MONGODB_URI);
     const User = (await import('./models/User.js')).default;
     const admin = await User.findOne({ role: 'admin' });
     if (admin) {
       console.log('✅ Admin found:');
       console.log('Email:', admin.email);
       console.log('Role:', admin.role);
     } else {
       console.log('❌ No admin found');
     }
     process.exit(0);
   });
   "
   ```

---

## ✅ Step 3: Login with Same Credentials (After Render Redeploys)

Once admin is created in production:

1. **Wait 5-10 minutes** for Render to redeploy (after the `/api/auth/me` fix)
2. **Visit:** https://tonpay-africa.vercel.app/admin
3. **Login with:**
   - **Email:** Same as your local admin email
   - **Password:** Same as your local admin password

**Should work now!**

---

## 🔍 If Still Not Working:

### Check 1: Verify MongoDB Connection

**Render is using:** `mongodb+srv://pluslee:****@cluster0.vr0unwy.mongodb.net/tonpay-africa`

**Make sure:**
- This is your PRODUCTION MongoDB Atlas (not local)
- Admin account exists in this database
- User has `role: "admin"` field

### Check 2: Check Render Logs

1. **Render Dashboard** → **Logs** tab
2. **Look for errors:**
   - `MongoDB connection error`
   - `User not found`
   - `Invalid credentials`

### Check 3: Test Login API Directly

1. **Open Browser Console** (F12)
2. **Run:**
   ```javascript
   fetch('https://tonpay-africa.onrender.com/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'admin@tonpay.com',
       password: 'yourpassword'
     })
   })
   .then(r => r.json())
   .then(console.log)
   ```

**Check response:**
- Should show `success: true` and `user.role: 'admin'`
- If error, share the error message

---

## 📝 Quick Summary:

1. ✅ **Create admin in production** using Render Shell script
2. ✅ **Wait for Render to redeploy** (5-10 minutes)
3. ✅ **Login with same credentials** as local
4. ✅ **Should work!**

---

**Run the create-admin script in Render Shell NOW!** 🚀

