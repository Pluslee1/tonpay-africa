# 🚀 Start Testing on Telegram Mini App - RIGHT NOW!

## ⚡ Quick Start (3 Steps)

### Step 1: Start Your App

**Open Terminal 1:**
```bash
npm run dev
```

**Open Terminal 2 (Backend):**
```bash
cd server
npm run dev
```

✅ Your app is now running on `http://localhost:5173`

---

### Step 2: Get Public URL with ngrok

**Download ngrok:**
- Windows: https://ngrok.com/download (or `choco install ngrok`)
- Mac: `brew install ngrok`
- Or download from: https://ngrok.com/download

**Start ngrok:**
```bash
ngrok http 5173
```

**You'll see:**
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:5173
```

**Copy the HTTPS URL:** `https://abc123.ngrok-free.app`

---

### Step 3: Update & Create Bot

**A. Update Manifest:**

Edit `public/tonconnect-manifest.json`:
```json
{
  "url": "https://YOUR-NGROK-URL.ngrok-free.app",
  "name": "TONPay Africa",
  "iconUrl": "https://YOUR-NGROK-URL.ngrok-free.app/icon.png"
}
```

**Replace `YOUR-NGROK-URL` with your actual ngrok URL!**

**B. Create Telegram Bot:**

1. Open Telegram, search `@BotFather`

2. Create bot:
   ```
   /newbot
   ```
   - Name: `TONPay Africa`
   - Username: `tonpay_africa_bot` (must end with `_bot`)

3. Create Mini App:
   ```
   /newapp
   ```
   - Select your bot
   - Title: `TONPay Africa`
   - Short name: `TONPay`
   - Description: `Send TON, buy airtime, split bills`
   - **Web App URL:** `https://YOUR-NGROK-URL.ngrok-free.app`
   - Complete setup

4. Get link:
   ```
   /myapps
   ```
   - Copy Mini App link

---

### Step 4: TEST! 🎉

**Open the Mini App link in Telegram!**

Or search your bot and click "Open App"

---

## ✅ What Should Work

- ✅ App opens in Telegram
- ✅ Shows your dashboard
- ✅ Telegram theme applied
- ✅ Can navigate pages
- ✅ TON Connect works
- ✅ All features work

---

## 🐛 Troubleshooting

**Blank screen?**
- Make sure ngrok is running
- Check frontend is on port 5173
- Test ngrok URL in browser first

**TON Connect not working?**
- Verify manifest URL is accessible
- Check manifest JSON is valid
- Must be HTTPS

**API errors?**
- Backend also needs public URL
- Run: `ngrok http 5000` (in another terminal)
- Update API URL in frontend config

---

## 🎯 You're Ready!

Once you can open the app in Telegram, you're testing! 🚀

**Need help?** Check `TELEGRAM_MINI_APP_SETUP.md` for detailed guide.


