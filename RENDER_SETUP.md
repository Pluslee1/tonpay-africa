# 🚀 Deploy to Render (EASIEST Option!)

Render is **much easier** than Railway - here's the step-by-step guide.

---

## Step 1: Sign Up (1 minute)

1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest)
4. Authorize Render to access your repositories

---

## Step 2: Create Web Service (2 minutes)

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Click **"Connect account"** if you haven't already
4. Select your **GitHub account**
5. Find and select **`tonpay-africa`** repository
6. Click **"Connect"**

---

## Step 3: Configure Service (2 minutes)

Fill in the form:

### Basic Settings:
- **Name:** `tonpay-backend` (or any name you like)
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main` (or `master`)

### Build & Deploy:
- **Root Directory:** `server` ← **THIS IS THE KEY!** Just type `server`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Plan:
- Select **"Free"** plan (perfect for demo)

---

## Step 4: Add Environment Variables (3 minutes)

Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"** for each:

```
NODE_ENV = production
PORT = 5000
MONGODB_URI = your_mongodb_atlas_connection_string
PAYSTACK_SECRET_KEY = sk_live_your_key
PAYSTACK_PUBLIC_KEY = pk_live_your_key
VTPASS_API_KEY = your_vtpass_key
VTPASS_PUBLIC_KEY = your_vtpass_public_key
TELEGRAM_BOT_TOKEN = your_telegram_bot_token
JWT_SECRET = generate_random_32_char_string
JWT_REFRESH_SECRET = generate_another_random_32_char_string
FRONTEND_URL = https://your-frontend.vercel.app
ENABLE_AUTO_PROCESSING = true
```

**Tip:** You can add `FRONTEND_URL` later after you deploy frontend.

---

## Step 5: Deploy! (2 minutes)

1. Scroll to bottom
2. Click **"Create Web Service"**
3. Render will start building immediately!
4. Watch the logs - it should work!

---

## ✅ Success!

After deployment (usually 2-3 minutes):

1. **Copy your Render URL:** `https://tonpay-backend.onrender.com`
2. **Test it:** Visit `https://tonpay-backend.onrender.com/health`
3. **Should return:** `{"status":"healthy"}`

---

## 🔄 Making Updates

Just push to GitHub:
```bash
git push origin main
```

Render **automatically redeploys**! No manual steps needed!

---

## 🎯 Why Render is Better Than Railway

| Feature | Railway | Render |
|---------|---------|--------|
| Root Directory | ❌ Hard to find | ✅ Right in the form! |
| Setup Time | 30+ minutes | 5 minutes |
| Free Tier | ⚠️ Limited | ✅ Good |
| Auto-deploy | ✅ Yes | ✅ Yes |
| Ease of Use | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🆘 Troubleshooting

### Issue: Build fails
- **Check:** Root Directory is set to `server`
- **Check:** Build Command is `npm install`
- **Check:** Start Command is `npm start`

### Issue: Can't connect to database
- **Check:** MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- **Check:** MONGODB_URI is correct

### Issue: Service goes to sleep (Free tier)
- **Solution:** First request after sleep takes ~30 seconds
- **Solution:** Upgrade to paid plan ($7/month) for always-on

---

## 💰 Pricing

- **Free:** Perfect for demos (spins down after 15 min inactivity)
- **Starter:** $7/month (always on, no sleep)

---

## 🎉 Next Steps

1. ✅ Backend deployed to Render
2. Deploy frontend to Vercel (as before)
3. Update `VITE_API_URL` in Vercel to your Render URL
4. Update Telegram bot with Vercel URL
5. Done!

---

**Render is SO much easier than Railway!** Give it a try! 🚀

