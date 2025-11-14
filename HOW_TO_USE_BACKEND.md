# 🚀 How to Use Your Backend - Step by Step Guide

## 📋 Quick Start

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd server
npm run dev
```

**What happens:**
- Server starts on `http://localhost:5000`
- Connects to MongoDB Atlas
- Shows connection status in console
- Watches for file changes (auto-restarts on save)

**Expected output:**
```
🔌 Attempting to connect to MongoDB...
📍 URI: mongodb+srv://lakanoladusi_db_user:****@cluster0.vr0unwy.mongodb.net/tonpay-africa
✅ MongoDB connected successfully!
📊 Database: tonpay-africa
🌐 Host: ac-gfe9ut8-shard-00-01.vr0unwy.mongodb.net
✅ Server running on port 5000
📱 Environment: development
🔒 Security middleware enabled
⚡ Rate limiting active
```

### Step 2: Start the Frontend (in another terminal)

```bash
npm run dev
```

**What happens:**
- Frontend starts on `http://localhost:5173`
- Vite proxy forwards `/api/*` requests to backend (`http://localhost:5000`)
- Your React app loads in browser

---

## 🔌 How Frontend Connects to Backend

### Automatic Proxy Setup

Your `vite.config.js` has a proxy configured:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

**This means:**
- Frontend makes request to: `http://localhost:5173/api/auth/login`
- Vite automatically forwards to: `http://localhost:5000/api/auth/login`
- No CORS issues! ✅

### Example: Frontend API Call

```javascript
// In your React component
import axios from 'axios';

// This request goes to: http://localhost:5000/api/auth/login
const response = await axios.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
```

---

## 🧪 Testing the Backend

### Method 1: Using Your Frontend App

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

2. **Open browser:** `http://localhost:5173`

3. **Use your app:**
   - Register/Login
   - Buy airtime
   - Check balance
   - All API calls go through automatically!

### Method 2: Using Postman or Browser

Test endpoints directly:

#### Test 1: Health Check
```bash
# Open in browser or use curl
http://localhost:5000/api/rate
```

#### Test 2: Register User
```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Test 3: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "role": "user"
  }
}
```

#### Test 4: Get User Profile (with token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 📡 Common API Calls from Frontend

### 1. User Registration

```javascript
// In your React component
const register = async () => {
  try {
    const response = await axios.post('/api/auth/register', {
      email: 'user@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });
    
    // Save tokens
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    
    console.log('Registered!', response.data);
  } catch (error) {
    console.error('Registration failed:', error.response.data);
  }
};
```

### 2. User Login

```javascript
const login = async () => {
  try {
    const response = await axios.post('/api/auth/login', {
      email: 'user@example.com',
      password: 'password123'
    });
    
    // Save tokens
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    alert('Login failed: ' + error.response.data.error);
  }
};
```

### 3. Authenticated Request (with token)

```javascript
// Create axios instance with token
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});

// Use it for authenticated requests
const getProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    console.log('User profile:', response.data.user);
  } catch (error) {
    if (error.response.status === 401) {
      // Token expired, refresh it
      await refreshToken();
    }
  }
};
```

### 4. Buy Airtime

```javascript
const buyAirtime = async () => {
  try {
    const response = await axios.post('/api/payments/airtime', {
      network: 'MTN',
      phone: '08012345678',
      amountTON: 1,
      amountNGN: 2000,
      rate: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    console.log('Airtime purchased!', response.data);
  } catch (error) {
    console.error('Failed:', error.response.data);
  }
};
```

### 5. Get Banks List

```javascript
const getBanks = async () => {
  try {
    const response = await axios.get('/api/payments/banks');
    console.log('Banks:', response.data.banks);
  } catch (error) {
    console.error('Failed to fetch banks');
  }
};
```

---

## 🔧 Setting Up Environment Variables

Before using the backend, make sure your `server/.env` file has:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (already set)
MONGODB_URI=mongodb+srv://lakanoladusi_db_user:dL5EmrruBNKoFUpm@cluster0.vr0unwy.mongodb.net/tonpay-africa

# JWT Secrets (generate random strings)
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this

# Paystack (get from paystack.com)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# VTPass (get from vtpass.com)
VTPASS_API_KEY=your-vtpass-api-key
VTPASS_PUBLIC_KEY=your-vtpass-public-key

# TON (optional, for blockchain features)
TONAPI_KEY=your-tonapi-key
TONCENTER_API_KEY=your-toncenter-key
```

**To generate JWT secrets:**
```bash
# In Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎯 Typical Workflow

### Development Workflow

1. **Start Backend:**
   ```bash
   cd server
   npm run dev
   ```
   - Keep this terminal open
   - Watch for errors in console
   - Server auto-restarts on file changes

2. **Start Frontend:**
   ```bash
   npm run dev
   ```
   - Opens in browser automatically
   - Hot reload on file changes

3. **Make Changes:**
   - Edit backend files → Server restarts automatically
   - Edit frontend files → Browser refreshes automatically

4. **Test:**
   - Use your app in browser
   - Check backend console for logs
   - Check browser console for errors

### Production Workflow

1. **Build Frontend:**
   ```bash
   npm run build
   ```

2. **Start Backend (production):**
   ```bash
   cd server
   NODE_ENV=production npm start
   ```

3. **Deploy:**
   - Backend: Deploy to Heroku, Railway, or VPS
   - Frontend: Deploy to Vercel, Netlify, or static hosting
   - Update `FRONTEND_URL` in backend `.env`

---

## 🐛 Troubleshooting

### Backend won't start

**Error: Port 5000 already in use**
```bash
# Find and kill process
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill
```

**Error: MongoDB connection failed**
- Check your `.env` file has correct `MONGODB_URI`
- Verify MongoDB Atlas IP whitelist
- Check internet connection

### Frontend can't connect to backend

**Error: Network Error / CORS Error**
- Make sure backend is running on port 5000
- Check `vite.config.js` proxy settings
- Verify backend CORS allows `http://localhost:5173`

**Error: 404 Not Found**
- Check the API endpoint path is correct
- Verify route exists in `server/routes/`
- Check backend console for route registration

### Authentication not working

**Error: Invalid token**
- Token might be expired (1 hour lifetime)
- Use refresh token to get new access token
- Check token is being sent in `Authorization` header

**Error: No token provided**
- Make sure you're sending token:
  ```javascript
  headers: {
    'Authorization': `Bearer ${token}`
  }
  ```

---

## 📊 Monitoring Your Backend

### Check Server Logs

Backend logs all requests:
```
✅ POST /api/auth/login 200 45ms
✅ GET /api/user/profile 200 12ms
❌ POST /api/payments/airtime 401 8ms
```

### Check Database

View data in MongoDB Atlas:
1. Go to https://cloud.mongodb.com/
2. Click "Browse Collections"
3. See your `users`, `transactions`, etc.

### Test Endpoints

Use browser DevTools Network tab:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make API request from your app
4. See request/response details

---

## 🎓 Next Steps

1. **Test all endpoints** using your frontend
2. **Add more features** as needed
3. **Set up webhooks** for Paystack (production)
4. **Add error tracking** (Sentry, etc.)
5. **Set up monitoring** (PM2, etc.)

---

## 💡 Pro Tips

1. **Keep backend running** while developing frontend
2. **Check backend console** for errors
3. **Use Postman** to test APIs independently
4. **Save tokens** in localStorage for persistence
5. **Handle token refresh** automatically
6. **Log errors** for debugging

---

Your backend is ready to use! 🎉


