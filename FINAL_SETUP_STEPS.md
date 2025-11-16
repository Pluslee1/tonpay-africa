# 🎉 Final Setup Steps

Your Vercel deployment is ready! Let's complete the setup.

---

## Step 1: Get Your Vercel URL

From your Vercel dashboard, find your **public URL**. It should look like:
- `https://tonpay-africa.vercel.app`
- Or `https://tonpay-africa-[hash].vercel.app`

**Where to find it:**
1. Go to your Vercel project dashboard
2. Look at the top - there's a "Visit" button or URL
3. Or check the "Domains" section

---

## Step 2: Update TON Connect Manifest

Once you have your Vercel URL, I'll update the manifest file.

---

## Step 3: Update Backend CORS

1. Go to **Render Dashboard** → Your Service → **Environment**
2. Add/Update: `FRONTEND_URL` = `https://your-vercel-url.vercel.app`
3. Render will auto-redeploy!

---

## Step 4: Update Telegram Bot

1. Open Telegram → **@BotFather**
2. `/mybots` → Select your bot
3. **Bot Settings** → **Menu Button**
4. Set URL to your **Vercel URL**
5. **Done**

---

## Step 5: Test Everything

1. Visit your Vercel URL
2. Open Telegram bot
3. Test features!

---

**Share your Vercel public URL and I'll update everything!** 🚀

