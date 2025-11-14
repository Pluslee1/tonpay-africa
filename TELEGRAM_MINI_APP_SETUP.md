# 📱 Telegram Mini App Setup & Testing Guide

## 🎯 What You Need

1. **Public URL** - Your app needs to be accessible from the internet
2. **Telegram Bot** - To host your Mini App
3. **Updated Manifest** - TON Connect manifest with public URL
4. **HTTPS** - Required for Telegram Mini Apps

---

## 🚀 Step 1: Get a Public URL

### Option A: Using ngrok (Easiest for Testing)

1. **Install ngrok:**
   - Download from: https://ngrok.com/download
   - Or install via package manager

2. **Start your frontend:**
   ```bash
   npm run dev
   ```
   (Runs on http://localhost:5173)

3. **Start ngrok:**
   ```bash
   ngrok http 5173
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### Option B: Using Cloudflare Tunnel (Free)

1. Install cloudflared
2. Run: `cloudflared tunnel --url http://localhost:5173`
3. Copy the HTTPS URL

### Option C: Deploy to Vercel/Netlify (Production)

1. Deploy your frontend to Vercel or Netlify
2. Get your production URL
3. Use that URL

---

## 🔧 Step 2: Update TON Connect Manifest

Update `public/tonconnect-manifest.json` and `tonconnect-manifest.json`:

```json
{
  "url": "https://YOUR-PUBLIC-URL.com",
  "name": "TONPay Africa",
  "iconUrl": "https://YOUR-PUBLIC-URL.com/icon.png"
}
```

**Replace:**
- `YOUR-PUBLIC-URL.com` with your ngrok URL or production URL
- Add an icon image (192x192px PNG) to your public folder

---

## 🤖 Step 3: Create Telegram Bot

1. **Open Telegram** and search for `@BotFather`

2. **Create a new bot:**
   ```
   /newbot
   ```
   - Choose a name: `TONPay Africa`
   - Choose a username: `tonpay_africa_bot` (must end with `_bot`)

3. **Save your bot token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

4. **Set up Mini App:**
   ```
   /newapp
   ```
   - Select your bot
   - Choose a title: `TONPay Africa`
   - Short name: `TONPay`
   - Description: `Send TON, buy airtime, split bills in Nigeria`
   - Photo: Upload your app icon
   - GIF (optional): Skip or upload
   - **Web App URL:** `https://YOUR-PUBLIC-URL.com`
   - Short name: `TONPay`

5. **Get your Mini App link:**
   ```
   /myapps
   ```
   - Select your bot
   - Copy the Mini App link (looks like: `https://t.me/tonpay_africa_bot/tonpay`)

---

## 🧪 Step 4: Test in Telegram

### Method 1: Direct Link

1. Open the Mini App link in Telegram:
   ```
   https://t.me/tonpay_africa_bot/tonpay
   ```

2. Or search for your bot and click "Open App"

### Method 2: Inline Button

Add this to your bot's `/start` command:
```javascript
// In your bot code (if you have one)
bot.command('start', (ctx) => {
  ctx.reply('Welcome to TONPay Africa!', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Open App', web_app: { url: 'https://YOUR-PUBLIC-URL.com' } }
      ]]
    }
  });
});
```

---

## ✅ Step 5: Verify Everything Works

### Checklist:

- [ ] Frontend is running and accessible via public URL
- [ ] TON Connect manifest updated with public URL
- [ ] Telegram bot created
- [ ] Mini App configured in BotFather
- [ ] Can open Mini App in Telegram
- [ ] App loads without errors
- [ ] Telegram WebApp SDK works (theme, expand, etc.)
- [ ] TON Connect works (can connect wallet)

---

## 🔍 Testing Checklist

### Basic Functionality:

1. **App Opens:**
   - ✅ Opens in Telegram
   - ✅ No blank screen
   - ✅ Shows your dashboard

2. **Telegram Integration:**
   - ✅ App expands to full screen
   - ✅ Theme matches Telegram (light/dark)
   - ✅ Back button works

3. **TON Connect:**
   - ✅ Connect wallet button shows
   - ✅ Can connect TON wallet
   - ✅ Wallet address displays

4. **Features:**
   - ✅ Can navigate between pages
   - ✅ API calls work (rate, balance, etc.)
   - ✅ Forms work correctly

---

## 🐛 Common Issues & Fixes

### Issue: Blank Screen

**Fix:**
- Check browser console for errors
- Make sure all assets load (check Network tab)
- Verify public URL is accessible
- Check CORS settings

### Issue: TON Connect Not Working

**Fix:**
- Verify manifest URL is correct and accessible
- Check manifest JSON is valid
- Make sure URL is HTTPS
- Check browser console for errors

### Issue: API Calls Fail

**Fix:**
- Backend needs to be publicly accessible too
- Update API base URL in frontend
- Check CORS settings in backend
- Use ngrok for backend: `ngrok http 5000`

### Issue: Telegram Theme Not Applied

**Fix:**
- Make sure `telegram-web-app.js` is loaded
- Check CSS variables are used correctly
- Verify WebApp.ready() is called

---

## 📝 Quick Setup Script

Create a file `setup-telegram.sh`:

```bash
#!/bin/bash

# 1. Start frontend
npm run dev &
FRONTEND_PID=$!

# 2. Start ngrok
ngrok http 5173 &
NGROK_PID=$!

# 3. Wait for ngrok
sleep 3

# 4. Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

echo "🌐 Your public URL: $NGROK_URL"
echo "📝 Update tonconnect-manifest.json with this URL"
echo "🤖 Use this URL in BotFather when setting up Mini App"

# Keep running
wait
```

---

## 🎯 Production Deployment

### For Production:

1. **Deploy Frontend:**
   - Vercel: `vercel deploy`
   - Netlify: `netlify deploy --prod`
   - Or your hosting provider

2. **Deploy Backend:**
   - Railway, Render, Heroku, or VPS
   - Update frontend API URL to production backend

3. **Update URLs:**
   - Update `tonconnect-manifest.json` with production URL
   - Update Telegram bot Mini App URL
   - Update API base URL in frontend

4. **SSL Certificate:**
   - Make sure HTTPS is enabled
   - Telegram requires HTTPS for Mini Apps

---

## 🚀 Quick Test Now

### Using ngrok (Fastest):

1. **Terminal 1 - Start Frontend:**
   ```bash
   npm run dev
   ```

2. **Terminal 2 - Start ngrok:**
   ```bash
   ngrok http 5173
   ```

3. **Copy the HTTPS URL** from ngrok (e.g., `https://abc123.ngrok-free.app`)

4. **Update manifest:**
   ```bash
   # Update both files
   echo '{"url":"https://abc123.ngrok-free.app","name":"TONPay Africa","iconUrl":"https://abc123.ngrok-free.app/icon.png"}' > public/tonconnect-manifest.json
   ```

5. **Create bot in BotFather** and use the ngrok URL

6. **Open in Telegram** and test!

---

## 📞 Need Help?

- Check browser console for errors
- Check Telegram Mini App console (if available)
- Verify all URLs are HTTPS
- Make sure backend is also publicly accessible if needed

---

**Your Mini App is ready to test!** 🎉


