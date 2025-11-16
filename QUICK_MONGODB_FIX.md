# ⚡ Quick MongoDB Fix

**Problem:** MongoDB connection timeout because you were on VPN when setting up.

**Solution:** Allow all IPs in MongoDB Atlas.

---

## 🎯 3 Simple Steps

### Step 1: MongoDB Atlas - Allow All IPs
1. Go to: **https://cloud.mongodb.com**
2. Login
3. Click **"Network Access"** (left sidebar)
4. Click **"Add IP Address"**
5. Click **"Allow Access from Anywhere"**
6. Click **"Confirm"**

This adds `0.0.0.0/0` which allows ALL IPs (including Render).

### Step 2: Wait 1 Minute
MongoDB needs time to update.

### Step 3: Redeploy on Render
1. Render Dashboard → Your Service
2. **"Manual Deploy"** tab
3. Click **"Deploy latest commit"**
4. Should work now!

---

## ✅ That's It!

After allowing all IPs, Render will be able to connect to MongoDB.

**The error should be gone!** 🚀

