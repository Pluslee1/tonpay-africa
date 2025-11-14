# 🚀 Deploy TonPay Africa to Production (No Laptop Needed!)

This guide will help you deploy your app to a stable server so anyone can access it without your laptop running.

---

## 🎯 Quick Start (Easiest Method - 30 minutes)

### Option 1: Railway + Vercel (Recommended - Free to Start)

This is the **easiest and fastest** way to get your app live.

#### Step 1: Deploy Backend to Railway (10 minutes)

1. **Go to:** https://railway.app
2. **Sign up** with GitHub (free)
3. Click **"New Project"** → **"Deploy from GitHub"**
4. Select your `tonpay-africa` repository
5. Railway will detect your project. Click **"Add Service"** → **"GitHub Repo"**
6. In the service settings:
   - **Root Directory:** Set to `server`
   - **Start Command:** `npm start`
7. Go to **"Variables"** tab and add these environment variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
PAYSTACK_SECRET_KEY=sk_live_your_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_key_here
VTPASS_API_KEY=your_vtpass_key
VTPASS_PUBLIC_KEY=your_vtpass_public_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
JWT_SECRET=generate_a_random_secure_string_here
JWT_REFRESH_SECRET=another_random_secure_string_here
FRONTEND_URL=https://your-frontend-url.vercel.app
ENABLE_AUTO_PROCESSING=true
```

8. Click **"Deploy"** - Railway will build and deploy automatically!
9. Once deployed, Railway gives you a URL like: `https://tonpay-africa-production.up.railway.app`
10. **Copy this URL** - you'll need it for the frontend!

#### Step 2: Deploy Frontend to Vercel (10 minutes)

1. **Go to:** https://vercel.com
2. **Sign up** with GitHub (free)
3. Click **"Add New Project"**
4. Import your `tonpay-africa` repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Go to **"Environment Variables"** and add:
   ```
   VITE_API_URL=https://your-railway-backend-url.up.railway.app
   ```
   (Use the Railway URL from Step 1)
7. Click **"Deploy"** - Vercel will build and deploy!
8. Once deployed, Vercel gives you a URL like: `https://tonpay-africa.vercel.app`
9. **Copy this URL** - you'll need it for Telegram!

#### Step 3: Update Telegram Bot (5 minutes)

1. Open Telegram and go to **@BotFather**
2. Send `/mybots`
3. Select your bot
4. Click **"Bot Settings"** → **"Menu Button"**
5. Set the URL to your Vercel frontend URL: `https://tonpay-africa.vercel.app`
6. Click **"Done"**

#### Step 4: Update TON Connect Manifest (5 minutes)

1. Edit `public/tonconnect-manifest.json` in your project
2. Update the `url` to your Vercel URL:
   ```json
   {
     "url": "https://tonpay-africa.vercel.app",
     "name": "TONPay Africa",
     "iconUrl": "https://tonpay-africa.vercel.app/icon.png"
   }
   ```
3. Commit and push:
   ```bash
   git add public/tonconnect-manifest.json
   git commit -m "Update manifest for production"
   git push origin main
   ```
4. Vercel will automatically redeploy with the new manifest!

#### Step 5: Update Backend CORS (5 minutes)

1. Edit `server/middleware/security.js`
2. Add your Vercel URL to the allowed origins (or use `FRONTEND_URL` env var)
3. Commit and push - Railway will auto-deploy!

---

## ✅ Test Your Deployment

1. **Test Backend:**
   - Visit: `https://your-railway-url.up.railway.app/health`
   - Should return: `{"status":"healthy","database":"connected"}`

2. **Test Frontend:**
   - Visit: `https://tonpay-africa.vercel.app`
   - Try logging in/registering
   - Check browser console for errors

3. **Test Telegram:**
   - Open your Telegram bot
   - Click the menu button
   - The app should load!

---

## 🔄 Making Updates

### Update Backend:
```bash
git push origin main
# Railway automatically redeploys!
```

### Update Frontend:
```bash
git push origin main
# Vercel automatically redeploys!
```

---

## 🆘 Troubleshooting

### Backend Issues:

**Problem:** Backend not starting
- Check Railway logs: Go to Railway dashboard → Your service → Logs
- Verify all environment variables are set correctly
- Check MongoDB connection string

**Problem:** CORS errors
- Make sure `FRONTEND_URL` in Railway matches your Vercel URL
- Check that CORS middleware is allowing your frontend domain

### Frontend Issues:

**Problem:** Frontend can't connect to backend
- Verify `VITE_API_URL` in Vercel matches your Railway backend URL
- Check browser console for specific error messages
- Make sure backend is running (check Railway logs)

**Problem:** API calls failing
- Check that `VITE_API_URL` doesn't have a trailing slash
- Verify CORS is configured correctly on backend

### Database Issues:

**Problem:** MongoDB connection failed
- Verify MongoDB Atlas connection string
- Check that your IP is whitelisted (or use `0.0.0.0/0` for Railway)
- Make sure database user has correct permissions

---

## 💰 Cost Estimate

### Free Tier (Perfect for Demo):
- **Railway:** $5 free credit/month (enough for demo)
- **Vercel:** Free forever for personal projects
- **MongoDB Atlas:** Free tier (512MB storage)
- **Total: $0/month** (for demo/testing)

### Production (When you go live):
- **Railway:** ~$5-20/month (based on usage)
- **Vercel:** Free (or $20/month for Pro)
- **MongoDB Atlas:** $9/month (M10 cluster)
- **Total: ~$15-50/month**

---

## 🎯 Alternative: Render (Similar to Railway)

If you prefer Render over Railway:

1. Go to https://render.com
2. Sign up with GitHub
3. New → Web Service
4. Connect your repository
5. Settings:
   - **Name:** tonpay-backend
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
6. Add environment variables (same as Railway)
7. Deploy!

---

## 🔐 Security Checklist

Before going live with real users:

- [ ] Change all default secrets (JWT_SECRET, etc.)
- [ ] Use production Paystack keys (not test keys)
- [ ] Enable Paystack webhook signature verification
- [ ] Set up monitoring (Uptime Robot - free)
- [ ] Enable database backups
- [ ] Review CORS settings
- [ ] Test all payment flows with small amounts first

---

## 📊 Monitoring Setup (Free)

1. **Uptime Robot:**
   - Go to https://uptimerobot.com
   - Add monitor for backend: `https://your-railway-url/health`
   - Add monitor for frontend: `https://your-vercel-url`
   - Get email alerts if services go down

2. **Railway Logs:**
   - Railway dashboard shows real-time logs
   - Check regularly for errors

3. **Vercel Analytics:**
   - Free analytics in Vercel dashboard
   - See visitor stats and performance

---

## 🎉 You're Done!

Your app is now live and accessible to anyone, anywhere, without your laptop running!

**Frontend:** `https://tonpay-africa.vercel.app`  
**Backend:** `https://your-app.up.railway.app`

---

## 📝 Next Steps

1. **Custom Domain (Optional):**
   - Add custom domain in Vercel settings
   - Add custom domain in Railway settings
   - Update Telegram bot URL
   - Update TON Connect manifest

2. **SSL Certificates:**
   - Automatically handled by Vercel and Railway!
   - No action needed

3. **Scaling:**
   - Railway auto-scales based on traffic
   - Vercel handles CDN automatically
   - Upgrade MongoDB Atlas when needed

---

**Need Help?** Check the logs in Railway and Vercel dashboards - they're very helpful!

