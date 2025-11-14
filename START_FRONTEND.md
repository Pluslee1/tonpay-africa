# 🚀 How to Start Frontend Server

## Quick Start

### Step 1: Navigate to Project Root
```bash
cd C:\Users\lakan\Desktop\tonpay-africa
```

### Step 2: Start Frontend
```bash
npm run dev
```

### Step 3: Open in Browser
The frontend will be available at:
```
http://localhost:5173
```

---

## Full Instructions

### Prerequisites
- Node.js installed (v18+)
- npm installed
- Dependencies installed (`npm install`)

### Start Commands

**Development Server:**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
```

**Preview Production Build:**
```bash
npm run preview
```

---

## Running Both Frontend and Backend

### Option 1: Two Terminal Windows

**Terminal 1 (Backend):**
```bash
cd C:\Users\lakan\Desktop\tonpay-africa\server
npm start
```

**Terminal 2 (Frontend):**
```bash
cd C:\Users\lakan\Desktop\tonpay-africa
npm run dev
```

### Option 2: One Terminal (Background)

**Start Backend:**
```bash
cd C:\Users\lakan\Desktop\tonpay-africa\server
npm start
```

**Then in another terminal, start Frontend:**
```bash
cd C:\Users\lakan\Desktop\tonpay-africa
npm run dev
```

---

## Default Ports

- **Frontend:** `http://localhost:5173` (Vite default)
- **Backend:** `http://localhost:5000` (from server/.env or default)

---

## Troubleshooting

### Port Already in Use
If port 5173 is taken:
```bash
# Vite will automatically try the next port (5174, 5175, etc.)
# Or specify a port:
npm run dev -- --port 3000
```

### Dependencies Not Installed
```bash
npm install
```

### Frontend Can't Connect to Backend
- Make sure backend is running on port 5000
- Check `vite.config.js` proxy settings
- Verify backend is accessible at `http://localhost:5000/health`

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm install` | Install dependencies |

---

**That's it! Your frontend should be running on http://localhost:5173** 🎉

