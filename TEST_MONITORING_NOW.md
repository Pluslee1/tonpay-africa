# ✅ Admin User Created Successfully!

## 🎉 What Just Happened

Your admin user has been created:
- **Email:** admin@tonpay.com
- **Password:** admin123456
- **Role:** admin
- **ID:** 69151ec89658aadea6ae5ab4

---

## 🚀 Next Steps to Test Monitoring

### Step 1: Make Sure Server is Running

Open a terminal and run:
```bash
cd server
npm run dev
```

You should see:
```
✅ Server running on port 5000
✅ MongoDB connected successfully!
```

### Step 2: Login to Get Admin Token

**Option A: Using Postman/Thunder Client**

1. Create new request:
   - **Method:** POST
   - **URL:** `http://localhost:5000/api/auth/login`
   - **Body (JSON):**
     ```json
     {
       "email": "admin@tonpay.com",
       "password": "admin123456"
     }
     ```

2. Send request
3. **Copy the `accessToken`** from response

**Option B: Using curl (if you have it)**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@tonpay.com\",\"password\":\"admin123456\"}"
```

**Option C: Using Browser Console**

Open browser console (F12) and run:
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@tonpay.com',
    password: 'admin123456'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Access Token:', data.accessToken);
  localStorage.setItem('adminToken', data.accessToken);
});
```

---

### Step 3: Test Monitoring Endpoints

**Option A: Using Test Script**

```bash
cd server
node scripts/test-monitoring.js YOUR_ACCESS_TOKEN_HERE
```

**Option B: Using Postman/Thunder Client**

1. **Test Health Check (No Auth):**
   ```
   GET http://localhost:5000/health
   ```

2. **Test Admin Stats:**
   ```
   GET http://localhost:5000/api/admin/stats
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

3. **Test Transactions:**
   ```
   GET http://localhost:5000/api/admin/transactions?limit=10
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

4. **Test Users:**
   ```
   GET http://localhost:5000/api/admin/users?limit=10
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

**Option C: Using Browser Console**

```javascript
const token = localStorage.getItem('adminToken');

// Get stats
fetch('http://localhost:5000/api/admin/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('📊 Admin Stats:', data);
  console.log('Users:', data.users.total);
  console.log('Transactions:', data.transactions.total);
  console.log('Revenue:', data.revenue.totalNGN);
});
```

---

## 📊 What You Should See

When you call `/api/admin/stats`, you'll get:

```json
{
  "server": {
    "status": "healthy",
    "uptime": "0d 0h 5m",
    "memory": { "used": "45MB", "total": "65MB" },
    "database": "connected"
  },
  "users": {
    "total": 1,
    "activeToday": 0,
    "newToday": 1,
    "verified": 1
  },
  "transactions": {
    "total": 0,
    "today": 0,
    "successRate": 0
  },
  "revenue": {
    "totalNGN": "₦0.00",
    "todayNGN": "₦0.00"
  }
}
```

---

## ✅ Quick Test Checklist

- [ ] Server is running (`npm run dev` in server folder)
- [ ] Logged in and got accessToken
- [ ] Tested `/health` endpoint (no auth needed)
- [ ] Tested `/api/admin/stats` (with token)
- [ ] Can see real-time stats

---

## 🎯 You're All Set!

Once you can see the stats, you have:
- ✅ Admin user created
- ✅ Monitoring endpoints working
- ✅ Real-time dashboard access

**Start monitoring your TonPay app!** 🚀

---

## 💡 Pro Tip

Save your admin token somewhere safe, or create a simple script that logs in automatically and gets a fresh token each time.


