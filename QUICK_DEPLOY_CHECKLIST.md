# ✅ Quick Deploy Checklist

Follow this checklist to deploy your app in 30 minutes!

## 📋 Pre-Deployment

- [ ] **MongoDB Atlas Account**
  - Go to https://cloud.mongodb.com
  - Create free cluster
  - Get connection string
  - Whitelist IP: `0.0.0.0/0` (allow all for Railway/Render)

- [ ] **Paystack Account**
  - Go to https://dashboard.paystack.com
  - Get production API keys (or test keys for demo)
  - Copy `sk_live_...` and `pk_live_...`

- [ ] **Telegram Bot**
  - Message @BotFather on Telegram
  - Get your bot token

- [ ] **VTPass Account** (for airtime/data)
  - Go to https://vtpass.com
  - Get API keys

---

## 🚀 Step 1: Deploy Backend (Railway)

- [ ] Go to https://railway.app
- [ ] Sign up with GitHub
- [ ] New Project → Deploy from GitHub
- [ ] Select `tonpay-africa` repository
- [ ] Add Service → GitHub Repo
- [ ] Set Root Directory: `server`
- [ ] Set Start Command: `npm start`
- [ ] Add Environment Variables:
  ```
  NODE_ENV=production
  PORT=5000
  MONGODB_URI=your_mongodb_uri
  PAYSTACK_SECRET_KEY=sk_live_...
  PAYSTACK_PUBLIC_KEY=pk_live_...
  VTPASS_API_KEY=...
  VTPASS_PUBLIC_KEY=...
  TELEGRAM_BOT_TOKEN=...
  JWT_SECRET=generate_random_string
  JWT_REFRESH_SECRET=generate_random_string
  FRONTEND_URL=https://your-frontend.vercel.app
  ENABLE_AUTO_PROCESSING=true
  ```
- [ ] Click Deploy
- [ ] Wait for deployment (2-3 minutes)
- [ ] Copy the Railway URL (e.g., `https://tonpay-backend.up.railway.app`)

---

## 🎨 Step 2: Deploy Frontend (Vercel)

- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Add New Project
- [ ] Import `tonpay-africa` repository
- [ ] Configure:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Add Environment Variable:
  ```
  VITE_API_URL=https://your-railway-url.up.railway.app
  ```
  (Use the Railway URL from Step 1)
- [ ] Click Deploy
- [ ] Wait for deployment (2-3 minutes)
- [ ] Copy the Vercel URL (e.g., `https://tonpay-africa.vercel.app`)

---

## 📱 Step 3: Update Telegram

- [ ] Open Telegram → @BotFather
- [ ] Send `/mybots`
- [ ] Select your bot
- [ ] Bot Settings → Menu Button
- [ ] Set URL: `https://your-vercel-url.vercel.app`
- [ ] Done!

---

## 🔧 Step 4: Update TON Connect Manifest

- [ ] Edit `public/tonconnect-manifest.json`
- [ ] Update `url` to your Vercel URL:
  ```json
  {
    "url": "https://your-vercel-url.vercel.app",
    "name": "TONPay Africa",
    "iconUrl": "https://your-vercel-url.vercel.app/icon.png"
  }
  ```
- [ ] Commit and push:
  ```bash
  git add public/tonconnect-manifest.json
  git commit -m "Update manifest for production"
  git push origin main
  ```
- [ ] Vercel will auto-redeploy!

---

## 🔄 Step 5: Update Backend CORS

- [ ] Go back to Railway dashboard
- [ ] Update `FRONTEND_URL` environment variable:
  ```
  FRONTEND_URL=https://your-vercel-url.vercel.app
  ```
- [ ] Railway will auto-redeploy!

---

## ✅ Step 6: Test Everything

- [ ] **Test Backend:**
  - Visit: `https://your-railway-url/health`
  - Should see: `{"status":"healthy","database":"connected"}`

- [ ] **Test Frontend:**
  - Visit: `https://your-vercel-url.vercel.app`
  - Try to register/login
  - Check browser console (F12) for errors

- [ ] **Test Telegram:**
  - Open your Telegram bot
  - Click menu button
  - App should load!

- [ ] **Test Features:**
  - [ ] Login/Register
  - [ ] Connect wallet
  - [ ] View dashboard
  - [ ] Check balance

---

## 🎉 Done!

Your app is now live and accessible to anyone, anywhere!

**Frontend:** `https://your-vercel-url.vercel.app`  
**Backend:** `https://your-railway-url.up.railway.app`

---

## 🔄 Making Updates

### Update Backend:
```bash
git push origin main
# Railway auto-deploys!
```

### Update Frontend:
```bash
git push origin main
# Vercel auto-deploys!
```

---

## 🆘 Common Issues

**Backend not starting?**
- Check Railway logs
- Verify all environment variables are set
- Check MongoDB connection string

**Frontend can't connect?**
- Verify `VITE_API_URL` matches Railway URL
- Check browser console for errors
- Make sure backend is running

**CORS errors?**
- Update `FRONTEND_URL` in Railway
- Make sure it matches your Vercel URL exactly

---

## 💡 Pro Tips

1. **Generate Secure JWT Secrets:**
   ```bash
   # On Mac/Linux:
   openssl rand -base64 32
   
   # Or use: https://randomkeygen.com
   ```

2. **Monitor Your App:**
   - Set up Uptime Robot (free) to monitor both URLs
   - Get email alerts if services go down

3. **Check Logs:**
   - Railway: Dashboard → Your Service → Logs
   - Vercel: Dashboard → Your Project → Functions → Logs

4. **Database Backups:**
   - MongoDB Atlas has automatic backups
   - Enable in Atlas dashboard

---

**Need more help?** Check `DEPLOY_TO_PRODUCTION.md` for detailed instructions!

