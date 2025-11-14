# 🚀 Quick Backend Setup for Telegram

## Step-by-Step Instructions

### 1️⃣ Start Your Backend

```bash
cd server
npm start
```

✅ Backend should be running on `http://localhost:5000`

---

### 2️⃣ Start ngrok for Backend

**Open a NEW terminal window** and run:

```bash
ngrok http 5000
```

You'll see something like:
```
Forwarding  https://xyz789.ngrok-free.app -> http://localhost:5000
```

**📋 Copy the HTTPS URL** (the one starting with `https://`)

---

### 3️⃣ Update Frontend Proxy

Edit `vite.config.js` and replace the proxy target:

**Find this:**
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

**Replace with:**
```javascript
proxy: {
  '/api': {
    target: 'https://YOUR-BACKEND-NGROK-URL.ngrok-free.app', // Paste your backend ngrok URL here
    changeOrigin: true,
    secure: true
  }
}
```

**Example:**
```javascript
proxy: {
  '/api': {
    target: 'https://xyz789.ngrok-free.app',
    changeOrigin: true,
    secure: true
  }
}
```

---

### 4️⃣ Restart Frontend

Stop your frontend (Ctrl+C) and restart:

```bash
npm run dev
```

---

### 5️⃣ Test It

1. Open your frontend ngrok URL in browser
2. Open browser console (F12)
3. Check if API calls work (try fetching rate or connecting wallet)
4. In Network tab, verify requests go to your backend ngrok URL

---

## ✅ You're Done!

Now your setup is:
- **Frontend ngrok:** `https://abc123.ngrok-free.app` (port 5173)
- **Backend ngrok:** `https://xyz789.ngrok-free.app` (port 5000)
- **Frontend proxy:** Points to backend ngrok URL
- **CORS:** Allows all ngrok URLs

Your Telegram Mini App can now access the backend! 🎉

---

## 🔄 When ngrok URLs Change

If you restart ngrok, you'll get a new URL. Just:
1. Copy the new backend ngrok URL
2. Update `vite.config.js` proxy target
3. Restart frontend: `npm run dev`

---

## 📝 Quick Reference

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd server
npm start
```

**Terminal 3 - Frontend ngrok:**
```bash
ngrok http 5173
```

**Terminal 4 - Backend ngrok:**
```bash
ngrok http 5000
```

---

## 🐛 Troubleshooting

**CORS Error?**
- Backend CORS is already updated to allow ngrok URLs
- Make sure backend is running
- Check backend ngrok URL is correct

**API Calls Fail?**
- Verify backend ngrok is running
- Check `vite.config.js` proxy target is updated
- Restart frontend after updating proxy

**Still Not Working?**
- Test backend directly: `https://your-backend-ngrok-url.ngrok-free.app/health`
- Should return: `{"status":"healthy",...}`
- If this works, the issue is with the proxy configuration

