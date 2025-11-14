# Quick Start - Fix "Page Can't Be Found" Error

## Issue Fixed
- Moved `index.html` from `src/` to root directory (Vite requirement)
- Updated script path to `/src/main.jsx`

## Steps to Run

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Start Backend (Terminal 1)
```bash
cd server
npm run dev
```
Wait for: "Server running on port 5000"

### 3. Start Frontend (Terminal 2)
```bash
npm run dev
```
Wait for: "Local: http://localhost:5173"

### 4. Open Browser
Go to: `http://localhost:5173`

## If Still Not Working

1. **Check if ports are in use:**
   - Port 5173 (frontend)
   - Port 5000 (backend)

2. **Kill existing processes:**
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :5173
   netstat -ano | findstr :5000
   # Then kill the PID shown
   ```

3. **Clear cache and restart:**
   ```bash
   rm -rf node_modules
   npm install
   npm run dev
   ```

4. **Check browser console** for errors

## Expected Result
- Page loads at `http://localhost:5173`
- Shows "TONPay Africa" header
- "Connect Wallet" button visible
- Navigation tabs at bottom






