# ✅ Next Steps After Render Deployment

Your backend is live at: **https://tonpay-africa.onrender.com**

---

## Step 1: Test Your Backend (2 minutes)

### Test Health Endpoint:
1. Open: https://tonpay-africa.onrender.com/health
2. Should return: `{"status":"healthy","database":"connected"}`

### Test API Info:
1. Open: https://tonpay-africa.onrender.com/
2. Should show API information

**If you see errors:**
- Check Render logs (Dashboard → Your Service → Logs)
- Verify environment variables are set correctly
- Check MongoDB connection

---

## Step 2: Deploy Frontend to Vercel (10 minutes)

### 2.1: Go to Vercel
1. Go to **https://vercel.com**
2. Sign up/login with GitHub

### 2.2: Create New Project
1. Click **"Add New Project"**
2. Import your `tonpay-africa` repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 2.3: Add Environment Variable
1. Go to **"Environment Variables"**
2. Add:
   ```
   VITE_API_URL = https://tonpay-africa.onrender.com
   ```
   ⚠️ **Important:** No trailing slash!

### 2.4: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Vercel gives you: `https://tonpay-africa.vercel.app` (or similar)

---

## Step 3: Update Telegram Bot (2 minutes)

1. Open Telegram → **@BotFather**
2. Send `/mybots`
3. Select your bot
4. **Bot Settings** → **Menu Button**
5. Set URL to your **Vercel frontend URL**
6. Click **Done**

---

## Step 4: Update TON Connect Manifest (2 minutes)

1. Edit `public/tonconnect-manifest.json`
2. Update to:
   ```json
   {
     "url": "https://your-vercel-url.vercel.app",
     "name": "TONPay Africa",
     "iconUrl": "https://your-vercel-url.vercel.app/icon.png"
   }
   ```
3. Commit and push:
   ```bash
   git add public/tonconnect-manifest.json
   git commit -m "Update manifest for production"
   git push origin main
   ```
4. Vercel will auto-redeploy!

---

## Step 5: Update Backend CORS (1 minute)

1. Go to **Render Dashboard** → Your Service → **Environment**
2. Make sure `FRONTEND_URL` is set:
   ```
   FRONTEND_URL = https://your-vercel-url.vercel.app
   ```
3. Render will auto-redeploy!

---

## Step 6: Test Everything (5 minutes)

### Test Frontend:
1. Visit your Vercel URL
2. Try to register/login
3. Check browser console (F12) for errors

### Test Telegram:
1. Open your Telegram bot
2. Click menu button
3. App should load!

### Test Features:
- [ ] Login/Register
- [ ] Connect wallet
- [ ] View dashboard
- [ ] Check balance

---

## ✅ You're Done!

**Backend:** https://tonpay-africa.onrender.com  
**Frontend:** https://your-vercel-url.vercel.app

Your app is now live and accessible to anyone, anywhere! 🎉

---

## 🔄 Making Updates

### Update Backend:
```bash
git push origin main
# Render auto-deploys!
```

### Update Frontend:
```bash
git push origin main
# Vercel auto-deploys!
```

---

## 🆘 Troubleshooting

### Backend not responding?
- Check Render logs
- Verify environment variables
- Check MongoDB connection

### Frontend can't connect?
- Verify `VITE_API_URL` matches Render URL exactly
- Check CORS settings in backend
- Check browser console for errors

### CORS errors?
- Make sure `FRONTEND_URL` in Render matches Vercel URL
- Check backend logs for CORS errors

---

## 💡 Pro Tips

1. **Render Free Tier:** Services sleep after 15 min inactivity (first request takes ~30 sec)
2. **Upgrade to Starter ($7/mo):** For always-on service
3. **Monitor:** Check Render dashboard regularly
4. **Logs:** Use Render logs to debug issues

---

**Congratulations! Your app is live! 🚀**

