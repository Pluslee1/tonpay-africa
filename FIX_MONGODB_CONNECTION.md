# 🔧 Fix MongoDB Connection Timeout

**Error:** `MongooseError: Operation buffering timed out after 10000ms`

This means Render can't connect to MongoDB Atlas. The issue is usually **IP whitelisting**.

---

## ✅ Solution: Allow All IPs in MongoDB Atlas

Since you were on VPN when setting up, MongoDB might only allow your VPN IP. Render needs access too!

### Step 1: Go to MongoDB Atlas
1. Go to: **https://cloud.mongodb.com**
2. Login to your account
3. Click on your **cluster** (or create one if you don't have one)

### Step 2: Update Network Access (IP Whitelist)
1. In the left sidebar, click **"Network Access"** (or **"Security"** → **"Network Access"**)
2. You'll see a list of IP addresses
3. **Click "Add IP Address"** button
4. **Click "Allow Access from Anywhere"** button
   - This adds: `0.0.0.0/0`
   - This allows ALL IPs (including Render)
5. **Click "Confirm"**

**OR manually add:**
- IP Address: `0.0.0.0/0`
- Comment: "Allow all IPs for Render"
- Click "Add"

### Step 3: Wait 1-2 Minutes
MongoDB Atlas needs a moment to update the whitelist.

### Step 4: Verify Connection String
1. In MongoDB Atlas, click **"Database"** (or your cluster)
2. Click **"Connect"**
3. Choose **"Connect your application"**
4. Copy the connection string
5. Make sure it looks like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database-name
   ```
6. Replace `<password>` with your actual password

### Step 5: Update Render Environment Variable
1. Go to **Render Dashboard** → Your Service → **Environment** tab
2. Find **`MONGODB_URI`**
3. **Update it** with the correct connection string:
   - Make sure password is correct
   - Make sure no extra spaces
   - Make sure it's the full string
4. **Save Changes**

### Step 6: Redeploy
1. Go to **"Manual Deploy"** tab
2. Click **"Deploy latest commit"**
3. Wait for deployment
4. Check logs - should work now!

---

## 🎯 Quick Checklist

- [ ] MongoDB Atlas → Network Access
- [ ] Add IP: `0.0.0.0/0` (Allow all)
- [ ] Wait 1-2 minutes
- [ ] Verify connection string in MongoDB Atlas
- [ ] Update `MONGODB_URI` in Render
- [ ] Redeploy on Render

---

## 🆘 If Still Not Working

### Check 1: Connection String Format
Make sure `MONGODB_URI` in Render looks like:
```
mongodb+srv://username:password@cluster.mongodb.net/tonpay-africa
```
- No `<password>` - use actual password
- No extra spaces
- Database name at the end

### Check 2: MongoDB User Permissions
1. MongoDB Atlas → **Database Access**
2. Check your user has **"Read and write"** permissions
3. If not, edit user → Add permissions

### Check 3: Cluster Status
1. MongoDB Atlas → Check cluster is **running** (not paused)
2. Free tier clusters pause after inactivity
3. Click **"Resume"** if paused

### Check 4: Render Logs
1. Render → Your Service → **Logs** tab
2. Look for specific MongoDB error messages
3. Share the error if you see one

---

## 💡 Why This Happened

- You set up MongoDB while on VPN
- MongoDB whitelisted your VPN IP only
- Render has different IPs
- Render can't connect → timeout error

**Solution:** Allow all IPs (`0.0.0.0/0`) so Render can connect!

---

**After allowing all IPs and updating the connection string, your deployment should work!** 🚀

