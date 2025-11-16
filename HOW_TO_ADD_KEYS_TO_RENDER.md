# 📝 How to Add API Keys to Render - Step by Step

---

## 🎯 Step-by-Step Instructions

### Step 1: Open Render Dashboard
1. Go to: **https://dashboard.render.com**
2. Login to your account
3. Click on **"My project"** (or your project name)
4. Click on **"tonpay-africa"** service (the one that's failing)

### Step 2: Go to Environment Tab
1. Look at the top of the page - you'll see tabs like:
   - **Overview**
   - **Logs**
   - **Settings**
   - **Environment** ← **Click this one!**
   - **Manual Deploy**

2. Click **"Environment"** tab

### Step 3: Add Each Key One by One

You'll see a list of environment variables (or it might be empty).

For EACH key, do this:

1. **Click the button:** **"Add Environment Variable"** (or **"+ Add"**)
2. **Two boxes will appear:**
   - **Key:** (type the name)
   - **Value:** (type the actual key/token)

3. **Add them in this order:**

#### Key 1:
- **Key:** `NODE_ENV`
- **Value:** `production`
- Click **"Save"** or **"Add"**

#### Key 2:
- **Key:** `MONGODB_URI`
- **Value:** `mongodb+srv://username:password@cluster.mongodb.net/tonpay-africa`
  (Replace with YOUR actual MongoDB connection string)
- Click **"Save"** or **"Add"**

#### Key 3:
- **Key:** `PAYSTACK_SECRET_KEY`
- **Value:** `sk_live_YOUR_KEY_HERE`
  (Paste your actual Paystack secret key)
- Click **"Save"** or **"Add"**

#### Key 4:
- **Key:** `PAYSTACK_PUBLIC_KEY`
- **Value:** `pk_live_YOUR_KEY_HERE`
  (Paste your actual Paystack public key)
- Click **"Save"** or **"Add"**

#### Key 5:
- **Key:** `VTPASS_API_KEY`
- **Value:** `YOUR_VTPASS_API_KEY`
  (Paste your actual VTPass API key)
- Click **"Save"** or **"Add"**

#### Key 6:
- **Key:** `VTPASS_PUBLIC_KEY`
- **Value:** `YOUR_VTPASS_PUBLIC_KEY`
  (Paste your actual VTPass public key)
- Click **"Save"** or **"Add"**

#### Key 7:
- **Key:** `TELEGRAM_BOT_TOKEN`
- **Value:** `YOUR_TELEGRAM_BOT_TOKEN`
  (Paste your actual Telegram bot token)
- Click **"Save"** or **"Add"**

#### Key 8:
- **Key:** `JWT_SECRET`
- **Value:** `YOUR_RANDOM_STRING_HERE`
  (Paste your generated random string - 32+ characters)
- Click **"Save"** or **"Add"**

#### Key 9:
- **Key:** `JWT_REFRESH_SECRET`
- **Value:** `YOUR_OTHER_RANDOM_STRING_HERE`
  (Paste your second generated random string)
- Click **"Save"** or **"Add"**

#### Key 10:
- **Key:** `FRONTEND_URL`
- **Value:** `https://tonpay-africa.vercel.app`
- Click **"Save"** or **"Add"**

#### Key 11:
- **Key:** `ENABLE_AUTO_PROCESSING`
- **Value:** `true`
- Click **"Save"** or **"Add"**

### Step 4: Save All Changes
After adding all keys, look for a **"Save Changes"** button at the bottom and click it.

### Step 5: Render Will Auto-Redeploy
Once you save, Render will automatically start a new deployment with your new keys!

---

## 📸 Visual Guide

```
Render Dashboard
  └─ My project
      └─ tonpay-africa (click this)
          └─ Environment tab (click this)
              └─ Add Environment Variable (click this)
                  └─ Key: [type name]
                  └─ Value: [paste key]
                  └─ Save
```

---

## ✅ After Adding All Keys

1. **Go to "Manual Deploy" tab**
2. **Click "Deploy latest commit"**
3. **Watch the logs** - it should work now!

---

## 🆘 If You Can't Find "Environment" Tab

Look for:
- **"Env Vars"** tab
- **"Environment Variables"** tab
- **"Config"** tab
- Or check **"Settings"** → **"Environment"**

---

## 💡 Tips

- **Copy-paste carefully** - make sure no extra spaces
- **Don't include quotes** - just paste the key directly
- **Double-check each key** - one typo will break it
- **Save after each one** or add all then save at the end

---

**That's it! Once you add all the keys, Render will deploy successfully!** 🚀

