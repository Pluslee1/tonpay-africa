# 🚀 Test Your Telegram Mini App - Quick Start

## ⚡ Fastest Way to Test (5 minutes)

### Step 1: Start Your App

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend (if needed):**
```bash
cd server
npm run dev
```

### Step 2: Get Public URL with ngrok

1. **Download ngrok:** https://ngrok.com/download
   - Or install: `choco install ngrok` (Windows) or `brew install ngrok` (Mac)

2. **Start ngrok:**
   ```bash
   ngrok http 5173
   ```

3. **Copy the HTTPS URL:**
   - Look for: `Forwarding https://abc123.ngrok-free.app -> http://localhost:5173`
   - Copy: `https://abc123.ngrok-free.app`

### Step 3: Update Manifest

Update `public/tonconnect-manifest.json`:

```json
{
  "url": "https://YOUR-NGROK-URL.ngrok-free.app",
  "name": "TONPay Africa",
  "iconUrl": "https://YOUR-NGROK-URL.ngrok-free.app/icon.png"
}
```

**Replace `YOUR-NGROK-URL` with your actual ngrok URL!**

### Step 4: Create Telegram Bot

1. **Open Telegram**, search `@BotFather`

2. **Create bot:**
   ```
   /newbot
   ```
   - Name: `TONPay Africa`
   - Username: `tonpay_africa_bot`

3. **Create Mini App:**
   ```
   /newapp
   ```
   - Select your bot
   - Title: `TONPay Africa`
   - **Web App URL:** `https://YOUR-NGROK-URL.ngrok-free.app`
   - Complete the setup

4. **Get Mini App link:**
   ```
   /myapps
   ```
   - Copy the link (e.g., `https://t.me/tonpay_africa_bot/tonpay`)

### Step 5: Test!

1. **Open the Mini App link** in Telegram
2. **Or search your bot** and click "Open App"
3. **Test the app!**

---

## ✅ What to Test

- [ ] App opens in Telegram
- [ ] Shows dashboard
- [ ] Theme matches Telegram
- [ ] Can navigate pages
- [ ] TON Connect button works
- [ ] Can connect wallet
- [ ] API calls work

---

## 🐛 If Something Doesn't Work

### Blank Screen?
- Check ngrok is running
- Check frontend is running on port 5173
- Open ngrok URL in browser first to test

### TON Connect Not Working?
- Verify manifest URL is accessible
- Check manifest JSON is valid
- Make sure URL is HTTPS

### API Errors?
- Backend also needs public URL
- Start ngrok for backend: `ngrok http 5000`
- Update API base URL in frontend

---

## 🎯 You're Ready!

Once you can open the app in Telegram and see your dashboard, you're good to go! 🎉


