# ✅ Best Way: Create Admin Using Local Script (Connects to Production MongoDB)

**This is the EASIEST and FASTEST way!**

Run the script **locally on your computer**, but connect it to **PRODUCTION MongoDB Atlas**.

---

## ✅ Step 1: Get Your Production MongoDB Connection String

1. **Go to MongoDB Atlas:** https://cloud.mongodb.com
2. **Click "Connect"** on your cluster
3. **Click "Connect your application"**
4. **Copy the connection string:**
   ```
   mongodb+srv://pluslee:<password>@cluster0.vr0unwy.mongodb.net/?appName=Cluster0
   ```
5. **Add database name** to it:
   ```
   mongodb+srv://pluslee:<password>@cluster0.vr0unwy.mongodb.net/tonpay-africa?appName=Cluster0
   ```
   (Replace `<password>` with your actual password: `pluslee219`)

---

## ✅ Step 2: Create Admin Script (Quick & Easy)

### Option A: Using Environment Variable (Easiest)

**On Windows (PowerShell):**
```powershell
cd C:\Users\lakan\Desktop\tonpay-africa\server
$env:MONGODB_URI="mongodb+srv://pluslee:pluslee219@cluster0.vr0unwy.mongodb.net/tonpay-africa?appName=Cluster0"
node scripts/create-admin.js admin@tonpay.com yourpassword
```

**On Mac/Linux (Terminal):**
```bash
cd ~/Desktop/tonpay-africa/server
export MONGODB_URI="mongodb+srv://pluslee:pluslee219@cluster0.vr0unwy.mongodb.net/tonpay-africa?appName=Cluster0"
node scripts/create-admin.js admin@tonpay.com yourpassword
```

### Option B: Create `.env` file temporarily

1. **Create file:** `server/.env.local`
2. **Add:**
   ```
   MONGODB_URI=mongodb+srv://pluslee:pluslee219@cluster0.vr0unwy.mongodb.net/tonpay-africa?appName=Cluster0
   ```
3. **Run:**
   ```powershell
   cd server
   node scripts/create-admin.js admin@tonpay.com yourpassword
   ```

### Option C: Direct Command (One Line)

**Windows PowerShell:**
```powershell
cd C:\Users\lakan\Desktop\tonpay-africa\server; $env:MONGODB_URI="mongodb+srv://pluslee:pluslee219@cluster0.vr0unwy.mongodb.net/tonpay-africa?appName=Cluster0"; node scripts/create-admin.js admin@tonpay.com yourpassword
```

**Mac/Linux:**
```bash
cd ~/Desktop/tonpay-africa/server && MONGODB_URI="mongodb+srv://pluslee:pluslee219@cluster0.vr0unwy.mongodb.net/tonpay-africa?appName=Cluster0" node scripts/create-admin.js admin@tonpay.com yourpassword
```

---

## ✅ Step 3: Verify It Worked

**You should see:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📧 Creating admin user: admin@tonpay.com
🔑 Password: yourpassword

✅ Created new admin user (or Updated existing user)

📊 Admin User Details:
   Email: admin@tonpay.com
   Role: admin
   ID: ...
   Created: ...
```

---

## ✅ Step 4: Login to Admin Portal

1. **Visit:** https://tonpay-africa.vercel.app/admin
2. **Login with:**
   - **Email:** `admin@tonpay.com` (or whatever you used)
   - **Password:** `yourpassword` (same as you set)
3. **Should work immediately!**

---

## 🎯 Why This is the Best Way:

1. ✅ **No waiting** - Works immediately (no deployment needed)
2. ✅ **No shell needed** - Runs on your local computer
3. ✅ **Same script** - Uses the same script you used locally
4. ✅ **Fast** - Takes seconds, not minutes
5. ✅ **Reliable** - Direct database connection, no API calls

---

## 🔒 Security Note:

**Make sure to:**
- ✅ Delete `.env.local` after creating admin (if you created it)
- ✅ Don't commit `.env.local` to Git
- ✅ The connection string has your password - keep it secret!

---

## 📝 Alternative: Using MongoDB Atlas Web Interface

### Step 1: Go to MongoDB Atlas
1. **Visit:** https://cloud.mongodb.com
2. **Click "Browse Collections"**

### Step 2: Navigate to Users Collection
1. **Database:** `tonpay-africa`
2. **Collection:** `users`

### Step 3: Update Existing User or Create New

**Option A: Update Existing User**
1. **Find your user** (search by email)
2. **Click on it** to edit
3. **Add/Update field:**
   - **Field:** `role`
   - **Value:** `"admin"` (with quotes)
4. **Click "UPDATE"**

**Option B: Create New User**
1. **Click "INSERT DOCUMENT"**
2. **Use this template** (but you need to hash the password manually - complicated):
   ```json
   {
     "email": "admin@tonpay.com",
     "password": "$2a$10$...",  // You need bcrypt hash - use script instead!
     "role": "admin",
     ...
   }
   ```
   **⚠️ Problem:** You need to hash the password, which is complicated!

**Better:** Use the script method above - it handles password hashing automatically!

---

## 🎯 Recommended: Use the Local Script Method!

**It's the easiest, fastest, and most reliable way!**

**Just run:**
```powershell
cd C:\Users\lakan\Desktop\tonpay-africa\server
$env:MONGODB_URI="mongodb+srv://pluslee:pluslee219@cluster0.vr0unwy.mongodb.net/tonpay-africa?appName=Cluster0"
node scripts/create-admin.js admin@tonpay.com yourpassword
```

**Done! Takes 5 seconds!** 🚀

