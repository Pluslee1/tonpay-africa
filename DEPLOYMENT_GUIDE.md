# 🚀 Production Deployment Guide

This guide will help you deploy TonPay Africa to production and go live.

---

## 📋 Pre-Deployment Checklist

### ✅ Backend Requirements
- [ ] MongoDB Atlas database (or production MongoDB)
- [ ] Paystack production API keys
- [ ] VTPass production API keys (for airtime/data)
- [ ] TON API key (if using TonAPI)
- [ ] Telegram Bot Token
- [ ] Domain name for backend API
- [ ] SSL certificate (HTTPS required)
- [ ] Environment variables configured

### ✅ Frontend Requirements
- [ ] Domain name for frontend
- [ ] SSL certificate (HTTPS required)
- [ ] Telegram Mini App configured
- [ ] TON Connect manifest updated
- [ ] ngrok replaced with production domain

---

## 🔧 Step 1: Backend Deployment

### Option A: Deploy to VPS (Recommended)

**Recommended Services:**
- DigitalOcean Droplet ($6-12/month)
- AWS EC2
- Google Cloud Compute Engine
- Linode
- Vultr

**Steps:**

1. **Create VPS Instance:**
   ```bash
   # Choose Ubuntu 22.04 LTS
   # Minimum: 1GB RAM, 1 CPU, 25GB SSD
   # Recommended: 2GB RAM, 2 CPU, 50GB SSD
   ```

2. **SSH into Server:**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node --version  # Should show v20.x.x
   ```

4. **Install MongoDB (or use MongoDB Atlas):**
   ```bash
   # Option 1: Use MongoDB Atlas (Recommended - easier)
   # Go to mongodb.com/cloud/atlas and create cluster
   
   # Option 2: Install locally
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Install PM2 (Process Manager):**
   ```bash
   sudo npm install -g pm2
   ```

6. **Clone Your Repository:**
   ```bash
   cd /var/www
   git clone https://github.com/your-username/tonpay-africa.git
   cd tonpay-africa/server
   npm install --production
   ```

7. **Configure Environment Variables:**
   ```bash
   nano .env
   ```
   
   Add:
   ```env
   NODE_ENV=production
   PORT=5000
   
   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tonpay-africa
   
   # Paystack (Production Keys)
   PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
   
   # VTPass (Production)
   VTPASS_API_KEY=your_vtpass_api_key
   VTPASS_PUBLIC_KEY=your_vtpass_public_key
   
   # Telegram
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   
   # TON API (Optional)
   TON_API_KEY=your_ton_api_key
   
   # JWT Secret
   JWT_SECRET=your_very_secure_random_string_here
   JWT_REFRESH_SECRET=another_secure_random_string
   
   # CORS (Your frontend domain)
   FRONTEND_URL=https://yourdomain.com
   
   # Enable auto-processing
   ENABLE_AUTO_PROCESSING=true
   ```

8. **Start with PM2:**
   ```bash
   cd /var/www/tonpay-africa/server
   pm2 start index.js --name tonpay-backend
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start
   ```

9. **Setup Nginx (Reverse Proxy):**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/tonpay-api
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   
   Enable:
   ```bash
   sudo ln -s /etc/nginx/sites-available/tonpay-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Setup SSL with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

### Option B: Deploy to Heroku (Easier)

1. **Install Heroku CLI:**
   ```bash
   # Download from heroku.com/cli
   ```

2. **Login:**
   ```bash
   heroku login
   ```

3. **Create App:**
   ```bash
   cd server
   heroku create tonpay-africa-api
   ```

4. **Add MongoDB:**
   ```bash
   heroku addons:create mongolab:sandbox
   # Or use MongoDB Atlas and set MONGODB_URI
   ```

5. **Set Environment Variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PAYSTACK_SECRET_KEY=sk_live_xxxxx
   heroku config:set MONGODB_URI=mongodb+srv://...
   # ... set all other variables
   ```

6. **Deploy:**
   ```bash
   git push heroku main
   ```

7. **Your API will be at:**
   ```
   https://tonpay-africa-api.herokuapp.com
   ```

---

### Option C: Deploy to Railway/Render (Easiest)

**Railway:**
1. Go to railway.app
2. New Project → Deploy from GitHub
3. Select your repository
4. Set root directory to `server`
5. Add environment variables
6. Deploy!

**Render:**
1. Go to render.com
2. New Web Service
3. Connect GitHub repository
4. Set:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
5. Add environment variables
6. Deploy!

---

## 🎨 Step 2: Frontend Deployment

### Option A: Deploy to Vercel (Recommended - Free)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd tonpay-africa  # Root directory
   vercel
   ```

4. **Configure:**
   - Set environment variables in Vercel dashboard
   - Update `vite.config.js` proxy to your backend URL
   - Or use environment variable for API URL

5. **Update `vite.config.js`:**
   ```javascript
   export default defineConfig({
     // ... existing config
     server: {
       proxy: {
         '/api': {
           target: process.env.VITE_API_URL || 'https://api.yourdomain.com',
           changeOrigin: true
         }
       }
     }
   })
   ```

6. **Add `.env.production`:**
   ```env
   VITE_API_URL=https://api.yourdomain.com
   ```

7. **Your frontend will be at:**
   ```
   https://tonpay-africa.vercel.app
   ```

---

### Option B: Deploy to Netlify (Free)

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   - Go to netlify.com
   - Drag and drop `dist` folder
   - Or connect GitHub for auto-deploy

3. **Configure:**
   - Add environment variables
   - Set build command: `npm run build`
   - Set publish directory: `dist`

---

### Option C: Deploy to VPS (Same as Backend)

1. **Build:**
   ```bash
   npm run build
   ```

2. **Copy `dist` folder to server:**
   ```bash
   scp -r dist/* root@your-server:/var/www/tonpay-frontend
   ```

3. **Setup Nginx:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/tonpay-frontend;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Setup SSL:**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 📱 Step 3: Telegram Mini App Setup

1. **Update Bot Settings:**
   - Go to @BotFather on Telegram
   - Send `/mybots`
   - Select your bot
   - Bot Settings → Menu Button
   - Set URL: `https://yourdomain.com`

2. **Update TON Connect Manifest:**
   - Edit `public/tonconnect-manifest.json`
   - Update `url` to your production domain
   - Update `iconUrl` to your production domain

3. **Update Frontend:**
   - Update any hardcoded URLs
   - Ensure HTTPS is used everywhere

---

## 🔐 Step 4: Security Checklist

### Backend Security:
- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable rate limiting (already done)
- [ ] Enable CORS for your domain only
- [ ] Use HTTPS only
- [ ] Enable Paystack webhook signature verification
- [ ] Encrypt sensitive data (TON private keys)
- [ ] Regular security updates

### Frontend Security:
- [ ] HTTPS only
- [ ] Secure API endpoints
- [ ] Validate all inputs
- [ ] Sanitize user data

---

## 📊 Step 5: Monitoring Setup

### Option A: Uptime Robot (Free)
1. Go to uptimerobot.com
2. Add monitor for:
   - Backend: `https://api.yourdomain.com/health`
   - Frontend: `https://yourdomain.com`
3. Set alerts to email/SMS

### Option B: PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Option C: Application Monitoring
- Sentry (error tracking)
- LogRocket (session replay)
- New Relic (performance)

---

## 🧪 Step 6: Testing Before Going Live

1. **Test All Features:**
   - [ ] User registration/login
   - [ ] Wallet connection
   - [ ] Send to bank
   - [ ] Airtime purchase
   - [ ] Data purchase
   - [ ] Gift sending/claiming
   - [ ] Split bills
   - [ ] Admin dashboard

2. **Test Payment Flows:**
   - [ ] Test with Paystack test mode first
   - [ ] Verify webhooks work
   - [ ] Test withdrawal processing

3. **Load Testing:**
   - Use tools like k6 or Apache Bench
   - Test with 100+ concurrent users

---

## 🚀 Step 7: Go Live Checklist

### Final Steps:
- [ ] Switch Paystack to live mode
- [ ] Switch VTPass to production
- [ ] Update all API keys to production
- [ ] Test with real money (small amounts)
- [ ] Monitor logs for errors
- [ ] Set up backups
- [ ] Configure auto-scaling (if needed)
- [ ] Set up alerts
- [ ] Document runbook for common issues

---

## 📝 Step 8: Post-Deployment

### Daily Tasks:
- Monitor admin dashboard
- Check system balance
- Review pending withdrawals
- Check error logs
- Monitor server resources

### Weekly Tasks:
- Review transaction reports
- Check security logs
- Update dependencies
- Backup database

### Monthly Tasks:
- Review performance metrics
- Security audit
- Update documentation
- Plan improvements

---

## 🆘 Troubleshooting

### Common Issues:

**1. Backend not starting:**
```bash
# Check logs
pm2 logs tonpay-backend

# Check environment variables
pm2 env tonpay-backend
```

**2. Database connection failed:**
- Verify MongoDB URI
- Check IP whitelist in MongoDB Atlas
- Verify credentials

**3. Frontend can't connect to backend:**
- Check CORS settings
- Verify API URL
- Check network/firewall

**4. SSL certificate issues:**
```bash
# Renew certificate
sudo certbot renew
```

---

## 💰 Cost Estimate

### Minimum Setup (VPS):
- VPS: $6-12/month (DigitalOcean)
- Domain: $10-15/year
- MongoDB Atlas: Free tier available
- **Total: ~$10-15/month**

### Recommended Setup:
- VPS: $12-24/month
- Domain: $10-15/year
- MongoDB Atlas: $9/month (M10 cluster)
- Monitoring: Free (Uptime Robot)
- **Total: ~$25-35/month**

### Enterprise Setup:
- VPS/Cloud: $50-200/month
- MongoDB Atlas: $57+/month
- CDN: $10-50/month
- Monitoring: $20-100/month
- **Total: ~$150-400/month**

---

## ✅ Quick Deploy Commands

### Backend (VPS):
```bash
# On your server
cd /var/www/tonpay-africa/server
git pull
npm install --production
pm2 restart tonpay-backend
```

### Frontend (Vercel):
```bash
# Automatic on git push
git push origin main
# Vercel auto-deploys
```

---

## 📞 Support

If you encounter issues:
1. Check server logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check MongoDB connection
4. Verify environment variables
5. Review this guide

---

## 🎯 Summary

**Easiest Path to Production:**
1. **Backend:** Deploy to Railway/Render (5 minutes)
2. **Frontend:** Deploy to Vercel (5 minutes)
3. **Database:** Use MongoDB Atlas (free tier)
4. **Domain:** Point to Vercel (automatic SSL)
5. **Telegram:** Update bot settings

**Total Time: ~30 minutes to go live!**

---

**Last Updated:** January 2024

