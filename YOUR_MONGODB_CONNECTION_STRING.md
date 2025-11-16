# ✅ Your Correct MongoDB Connection String

## ❌ What You Have (WRONG):
```
mongodb+srv://pluslee:<db_password>@cluster0.vr0unwy.mongodb.net/?appName=Cluster0
```

## ✅ What You Need (CORRECT):
```
mongodb+srv://pluslee:pluslee219@cluster0.vr0unwy.mongodb.net/tonpay-africa?appName=Cluster0
```

---

## 📝 Changes Made:
1. ✅ Replaced `<db_password>` with `pluslee219`
2. ✅ Added `/tonpay-africa` (database name) before the `?`

---

## 🎯 Step-by-Step: Add to Render

### Step 1: Go to Render
1. Go to: **https://dashboard.render.com**
2. Click your project → **"tonpay-africa"** service
3. Click **"Environment"** tab

### Step 2: Update MONGODB_URI
1. Find **`MONGODB_URI`** in the list
2. **Click to edit it** (or delete and add new)
3. **Paste this EXACT string:**
   ```
   mongodb+srv://pluslee:pluslee219@cluster0.vr0unwy.mongodb.net/tonpay-africa?appName=Cluster0
   ```
4. **Click "Save"** or **"Save Changes"**

### Step 3: Redeploy
1. Go to **"Manual Deploy"** tab
2. Click **"Deploy latest commit"**
3. Wait 2-3 minutes
4. Check logs - should see: `✅ MongoDB connected successfully!`

---

## ✅ That's It!

After updating `MONGODB_URI` in Render with the correct string, MongoDB should connect!

---

## 🔒 Security Note

**Never share your password publicly again!** I've seen it, but for security:
- Consider changing your MongoDB password after this works
- Never commit passwords to GitHub
- Always use environment variables (which you're doing correctly in Render)

---

**Copy the connection string above and paste it into Render's `MONGODB_URI`!** 🚀

