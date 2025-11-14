# 🚀 Quick Monitoring Guide - TonPay Africa

## ✅ What's Ready Now

Your backend now has **built-in monitoring**! You can monitor everything from API endpoints.

---

## 📊 Access Your Monitoring Dashboard

### Step 1: Get Admin Access

1. **Create an admin user** (or update existing user to admin):
   ```javascript
   // In MongoDB or via code
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Login to get token:**
   ```bash
   POST /api/auth/login
   Body: { "email": "admin@example.com", "password": "..." }
   ```

3. **Save the accessToken** from response

### Step 2: View Real-Time Stats

```bash
GET /api/admin/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**You'll see:**
- ✅ Server health & uptime
- ✅ Memory usage
- ✅ Database status
- ✅ Total users & active users
- ✅ Transaction counts & success rate
- ✅ Revenue (TON & NGN)
- ✅ Performance metrics

---

## 📈 Available Monitoring Endpoints

### 1. **Real-Time Stats** (Main Dashboard)
```
GET /api/admin/stats
```
**Shows:** Everything at a glance

### 2. **All Transactions**
```
GET /api/admin/transactions?status=completed&type=airtime&page=1&limit=50
```
**Filters:**
- `status`: completed, pending, failed
- `type`: airtime, data, payout, gift, split
- `page`: page number
- `limit`: items per page

### 3. **All Users**
```
GET /api/admin/users?verified=true&status=active&page=1&limit=50
```
**Filters:**
- `verified`: true/false
- `status`: active, suspended, banned
- `page`: page number
- `limit`: items per page

### 4. **Transaction Analytics**
```
GET /api/admin/analytics/transactions?days=30
```
**Shows:**
- Daily transaction breakdown
- Transaction type breakdown
- Volume trends

### 5. **User Analytics**
```
GET /api/admin/analytics/users?days=30
```
**Shows:**
- Daily signups
- KYC status breakdown
- User growth trends

---

## 🎯 Daily Monitoring Checklist

### Morning Check (5 minutes)

1. **Check Server Health:**
   ```bash
   GET /api/admin/stats
   ```
   - ✅ Server status: "healthy"
   - ✅ Database: "connected"
   - ✅ Uptime: Should be increasing

2. **Check Overnight Activity:**
   - Look at `transactions.today`
   - Check `users.newToday`
   - Review `revenue.todayNGN`

3. **Check for Issues:**
   - `transactions.failed` should be low
   - `transactions.successRate` should be > 95%
   - No critical errors

### Quick Health Check
```bash
GET /health
```
**No auth needed!** Use this for uptime monitoring services.

---

## 🔔 Set Up External Monitoring (Recommended)

### 1. Uptime Robot (Free) - Server Monitoring

1. Go to https://uptimerobot.com
2. Sign up (free)
3. Add monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://your-domain.com/health`
   - **Interval:** 5 minutes
4. Add alert contacts (email/SMS)

**You'll get alerts if:**
- Server goes down
- Server doesn't respond
- Response time is too slow

### 2. MongoDB Atlas Alerts (Free)

1. Go to https://cloud.mongodb.com/
2. Select your cluster
3. Go to "Alerts" tab
4. Enable:
   - Connection count alerts
   - Storage alerts
   - Performance alerts

---

## 📱 How to Monitor Daily

### Option 1: Use Postman/Thunder Client

1. Create a collection with all admin endpoints
2. Save your admin token
3. Run requests daily to check stats

### Option 2: Create Simple Dashboard (Future)

Create a simple HTML page that calls `/api/admin/stats` and displays the data nicely.

### Option 3: Use Browser

Just open:
```
https://your-domain.com/api/admin/stats
```
With your admin token in the Authorization header (use browser extension like ModHeader)

---

## 🚨 What to Watch For

### Critical Issues (Act Immediately)

1. **Server Down**
   - Uptime Robot will alert you
   - Check `/health` endpoint
   - Restart server if needed

2. **Database Disconnected**
   - Check MongoDB Atlas
   - Check `/api/admin/stats` → `server.database`
   - Should be "connected"

3. **High Error Rate**
   - `transactions.successRate` < 90%
   - Check failed transactions
   - Investigate immediately

4. **Payment Failures**
   - Many `failed` transactions
   - Check payment provider (Paystack/VTPass)
   - Contact support if needed

### Warning Signs

1. **Slow Response Times**
   - Check server memory usage
   - Check database performance

2. **Low User Activity**
   - Fewer active users than normal
   - Check for app issues

3. **Revenue Drop**
   - Lower transaction volume
   - Check if features are working

---

## 📊 Key Metrics to Track

### Daily
- ✅ Active users
- ✅ New registrations
- ✅ Transaction count
- ✅ Transaction success rate
- ✅ Revenue

### Weekly
- ✅ User growth trend
- ✅ Revenue trend
- ✅ Most used features
- ✅ Error patterns

### Monthly
- ✅ Total revenue
- ✅ User retention
- ✅ Feature usage
- ✅ Performance trends

---

## 💡 Pro Tips

1. **Bookmark the stats endpoint** - Quick access
2. **Set up Uptime Robot** - Get alerts automatically
3. **Check MongoDB Atlas** - Database health
4. **Review logs daily** - Catch issues early
5. **Track trends** - Compare day-over-day, week-over-week

---

## 🎯 Quick Start (Right Now)

1. **Create admin user:**
   - Update a user's role to "admin" in database
   - Or create new admin user

2. **Get admin token:**
   - Login via `/api/auth/login`
   - Save the accessToken

3. **Test monitoring:**
   ```bash
   GET /api/admin/stats
   Authorization: Bearer YOUR_TOKEN
   ```

4. **Set up Uptime Robot:**
   - Monitor `/health` endpoint
   - Get email alerts

**That's it!** You're now monitoring your app! 🎉

---

## 📞 Need Help?

- Check `MONITORING_GUIDE.md` for detailed guide
- Check server logs for errors
- Check MongoDB Atlas dashboard
- Review transaction details in admin endpoints

---

**Your monitoring system is ready! Start monitoring today!** 🚀


