# ✅ Final Configuration Steps

Your Vercel URL: **https://tonpay-africa.vercel.app**  
Your Render Backend: **https://tonpay-africa.onrender.com**

---

## ✅ Step 1: TON Connect Manifest (DONE!)

I've updated `public/tonconnect-manifest.json` with your Vercel URL.  
Vercel will auto-redeploy with the updated manifest!

---

## 🔧 Step 2: Update Backend CORS in Render (IMPORTANT!)

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Click on your service:** `tonpay-backend` (or similar)
3. **Go to "Environment" tab**
4. **Add/Update this variable:**
   ```
   FRONTEND_URL = https://tonpay-africa.vercel.app
   ```
5. **Click "Save Changes"**
6. **Render will auto-redeploy!**

This allows your frontend to make API calls to the backend.

---

## 📱 Step 3: Update Telegram Bot (2 minutes)

1. **Open Telegram** → Search for **@BotFather**
2. **Send:** `/mybots`
3. **Select your bot**
4. **Click:** "Bot Settings" → "Menu Button"
5. **Set URL to:** `https://tonpay-africa.vercel.app`
6. **Click "Done"**

Now when users click the menu button in your Telegram bot, it will open your app!

---

## 🔍 Step 4: Verify Vercel Environment Variable

Make sure `VITE_API_URL` is set in Vercel:

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **Check if `VITE_API_URL` exists:**
   - Should be: `https://tonpay-africa.onrender.com`
   - ⚠️ **No trailing slash!**
3. **If missing, add it:**
   - Name: `VITE_API_URL`
   - Value: `https://tonpay-africa.onrender.com`
   - Environment: Production, Preview, Development (select all)
4. **Save** and **redeploy** if you added it

---

## ✅ Step 5: Test Everything!

### Test Backend:
- Visit: https://tonpay-africa.onrender.com/health
- Should return: `{"status":"healthy"}`

### Test Frontend:
- Visit: https://tonpay-africa.vercel.app
- Open browser console (F12)
- Check for errors
- Try to register/login

### Test Telegram:
- Open your Telegram bot
- Click the menu button
- Your app should load!

---

## 🎉 You're Done!

**Frontend:** https://tonpay-africa.vercel.app  
**Backend:** https://tonpay-africa.onrender.com

Your app is now live and accessible to anyone, anywhere! 🚀

---

## 📝 Quick Checklist

- [x] TON Connect Manifest updated
- [ ] Backend CORS updated (add `FRONTEND_URL` in Render)
- [ ] Telegram bot menu button configured
- [ ] Vercel environment variable verified (`VITE_API_URL`)
- [ ] Test frontend
- [ ] Test Telegram bot

---

## 🆘 Troubleshooting

### Frontend can't connect to backend?
- Check `VITE_API_URL` in Vercel matches Render URL exactly
- Check `FRONTEND_URL` in Render matches Vercel URL exactly
- Check browser console for CORS errors

### Telegram bot not loading?
- Verify menu button URL is: `https://tonpay-africa.vercel.app`
- Make sure manifest is updated (should be done automatically)
- Check Telegram app for errors

### Backend not responding?
- Check Render logs
- Verify MongoDB connection
- Check environment variables in Render

---

**Next:** Complete Step 2 (Update Backend CORS in Render) and Step 3 (Update Telegram Bot)! 🎯

