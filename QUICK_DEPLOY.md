# ⚡ Quick Deploy Guide (30 Minutes to Live!)

The fastest way to get TonPay Africa live.

---

## 🚀 Step 1: Backend (10 minutes)

### Deploy to Railway (Easiest)

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **New Project** → Deploy from GitHub
4. **Select repository:** `tonpay-africa`
5. **Set Root Directory:** `server`
6. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_uri
   PAYSTACK_SECRET_KEY=sk_live_xxxxx
   PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
   VTPASS_API_KEY=your_key
   VTPASS_PUBLIC_KEY=your_key
   TELEGRAM_BOT_TOKEN=your_token
   JWT_SECRET=random_secure_string
   JWT_REFRESH_SECRET=another_secure_string
   ENABLE_AUTO_PROCESSING=true
   ```
7. **Deploy!** → Railway gives you: `https://your-app.railway.app`

---

## 🎨 Step 2: Frontend (10 minutes)

### Deploy to Vercel (Free)

1. **Go to:** https://vercel.com
2. **Sign up** with GitHub
3. **New Project** → Import from GitHub
4. **Select repository:** `tonpay-africa`
5. **Set Root Directory:** `./` (root)
6. **Add Environment Variable:**
   ```
   VITE_API_URL=https://your-app.railway.app
   ```
7. **Deploy!** → Vercel gives you: `https://tonpay-africa.vercel.app`

---

## 📱 Step 3: Telegram Setup (5 minutes)

1. **Update Bot:**
   - Go to @BotFather
   - `/mybots` → Your Bot → Menu Button
   - Set URL: `https://tonpay-africa.vercel.app`

2. **Update Manifest:**
   - Edit `public/tonconnect-manifest.json`
   - Change `url` to: `https://tonpay-africa.vercel.app`
   - Change `iconUrl` to: `https://tonpay-africa.vercel.app/icon.png`
   - Commit and push (Vercel auto-deploys)

---

## 🔗 Step 4: Custom Domain (5 minutes - Optional)

### For Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `tonpay.africa` (or whatever)
3. Follow DNS instructions
4. SSL is automatic!

### For Railway:
1. Go to Railway Dashboard → Your Service → Settings → Networking
2. Add custom domain
3. Follow DNS instructions

---

## ✅ Step 5: Test (5 minutes)

1. **Visit:** `https://tonpay-africa.vercel.app`
2. **Test features:**
   - Login/Register
   - Connect wallet
   - Send to bank
   - Buy airtime
   - Admin dashboard

3. **Check backend:**
   - Visit: `https://your-app.railway.app/health`
   - Should return: `{"status":"healthy"}`

---

## 🎉 Done!

Your app is now live! 🚀

**Frontend:** `https://tonpay-africa.vercel.app`  
**Backend:** `https://your-app.railway.app`

---

## 🔧 Quick Updates

### Update Backend:
```bash
git push origin main
# Railway auto-deploys
```

### Update Frontend:
```bash
git push origin main
# Vercel auto-deploys
```

---

## 💡 Pro Tips

1. **Use MongoDB Atlas** (free tier works great)
2. **Set up monitoring:** Uptime Robot (free)
3. **Enable backups:** Railway has automatic backups
4. **Monitor costs:** Both platforms show usage

---

## 🆘 Troubleshooting

**Backend not working?**
- Check Railway logs
- Verify environment variables
- Check MongoDB connection

**Frontend not connecting?**
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Check browser console for errors

---

**That's it! You're live in 30 minutes! 🎉**

