# ✅ Create Admin Without Render Shell (Free Tier)

**Render Shell is not available on free tier!**

Here are **3 ways** to create your admin account in production:

---

## ✅ Option 1: Using API Endpoint (Easiest - RECOMMENDED)

I just added a `/api/auth/create-admin` endpoint that you can call!

### Step 1: Wait for Render to Redeploy (5-10 minutes)

The new endpoint is being deployed now.

### Step 2: Create Admin via API Call

**Option A: Using Browser Console (Easiest)**

1. **Visit:** https://tonpay-africa.vercel.app/admin
2. **Press F12** → **Console tab**
3. **Run this:**
   ```javascript
   fetch('https://tonpay-africa.onrender.com/api/auth/create-admin', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'admin@tonpay.com',  // Your admin email
       password: 'yourpassword123'  // Your admin password
     })
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error)
   ```

4. **Should see:**
   ```json
   {
     "success": true,
     "message": "Admin user created successfully",
     "user": {
       "email": "admin@tonpay.com",
       "role": "admin"
     }
   }
   ```

**Option B: Using curl (if you have it)**

```bash
curl -X POST https://tonpay-africa.onrender.com/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tonpay.com","password":"yourpassword123"}'
```

**Option C: Using Postman/Insomnia**

1. **Method:** POST
2. **URL:** `https://tonpay-africa.onrender.com/api/auth/create-admin`
3. **Headers:** `Content-Type: application/json`
4. **Body:**
   ```json
   {
     "email": "admin@tonpay.com",
     "password": "yourpassword123"
   }
   ```

---

## ✅ Option 2: Using MongoDB Atlas Directly

### Step 1: Go to MongoDB Atlas

1. **Visit:** https://cloud.mongodb.com
2. **Login** to your account
3. **Select your cluster:** `Cluster0`

### Step 2: Browse Collections

1. **Click "Browse Collections"** (left sidebar)
2. **Select database:** `tonpay-africa`
3. **Select collection:** `users`

### Step 3: Create Admin User

**Option A: Add New Document**

1. **Click "INSERT DOCUMENT"**
2. **Paste this** (replace with your email/password):
   ```json
   {
     "email": "admin@tonpay.com",
     "password": "$2a$10$...",  // You need to hash password first - see below
     "role": "admin",
     "profile": {
       "firstName": "Admin",
       "lastName": "User"
     },
     "kyc": {
       "status": "verified"
     },
     "security": {
       "failedLoginAttempts": 0
     },
     "status": "active",
     "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
     "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
   }
   ```

**⚠️ Problem:** You need to hash the password! Use Option 1 (API endpoint) instead - it handles password hashing automatically!

**Option B: Update Existing User**

1. **Find your user** in the collection
2. **Click on it** to edit
3. **Add/Update field:**
   - **Field:** `role`
   - **Value:** `"admin"` (with quotes)
4. **Click "UPDATE"**

---

## ✅ Option 3: Using MongoDB Compass (If Installed)

1. **Open MongoDB Compass**
2. **Connect to:** Your MongoDB Atlas connection string
3. **Navigate to:** `tonpay-africa` → `users` collection
4. **Find your user** or create new one
5. **Set `role: "admin"`**

---

## ✅ After Creating Admin:

1. **Wait 5-10 minutes** for Render to redeploy (if using API endpoint)
2. **Visit:** https://tonpay-africa.vercel.app/admin
3. **Login with your admin credentials:**
   - **Email:** Same as you created
   - **Password:** Same as you set
4. **Should work now!**

---

## 🔒 Security Note:

The `/api/auth/create-admin` endpoint:
- **Only works if NO admin exists** (first-time setup)
- **OR if `ADMIN_SETUP_TOKEN` is set** in Render environment variables
- **Use it once** to create admin, then it's protected

**To secure it further:**
1. **Render Dashboard** → **Environment** tab
2. **Add:** `ADMIN_SETUP_TOKEN` = `your-secret-token-123`
3. **Use token** when calling the endpoint:
   ```javascript
   fetch('https://tonpay-africa.onrender.com/api/auth/create-admin', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'admin@tonpay.com',
       password: 'yourpassword123',
       setupToken: 'your-secret-token-123'  // Add this
     })
   })
   ```

---

## 🎯 Recommended: Use Option 1 (API Endpoint)

**Easiest and safest!**

1. ✅ **No shell needed**
2. ✅ **Handles password hashing automatically**
3. ✅ **Can use from browser**
4. ✅ **One-time setup**

**Wait 5-10 minutes for Render to redeploy, then use the browser console method!** 🚀

