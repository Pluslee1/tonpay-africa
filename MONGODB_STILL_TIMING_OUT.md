# 🔧 MongoDB Still Timing Out - Complete Fix

The server is running but can't connect to MongoDB. Let's fix this step by step.

---

## ✅ Step 1: Verify MongoDB Atlas IP Whitelist

**This is the MOST IMPORTANT step!**

1. Go to: **https://cloud.mongodb.com**
2. Login
3. Click **"Network Access"** (left sidebar)
4. **Check if you see:** `0.0.0.0/0` in the list
5. **If NOT there:**
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"**
   - Click **"Confirm"**
6. **Wait 2-3 minutes** for MongoDB to update

---

## ✅ Step 2: Check MongoDB Cluster Status

1. In MongoDB Atlas, go to **"Database"** (or **"Clusters"**)
2. **Check if cluster is RUNNING** (green status)
3. **If it says "Paused":**
   - Click **"Resume"** or **"Resume Cluster"**
   - Wait for it to start (takes 1-2 minutes)
   - Free tier clusters pause after inactivity

---

## ✅ Step 3: Verify Connection String in Render

1. Go to **Render Dashboard** → Your Service → **Environment** tab
2. Find **`MONGODB_URI`**
3. **Check the format:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database-name
   ```
4. **Common mistakes:**
   - ❌ Has `<password>` - should be actual password
   - ❌ Has extra spaces
   - ❌ Missing `mongodb+srv://` at start
   - ❌ Wrong database name

5. **To get correct string:**
   - Go to MongoDB Atlas
   - Click **"Connect"** on your cluster
   - Choose **"Connect your application"**
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Add database name at end: `/tonpay-africa`

6. **Update in Render:**
   - Edit `MONGODB_URI` in Render
   - Paste the correct string
   - **Save Changes**

---

## ✅ Step 4: Check MongoDB User Permissions

1. MongoDB Atlas → **"Database Access"** (left sidebar)
2. Find your database user
3. **Check permissions:**
   - Should have **"Read and write to any database"**
   - Or at least access to your database
4. **If not:**
   - Click **"Edit"** on the user
   - Add **"Read and write"** permissions
   - Save

---

## ✅ Step 5: Verify MongoDB User Password

1. MongoDB Atlas → **"Database Access"**
2. Find your user
3. **Check if password is correct:**
   - If unsure, click **"Edit"**
   - Click **"Edit Password"**
   - Set a new password
   - **Update `MONGODB_URI` in Render** with new password

---

## ✅ Step 6: Test Connection

After fixing above:

1. **Render Dashboard** → Your Service → **"Manual Deploy"** tab
2. Click **"Deploy latest commit"**
3. **Watch the logs:**
   - Should see: `✅ MongoDB connected successfully!`
   - If still timeout, check logs for specific error

---

## 🆘 Still Not Working?

### Check Render Logs for Specific Error:
1. Render → Your Service → **"Logs"** tab
2. Look for MongoDB errors
3. Common errors:
   - **"authentication failed"** → Wrong password
   - **"timeout"** → IP not whitelisted or cluster paused
   - **"ENOTFOUND"** → Wrong connection string

### Try This Test:
1. Copy your `MONGODB_URI` from Render
2. Test it locally (if you have MongoDB tools)
3. Or use MongoDB Compass to test connection

---

## 📝 Quick Checklist

- [ ] MongoDB Atlas → Network Access → Has `0.0.0.0/0`
- [ ] MongoDB cluster is RUNNING (not paused)
- [ ] `MONGODB_URI` in Render is correct format
- [ ] Password in connection string is correct (no `<password>`)
- [ ] Database user has read/write permissions
- [ ] Waited 2-3 minutes after changes
- [ ] Redeployed on Render

---

## 💡 I've Also Updated the Code

I increased the MongoDB timeout from 10 seconds to 30 seconds in `server/index.js`. This gives Render more time to connect.

**After you fix the IP whitelist and connection string, it should work!** 🚀

