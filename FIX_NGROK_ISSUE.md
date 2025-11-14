# 🔧 Fix ngrok "Already Online" Error

## ✅ Solution: Stop Existing ngrok & Start Fresh

### Option 1: Stop All ngrok Processes (Recommended)

**Windows PowerShell:**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*ngrok*"} | Stop-Process -Force
```

**Or manually:**
1. Open Task Manager (Ctrl+Shift+Esc)
2. Find "ngrok" process
3. End task

### Option 2: Use Different Port

If you want to keep the existing tunnel, use a different port:

```bash
# Start frontend on different port
npm run dev -- --port 5174

# Then ngrok on that port
ngrok http 5174
```

### Option 3: Use ngrok with Pooling

```bash
ngrok http 5173 --pooling-enabled
```

---

## 🚀 Quick Fix Steps

### Step 1: Stop Existing ngrok

**PowerShell:**
```powershell
Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Or find and kill manually:**
- Open Task Manager
- Look for "ngrok.exe"
- End task

### Step 2: Start Fresh ngrok

```bash
ngrok http 5173
```

**You'll get a NEW URL** (different from the old one)

### Step 3: Update Manifest

Update `public/tonconnect-manifest.json` with the NEW ngrok URL:

```json
{
  "url": "https://NEW-NGROK-URL.ngrok-free.app",
  "name": "TONPay Africa",
  "iconUrl": "https://NEW-NGROK-URL.ngrok-free.app/icon.png"
}
```

### Step 4: Update Telegram Bot

1. Open Telegram → `@BotFather`
2. Run `/myapps`
3. Select your bot
4. Edit Mini App
5. Update Web App URL with NEW ngrok URL

---

## 💡 Pro Tip: Use ngrok Config File

Create `ngrok.yml` in your project root:

```yaml
version: "2"
authtoken: YOUR_NGROK_AUTH_TOKEN
tunnels:
  frontend:
    addr: 5173
    proto: http
  backend:
    addr: 5000
    proto: http
```

Then run:
```bash
ngrok start frontend
```

This gives you a consistent setup!

---

## ✅ After Fixing

1. ✅ ngrok running with new URL
2. ✅ Manifest updated
3. ✅ Telegram bot updated
4. ✅ Test in Telegram!

---

**The issue is resolved!** Now you can start ngrok fresh and get a new URL. 🎉


