# 🚀 Quick Next Steps - Deploy Frontend

Your backend is live: **https://tonpay-africa.onrender.com**

---

## ✅ Step 1: Test Backend (30 seconds)

Open in browser: **https://tonpay-africa.onrender.com/health**

Should show: `{"status":"healthy"}`

---

## 🎨 Step 2: Deploy Frontend to Vercel (5 minutes)

### Quick Steps:

1. **Go to:** https://vercel.com
2. **Sign up/Login** with GitHub
3. **"Add New Project"**
4. **Import** `tonpay-africa` repository
5. **Configure:**
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Environment Variables:**
   - Click **"Environment Variables"**
   - Add: `VITE_API_URL` = `https://tonpay-africa.onrender.com`
   - ⚠️ No trailing slash!
7. **Click "Deploy"**
8. **Wait 2-3 minutes**
9. **Copy your Vercel URL** (e.g., `https://tonpay-africa.vercel.app`)

---

## 📱 Step 3: Update Telegram Bot (1 minute)

1. Open Telegram → **@BotFather**
2. `/mybots` → Select your bot
3. **Bot Settings** → **Menu Button**
4. Set URL to your **Vercel URL**
5. **Done**

---

## 🔧 Step 4: Update TON Connect Manifest

I'll update this for you now!

---

## ✅ Step 5: Update Backend CORS

1. **Render Dashboard** → Your Service → **Environment**
2. Add/Update: `FRONTEND_URL` = `https://your-vercel-url.vercel.app`
3. Render auto-redeploys!

---

## 🎉 Done!

Test your app:
- Visit Vercel URL
- Open Telegram bot
- Everything should work!

---

**Ready? Let's deploy the frontend!** 🚀

