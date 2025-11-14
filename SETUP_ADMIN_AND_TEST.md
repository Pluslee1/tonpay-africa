# 🚀 Setup Admin User & Test Monitoring - Step by Step

## Step 1: Create Admin User

### Option A: Using Script (Easiest)

```bash
cd server
node scripts/create-admin.js your-email@example.com your-password
```

**Example:**
```bash
node scripts/create-admin.js admin@tonpay.com admin123456
```

**What it does:**
- Creates a new admin user OR updates existing user to admin
- Sets up the account with admin privileges
- Shows you the user details

### Option B: Manual (Via API)

1. **Register a user first:**
```bash
POST http://localhost:5000/api/auth/register
Body: {
  "email": "admin@tonpay.com",
  "password": "admin123456",
  "firstName": "Admin",
  "lastName": "User"
}
```

2. **Then update to admin in MongoDB:**
   - Go to MongoDB Atlas
   - Find the user
   - Change `role` from `"user"` to `"admin"`

---

## Step 2: Login to Get Admin Token

```bash
POST http://localhost:5000/api/auth/login
Body: {
  "email": "admin@tonpay.com",
  "password": "admin123456"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": { ... }
}
```

**Save the `accessToken`** - you'll need it for admin endpoints!

---

## Step 3: Test Monitoring Endpoints

### Option A: Using Test Script

```bash
cd server
node scripts/test-monitoring.js YOUR_ACCESS_TOKEN
```

**Example:**
```bash
node scripts/test-monitoring.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

This will test all monitoring endpoints and show you the results!

### Option B: Manual Testing

#### 1. Test Health Check (No Auth Needed)
```bash
GET http://localhost:5000/health
```

#### 2. Test Admin Stats
```bash
GET http://localhost:5000/api/admin/stats
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### 3. Test Transactions
```bash
GET http://localhost:5000/api/admin/transactions?limit=10
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### 4. Test Users
```bash
GET http://localhost:5000/api/admin/users?limit=10
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 🎯 Quick Start (Copy & Paste)

### 1. Create Admin User
```bash
cd server
node scripts/create-admin.js admin@tonpay.com admin123456
```

### 2. Login (Use Postman, Thunder Client, or curl)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tonpay.com","password":"admin123456"}'
```

### 3. Copy the accessToken from response

### 4. Test Monitoring
```bash
cd server
node scripts/test-monitoring.js YOUR_ACCESS_TOKEN_HERE
```

---

## 📊 What You'll See

When you test monitoring, you'll see:

✅ **Server Health:**
- Status: healthy
- Uptime: how long server has been running
- Memory usage
- Database connection status

✅ **User Stats:**
- Total users
- Active users today
- New users today
- Verified users

✅ **Transaction Stats:**
- Total transactions
- Today's transactions
- Success rate
- Revenue (TON & NGN)

✅ **Performance:**
- Average transactions per day
- Average revenue per day

---

## 🔧 Troubleshooting

### "Access denied" or 403 Error
- Make sure your user has `role: "admin"` in database
- Re-run the create-admin script

### "Invalid token" or 401 Error
- Token might be expired (1 hour lifetime)
- Login again to get new token

### "Route not found" or 404 Error
- Make sure server is running
- Check the endpoint URL is correct

### Script doesn't work
- Make sure you're in the `server` directory
- Make sure MongoDB is connected
- Check your `.env` file has correct `MONGODB_URI`

---

## ✅ Success Checklist

- [ ] Admin user created
- [ ] Admin token obtained
- [ ] Health check works
- [ ] Admin stats endpoint works
- [ ] Can see real-time data

**Once all checked, you're ready to monitor your app!** 🎉

---

## 🎓 Next Steps

1. **Set up Uptime Robot** to monitor `/health` endpoint
2. **Bookmark** the admin stats endpoint
3. **Check daily** for monitoring
4. **Set up alerts** for critical issues

See `MONITORING_GUIDE.md` for full monitoring setup!


