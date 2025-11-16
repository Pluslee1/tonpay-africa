# 🔧 Fix MongoDB Connection String

## ❌ WRONG (What you might have):
```
mongodb+srv://username:<db_password>@cluster.mongodb.net/tonpay-africa
```

## ✅ CORRECT (What you need):
```
mongodb+srv://username:YOUR_ACTUAL_PASSWORD@cluster.mongodb.net/tonpay-africa
```

---

## 📝 Step-by-Step: Get Correct Connection String

### Step 1: Get Connection String from MongoDB Atlas
1. Go to: **https://cloud.mongodb.com**
2. Login
3. Click on your **cluster**
4. Click **"Connect"** button
5. Choose **"Connect your application"**
6. Copy the connection string (it will have `<password>`)

### Step 2: Replace `<password>` with Your Real Password
1. The string looks like:
   ```
   mongodb+srv://myuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
2. Replace `<password>` with your **actual MongoDB password**
   ```
   mongodb+srv://myuser:MyActualPassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 3: Add Database Name
1. Add `/tonpay-africa` before the `?`:
   ```
   mongodb+srv://myuser:MyActualPassword123@cluster0.xxxxx.mongodb.net/tonpay-africa?retryWrites=true&w=majority
   ```

### Step 4: Add to Render
1. Go to **Render Dashboard** → Your Service → **Environment** tab
2. Find **`MONGODB_URI`**
3. **Replace** the value with your corrected connection string
4. **Save Changes**

---

## ❓ What About the Database?

**You DON'T need to clean/clear the database!**

- The database can be empty (it will create collections automatically)
- Or it can have existing data (that's fine too)
- You just need the **correct connection string** with the **correct password**

---

## 🔍 How to Find Your MongoDB Password

If you forgot your password:

1. MongoDB Atlas → **"Database Access"** (left sidebar)
2. Find your database user
3. Click **"Edit"**
4. Click **"Edit Password"**
5. Set a **new password** (remember this!)
6. **Update the connection string** in Render with the new password

---

## ✅ Final Checklist

- [ ] Got connection string from MongoDB Atlas
- [ ] Replaced `<password>` with actual password
- [ ] Added `/tonpay-africa` before the `?`
- [ ] Updated `MONGODB_URI` in Render
- [ ] Saved changes in Render
- [ ] Redeployed

---

## 💡 Example

**Before (WRONG):**
```
mongodb+srv://user:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
```

**After (CORRECT):**
```
mongodb+srv://user:MyPassword123@cluster.mongodb.net/tonpay-africa?retryWrites=true&w=majority
```

---

**Once you fix the connection string with the real password, MongoDB should connect!** 🚀

