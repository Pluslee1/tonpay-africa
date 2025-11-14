# 🚀 Deployment Setup Summary

I've prepared your TonPay Africa application for production deployment! Here's what was done and how to use it.

---

## ✅ What Was Done

### 1. **Created Deployment Guides**
   - `DEPLOY_TO_PRODUCTION.md` - Comprehensive deployment guide
   - `QUICK_DEPLOY_CHECKLIST.md` - Step-by-step checklist

### 2. **Updated Configuration Files**
   - **`vite.config.js`** - Now supports production API URLs via `VITE_API_URL` environment variable
   - **`server/middleware/security.js`** - Updated CORS to allow Vercel, Railway, Render, and Netlify domains
   - **`src/config/axios.js`** - New axios configuration that automatically uses the correct API URL
   - **`src/main.jsx`** - Updated to initialize axios configuration

### 3. **Created Deployment Config Files**
   - **`railway.json`** - Railway deployment configuration
   - **`render.yaml`** - Render deployment configuration  
   - **`vercel.json`** - Vercel deployment configuration

### 4. **Created Environment Variable Templates**
   - **`server/.env.example`** - Backend environment variables template
   - **`.env.example`** - Frontend environment variables template

---

## 🎯 Quick Start (Choose One)

### Option 1: Railway + Vercel (Recommended - Easiest)

**Backend → Railway:**
1. Go to https://railway.app
2. Deploy from GitHub
3. Set root directory: `server`
4. Add environment variables (see `server/.env.example`)
5. Deploy!

**Frontend → Vercel:**
1. Go to https://vercel.com
2. Import from GitHub
3. Add environment variable: `VITE_API_URL=https://your-railway-url`
4. Deploy!

**Total Time: ~30 minutes**

---

### Option 2: Render + Netlify

**Backend → Render:**
1. Go to https://render.com
2. New Web Service
3. Connect GitHub
4. Use `render.yaml` config
5. Add environment variables
6. Deploy!

**Frontend → Netlify:**
1. Go to https://netlify.com
2. Import from GitHub
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL`
6. Deploy!

---

## 📝 Key Changes Explained

### Frontend API Configuration

The frontend now automatically detects the API URL:

- **Development:** Uses relative paths (`/api/...`) which work with Vite proxy
- **Production:** Uses `VITE_API_URL` environment variable if set

**How it works:**
- `src/config/axios.js` sets `axios.defaults.baseURL` from `VITE_API_URL`
- All API calls automatically use the correct URL
- No code changes needed in your components!

### Backend CORS Configuration

The backend now allows requests from:
- Localhost (development)
- ngrok domains (testing)
- Vercel deployments (`*.vercel.app`)
- Railway deployments (`*.railway.app`)
- Render deployments (`*.render.com`)
- Netlify deployments (`*.netlify.app`)
- Custom domain (via `FRONTEND_URL` environment variable)

---

## 🔧 Environment Variables

### Backend (Railway/Render)

Copy from `server/.env.example` and set in your hosting platform:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
VTPASS_API_KEY=...
VTPASS_PUBLIC_KEY=...
TELEGRAM_BOT_TOKEN=...
JWT_SECRET=generate_random_32_char_string
JWT_REFRESH_SECRET=generate_random_32_char_string
FRONTEND_URL=https://your-frontend.vercel.app
ENABLE_AUTO_PROCESSING=true
```

### Frontend (Vercel/Netlify)

Set in your hosting platform:

```env
VITE_API_URL=https://your-backend.up.railway.app
```

**Important:** No trailing slash!

---

## 🧪 Testing Your Deployment

### 1. Test Backend
```bash
curl https://your-backend-url/health
# Should return: {"status":"healthy","database":"connected"}
```

### 2. Test Frontend
- Visit your frontend URL
- Open browser console (F12)
- Check for any errors
- Try logging in/registering

### 3. Test Telegram
- Open your Telegram bot
- Click menu button
- App should load!

---

## 🔄 Making Updates

### Update Backend:
```bash
git add .
git commit -m "Your changes"
git push origin main
# Railway/Render auto-deploys!
```

### Update Frontend:
```bash
git add .
git commit -m "Your changes"
git push origin main
# Vercel/Netlify auto-deploys!
```

---

## 🆘 Troubleshooting

### Backend Issues

**Problem:** Backend not starting
- **Solution:** Check logs in Railway/Render dashboard
- Verify all environment variables are set
- Check MongoDB connection string

**Problem:** CORS errors
- **Solution:** Make sure `FRONTEND_URL` in backend matches your frontend URL exactly
- Check that frontend URL is in allowed origins

### Frontend Issues

**Problem:** Can't connect to backend
- **Solution:** Verify `VITE_API_URL` is set correctly (no trailing slash)
- Check browser console for specific errors
- Make sure backend is running

**Problem:** API calls failing
- **Solution:** Check that `VITE_API_URL` matches your backend URL
- Verify CORS is configured correctly
- Check network tab in browser dev tools

---

## 📊 Monitoring

### Free Monitoring Options:

1. **Uptime Robot** (https://uptimerobot.com)
   - Monitor backend: `https://your-backend/health`
   - Monitor frontend: `https://your-frontend`
   - Get email alerts

2. **Railway Logs**
   - Real-time logs in Railway dashboard
   - Check regularly for errors

3. **Vercel Analytics**
   - Free analytics in Vercel dashboard
   - See visitor stats

---

## 💰 Cost Estimate

### Free Tier (Perfect for Demo):
- **Railway:** $5 free credit/month
- **Vercel:** Free forever
- **MongoDB Atlas:** Free tier (512MB)
- **Total: $0/month**

### Production:
- **Railway:** $5-20/month
- **Vercel:** Free (or $20/month Pro)
- **MongoDB Atlas:** $9/month
- **Total: ~$15-50/month**

---

## 🎯 Next Steps

1. **Follow the checklist:** `QUICK_DEPLOY_CHECKLIST.md`
2. **Read detailed guide:** `DEPLOY_TO_PRODUCTION.md`
3. **Deploy backend first** (Railway/Render)
4. **Deploy frontend second** (Vercel/Netlify)
5. **Update Telegram bot** with frontend URL
6. **Test everything!**

---

## 📚 Files Created/Modified

### New Files:
- `DEPLOY_TO_PRODUCTION.md` - Full deployment guide
- `QUICK_DEPLOY_CHECKLIST.md` - Step-by-step checklist
- `DEPLOYMENT_SUMMARY.md` - This file
- `src/config/axios.js` - Axios configuration
- `railway.json` - Railway config
- `render.yaml` - Render config
- `vercel.json` - Vercel config
- `server/.env.example` - Backend env template
- `.env.example` - Frontend env template

### Modified Files:
- `vite.config.js` - Added production API URL support
- `server/middleware/security.js` - Updated CORS for production
- `src/main.jsx` - Added axios config import

---

## ✅ You're Ready!

Your app is now configured for production deployment. Follow the checklist and you'll be live in 30 minutes!

**Questions?** Check the detailed guides or the troubleshooting sections.

**Good luck with your deployment! 🚀**

