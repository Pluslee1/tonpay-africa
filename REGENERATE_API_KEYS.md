# 🔑 Regenerate API Keys - Step by Step

GitHub detected your API keys and the services revoked them. You need NEW keys.

---

## 🚨 What Happened?

When you upload API keys to GitHub, services like Paystack, VTPass detect them and automatically delete/revoke them for security. This is why your deployment is failing.

---

## ✅ Step 1: Get NEW API Keys

### 1. Paystack (Payment Processing)
1. Go to: https://dashboard.paystack.com
2. Login
3. Click **"Settings"** → **"API Keys & Webhooks"**
4. Click **"Create API Key"** or **"Regenerate"**
5. Copy:
   - **Secret Key:** `sk_live_...` (starts with sk_live_)
   - **Public Key:** `pk_live_...` (starts with pk_live_)

### 2. VTPass (Airtime/Data)
1. Go to: https://vtpass.com
2. Login
3. Go to **"API Settings"** or **"Developer"**
4. Generate NEW API keys
5. Copy both keys

### 3. Telegram Bot Token
1. Open Telegram app
2. Search for **@BotFather**
3. Send: `/mybots`
4. Select your bot
5. Click **"API Token"**
6. Click **"Revoke token"** (to get a new one)
7. Copy the NEW token

OR create a new bot:
- Send `/newbot` to @BotFather
- Follow instructions
- Copy the new token

### 4. MongoDB URI
1. Go to: https://cloud.mongodb.com
2. Login
3. Click your cluster
4. Click **"Connect"**
5. Choose **"Connect your application"**
6. Copy the connection string
7. Replace `<password>` with your actual MongoDB password
8. Copy the full URI (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)

### 5. JWT Secrets (Generate Random Strings)
Go to: https://randomkeygen.com
- Generate TWO different random strings (32+ characters each)
- Copy them - you'll need:
  - One for `JWT_SECRET`
  - One for `JWT_REFRESH_SECRET`

---

## ✅ Step 2: Add Keys to Render (IMPORTANT!)

**NEVER put keys in code files! Always use environment variables.**

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Click your service:** "tonpay-africa"
3. **Click "Environment" tab**
4. **Add each key one by one:**

Click **"Add Environment Variable"** for each:

```
Name: NODE_ENV
Value: production

Name: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/tonpay-africa

Name: PAYSTACK_SECRET_KEY
Value: sk_live_YOUR_NEW_KEY_HERE

Name: PAYSTACK_PUBLIC_KEY
Value: pk_live_YOUR_NEW_KEY_HERE

Name: VTPASS_API_KEY
Value: YOUR_NEW_VTPASS_KEY

Name: VTPASS_PUBLIC_KEY
Value: YOUR_NEW_VTPASS_PUBLIC_KEY

Name: TELEGRAM_BOT_TOKEN
Value: YOUR_NEW_BOT_TOKEN

Name: JWT_SECRET
Value: YOUR_RANDOM_STRING_32_CHARS

Name: JWT_REFRESH_SECRET
Value: YOUR_OTHER_RANDOM_STRING_32_CHARS

Name: FRONTEND_URL
Value: https://tonpay-africa.vercel.app

Name: ENABLE_AUTO_PROCESSING
Value: true
```

5. **Click "Save Changes"** after adding all
6. **Render will auto-redeploy!**

---

## ✅ Step 3: Remove Keys from GitHub (If They're There)

If you accidentally committed `.env` files:

1. **Check if .env files are in GitHub:**
   - Go to your GitHub repo
   - Search for `.env` files
   - If you see them, they need to be removed

2. **Remove them:**
   ```bash
   git rm --cached .env
   git rm --cached server/.env
   git commit -m "Remove .env files - keys should not be in git"
   git push
   ```

3. **I've created `.gitignore`** - this prevents future uploads

---

## ✅ Step 4: Redeploy

After adding all new keys to Render:

1. Go to **"Manual Deploy"** tab
2. Click **"Deploy latest commit"**
3. Wait 2-3 minutes
4. Check if it works!

---

## 🎯 Quick Checklist

- [ ] Get new Paystack keys
- [ ] Get new VTPass keys  
- [ ] Get new Telegram bot token
- [ ] Get MongoDB URI
- [ ] Generate JWT secrets
- [ ] Add ALL to Render Environment Variables
- [ ] Remove .env files from GitHub (if they're there)
- [ ] Redeploy

---

## 💡 Important Rules

1. **NEVER commit API keys to GitHub**
2. **Always use environment variables**
3. **Use `.gitignore` to exclude .env files**
4. **If keys are exposed, regenerate them immediately**

---

**Once you add the new keys to Render, your deployment should work!** 🔑

