# 🔐 Fix: API Keys Deleted by GitHub

GitHub detected your API keys in the code and the services automatically revoked them for security. This is why your deployment might be failing.

---

## ✅ Step 1: Regenerate All API Keys

You need to get NEW keys from each service:

### 1. Paystack Keys
1. Go to https://dashboard.paystack.com
2. Settings → API Keys & Webhooks
3. Generate NEW keys:
   - **Secret Key:** `sk_live_...` (or `sk_test_...` for testing)
   - **Public Key:** `pk_live_...` (or `pk_test_...` for testing)
4. **Copy both** - you'll need them

### 2. VTPass Keys
1. Go to https://vtpass.com
2. Login → API Settings
3. Generate NEW API keys
4. **Copy them**

### 3. Telegram Bot Token
1. Open Telegram → **@BotFather**
2. Send `/mybots`
3. Select your bot
4. **API Token** → **Revoke token** (to get a new one)
5. Or create a new bot: `/newbot`
6. **Copy the new token**

### 4. MongoDB URI
1. Go to https://cloud.mongodb.com
2. Your cluster → **Connect** → **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your actual password
5. **Copy the full URI**

### 5. JWT Secrets
Generate new random strings:
- Use: https://randomkeygen.com
- Or run: `openssl rand -base64 32` (if you have OpenSSL)
- Generate TWO different random strings (one for JWT_SECRET, one for JWT_REFRESH_SECRET)

---

## ✅ Step 2: Add Keys to Render (NOT in Code!)

**IMPORTANT:** Never put API keys in code files! Always use environment variables.

1. **Go to Render Dashboard** → Your Service → **Environment** tab
2. **Add each key as a separate variable:**

```
NODE_ENV = production
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/database
PAYSTACK_SECRET_KEY = sk_live_YOUR_NEW_KEY
PAYSTACK_PUBLIC_KEY = pk_live_YOUR_NEW_KEY
VTPASS_API_KEY = YOUR_NEW_VTPASS_KEY
VTPASS_PUBLIC_KEY = YOUR_NEW_VTPASS_PUBLIC_KEY
TELEGRAM_BOT_TOKEN = YOUR_NEW_BOT_TOKEN
JWT_SECRET = YOUR_NEW_RANDOM_STRING_32_CHARS
JWT_REFRESH_SECRET = YOUR_NEW_RANDOM_STRING_32_CHARS
FRONTEND_URL = https://tonpay-africa.vercel.app
ENABLE_AUTO_PROCESSING = true
```

3. **Click "Save Changes"**
4. **Render will auto-redeploy**

---

## ✅ Step 3: Check .gitignore

Make sure `.env` files are NOT uploaded to GitHub:

1. Check if `.gitignore` includes:
   ```
   .env
   .env.local
   .env.*.local
   server/.env
   ```

2. If `.env` files are in GitHub, remove them:
   ```bash
   git rm --cached .env
   git rm --cached server/.env
   git commit -m "Remove .env files from git"
   git push
   ```

---

## ✅ Step 4: Verify No Keys in Code

Check these files DON'T have real API keys:
- `server/.env` (should only have example values)
- `.env` (should only have example values)
- Any `.js` or `.json` files (should use `process.env.KEY_NAME`)

---

## 🎯 Quick Checklist

- [ ] Regenerate Paystack keys
- [ ] Regenerate VTPass keys
- [ ] Regenerate Telegram bot token
- [ ] Get MongoDB URI
- [ ] Generate new JWT secrets
- [ ] Add ALL keys to Render Environment Variables
- [ ] Check .gitignore includes .env
- [ ] Remove .env files from GitHub if they're there
- [ ] Redeploy on Render

---

## 🆘 If Deployment Still Fails

After adding new keys:
1. Go to **Manual Deploy** tab
2. Click **"Deploy latest commit"**
3. Check logs for errors

---

**Once you add the new keys to Render, your deployment should work!** 🔑

