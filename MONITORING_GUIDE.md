# 📊 TonPay Africa - Production Monitoring Guide

## 🎯 What You Need to Monitor

When your app goes live, you need to monitor:

1. **Server Health** - Is the server running? Is it responding?
2. **Errors** - What errors are happening? How often?
3. **Transactions** - How many transactions? Success rate?
4. **User Activity** - How many users? Active users?
5. **Performance** - Response times, slow queries
6. **Payment Issues** - Failed payments, refunds
7. **Database** - Connection status, query performance
8. **API Usage** - Rate limits, API calls
9. **Security** - Failed login attempts, suspicious activity
10. **Revenue** - Total transactions, fees collected

---

## 🛠️ Monitoring Solutions

### Option 1: Built-in Admin Dashboard (Recommended for Start)

**What you get:**
- Real-time stats
- Transaction monitoring
- User activity
- Error logs
- All in your app!

**Access:** `http://your-domain.com/api/admin/stats` (requires admin token)

### Option 2: Third-Party Services (Recommended for Scale)

#### **Free/Cheap Options:**

1. **Uptime Robot** (Free)
   - Monitors if your server is up
   - Sends alerts if server goes down
   - https://uptimerobot.com

2. **Sentry** (Free tier: 5,000 errors/month)
   - Error tracking and alerting
   - Real-time error notifications
   - Stack traces
   - https://sentry.io

3. **Logtail** (Free tier: 1GB/month)
   - Centralized logging
   - Search logs
   - Real-time monitoring
   - https://logtail.com

4. **MongoDB Atlas Monitoring** (Free)
   - Database performance
   - Connection monitoring
   - Query performance
   - Built into MongoDB Atlas

#### **Paid Options (When You Scale):**

1. **New Relic** - Full application monitoring
2. **Datadog** - Infrastructure monitoring
3. **Grafana + Prometheus** - Self-hosted monitoring
4. **PM2 Plus** - Process monitoring for Node.js

---

## 📈 What to Monitor Daily

### Critical Metrics (Check Every Day)

1. **Server Status**
   - Is server running? ✅
   - Response time < 500ms? ✅
   - Database connected? ✅

2. **Transaction Success Rate**
   - Target: > 95% success rate
   - Failed transactions? Investigate immediately

3. **Error Rate**
   - Target: < 1% error rate
   - Spike in errors? Check logs

4. **Active Users**
   - Daily active users
   - New registrations
   - User growth trend

5. **Revenue**
   - Daily transaction volume
   - Fees collected
   - Revenue trends

### Weekly Reviews

1. **Performance Trends**
   - Average response time
   - Slow endpoints
   - Database query performance

2. **User Behavior**
   - Most used features
   - Drop-off points
   - User retention

3. **Security**
   - Failed login attempts
   - Suspicious activity
   - Rate limit hits

---

## 🔍 How to Access Monitoring

### 1. Admin Dashboard API

**Get Real-Time Stats:**
```bash
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "server": {
    "status": "healthy",
    "uptime": "5d 12h 30m",
    "memory": "245MB / 512MB",
    "database": "connected"
  },
  "users": {
    "total": 1250,
    "activeToday": 89,
    "newToday": 12,
    "verified": 856
  },
  "transactions": {
    "total": 5432,
    "today": 45,
    "successRate": 96.5,
    "totalVolume": 1250000,
    "todayVolume": 89000
  },
  "errors": {
    "last24h": 3,
    "critical": 0
  },
  "performance": {
    "avgResponseTime": 145,
    "slowestEndpoint": "/api/payments/bank-transfer"
  }
}
```

### 2. MongoDB Atlas Dashboard

1. Go to https://cloud.mongodb.com/
2. Select your cluster
3. Click "Metrics" tab
4. See:
   - Database connections
   - Query performance
   - Storage usage
   - Network traffic

### 3. Server Logs

**View logs in real-time:**
```bash
# If using PM2
pm2 logs tonpay-africa

# If using Docker
docker logs -f tonpay-africa

# If running directly
# Logs appear in console
```

---

## 🚨 Setting Up Alerts

### Critical Alerts (Set Up Immediately)

1. **Server Down**
   - Use Uptime Robot
   - Alert: Email + SMS
   - Check every 5 minutes

2. **High Error Rate**
   - Alert if > 5% errors in 10 minutes
   - Use Sentry or custom alert

3. **Database Disconnected**
   - Alert immediately
   - Check MongoDB Atlas alerts

4. **Payment Failures**
   - Alert if > 10% failure rate
   - Critical for business

5. **High Response Time**
   - Alert if average > 2 seconds
   - Performance issue

### Alert Channels

- **Email** - For all alerts
- **SMS** - For critical alerts only
- **Slack/Discord** - For team notifications
- **Telegram Bot** - Personal notifications

---

## 📊 Monitoring Dashboard Setup

### Step 1: Access Admin Stats

1. **Get Admin Token:**
   ```bash
   # Login as admin user
   POST /api/auth/login
   Body: { "email": "admin@tonpay.com", "password": "..." }
   
   # Save the accessToken
   ```

2. **View Stats:**
   ```bash
   GET /api/admin/stats
   Authorization: Bearer <admin_token>
   ```

### Step 2: Set Up Uptime Robot

1. Go to https://uptimerobot.com
2. Sign up (free)
3. Add monitor:
   - Type: HTTP(s)
   - URL: `https://your-api-domain.com/health`
   - Interval: 5 minutes
4. Add alert contacts (email, SMS)

### Step 3: Set Up Sentry (Error Tracking)

1. Go to https://sentry.io
2. Create account
3. Create new project (Node.js)
4. Get DSN (Data Source Name)
5. Add to your `.env`:
   ```env
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```
6. Install in backend (see implementation below)

---

## 🔧 Implementation

### Enhanced Logging

Your backend already has:
- ✅ Request logging
- ✅ Error logging
- ✅ MongoDB connection monitoring

**What we'll add:**
- 📊 Metrics collection
- 📈 Admin stats endpoint
- 🚨 Error tracking (Sentry)
- 📝 Structured logging

### Admin Monitoring Endpoints

Access via: `/api/admin/*`

- `/api/admin/stats` - Real-time statistics
- `/api/admin/logs` - Recent logs
- `/api/admin/errors` - Error summary
- `/api/admin/transactions` - Transaction analytics
- `/api/admin/users` - User analytics

---

## 📱 Daily Monitoring Checklist

### Morning (9 AM)

- [ ] Check server status (Uptime Robot)
- [ ] Review overnight errors (Sentry/Logs)
- [ ] Check transaction success rate
- [ ] Review failed payments
- [ ] Check database connection

### Afternoon (2 PM)

- [ ] Check active users
- [ ] Review transaction volume
- [ ] Check response times
- [ ] Review any alerts

### Evening (6 PM)

- [ ] Daily summary report
- [ ] Check revenue for the day
- [ ] Review user registrations
- [ ] Check for any issues

---

## 🎯 Key Performance Indicators (KPIs)

### Track These Numbers:

1. **Uptime**: Target 99.9% (43 minutes downtime/month max)
2. **Response Time**: Target < 500ms average
3. **Error Rate**: Target < 1%
4. **Transaction Success Rate**: Target > 95%
5. **User Growth**: Track daily/weekly/monthly
6. **Revenue**: Daily, weekly, monthly totals

---

## 🚀 Quick Start Monitoring

### Right Now (5 minutes):

1. **Set up Uptime Robot:**
   - Monitor: `https://your-domain.com/health`
   - Get email alerts

2. **Check Admin Stats:**
   - Access `/api/admin/stats`
   - Bookmark it

3. **Set up MongoDB Alerts:**
   - Go to MongoDB Atlas
   - Enable email alerts
   - Set up connection monitoring

### This Week:

1. **Set up Sentry** for error tracking
2. **Set up Logtail** for centralized logs
3. **Create monitoring dashboard** (simple HTML page)
4. **Set up daily email reports**

---

## 💡 Pro Tips

1. **Monitor in Real-Time**
   - Keep admin dashboard open
   - Set up browser alerts

2. **Automate Alerts**
   - Use services like Uptime Robot
   - Don't rely on manual checks

3. **Log Everything**
   - All API calls
   - All errors
   - All transactions
   - User actions

4. **Review Regularly**
   - Daily: Quick check
   - Weekly: Detailed review
   - Monthly: Full analysis

5. **Set Baselines**
   - Know your normal numbers
   - Alert when things deviate

---

## 📞 Support & Help

If you see issues:

1. **Check logs** first
2. **Check MongoDB Atlas** dashboard
3. **Check admin stats** endpoint
4. **Review error details** in Sentry
5. **Check server resources** (CPU, memory)

---

Your monitoring system is ready! 🎉

Start with the built-in admin stats, then add external services as you scale.


