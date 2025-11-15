# 🔧 Fix Render Status 143 Error

**Error:** "Exited with status 143"

Status 143 means the build process was terminated, usually due to:
- **Memory limits** (free tier has limits)
- **Build timeout** (build taking too long)
- **Resource constraints**

---

## ✅ Solution 1: Optimize Build Command

I've updated `render.yaml` to use `npm ci --only=production` which:
- Installs faster
- Uses less memory
- Only installs production dependencies

**Next steps:**
1. The updated `render.yaml` is ready
2. Commit and push (I'll do this)
3. Render will use the optimized build

---

## ✅ Solution 2: Check Render Settings

In Render Dashboard → Your Service → Settings:

1. **Root Directory:** `server` ✅
2. **Build Command:** `npm ci --only=production` (or `npm install`)
3. **Start Command:** `npm start`
4. **Node Version:** `20` (or latest)
5. **Plan:** Free tier has memory limits

---

## ✅ Solution 3: Remove PORT Variable

Render auto-assigns ports. If you have `PORT=5000` in environment variables:

1. Go to **Environment** tab
2. **Delete** the `PORT` variable
3. Render will auto-assign a port
4. Your code uses `process.env.PORT || 5000` so it will work

---

## ✅ Solution 4: Upgrade Plan (If Needed)

If free tier keeps failing:
- **Starter Plan:** $7/month (more memory, faster builds)
- Or try deploying at off-peak times

---

## 🔄 After Fixing

1. **Commit the updated render.yaml** (I'll do this)
2. **Go to Render** → Manual Deploy → Deploy latest commit
3. **Watch the logs** - should work now!

---

## 📝 Quick Checklist

- [x] Updated render.yaml with optimized build
- [ ] Remove PORT from environment variables
- [ ] Verify Root Directory = `server`
- [ ] Manual redeploy
- [ ] Check logs

---

**I'll commit the fix now, then you can redeploy!** 🚀

