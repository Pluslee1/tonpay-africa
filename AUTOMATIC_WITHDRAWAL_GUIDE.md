# 🤖 Automatic Withdrawal & Wallet Management Guide

This guide explains the automatic withdrawal processing system and TON wallet management in TonPay Africa.

## 🎯 Overview

**How it works:**
1. **Users request withdrawals** → Transactions created with status "pending"
2. **Automatic processor** → Runs every 5 minutes, processes pending withdrawals
3. **Paystack integration** → Sends money to user bank accounts automatically
4. **Webhook confirmation** → Paystack confirms successful transfers
5. **Admin controls** → You can override, manage settings, and monitor everything

---

## ⚙️ Auto-Processing Settings

### Enable/Disable Auto-Processing

**Toggle:**
```bash
POST /api/admin/auto-processing/toggle
```

**Update Settings:**
```bash
PUT /api/admin/auto-processing/settings
Body: {
  "autoProcessWithdrawals": true,
  "minBalanceNGN": 100000,        // Minimum balance before auto-processing stops
  "maxDailyWithdrawalNGN": 10000000  // Max daily auto-withdrawals
}
```

**Default Settings:**
- ✅ Auto-processing: **Enabled** by default
- 💰 Minimum balance: **₦100,000** (stops if balance goes below this)
- 📊 Max daily withdrawals: **₦10,000,000** (safety limit)

---

## 🔄 Automatic Processing Flow

### 1. **User Requests Withdrawal**
- User submits withdrawal request via frontend
- Transaction created with status: `"pending"`
- TON is collected and added to system balance

### 2. **Automatic Processor (Every 5 Minutes)**
The system automatically:
- ✅ Checks if auto-processing is enabled
- ✅ Verifies minimum balance is available
- ✅ Checks daily withdrawal limits
- ✅ Verifies bank account details
- ✅ Creates Paystack transfer recipient
- ✅ Initiates transfer via Paystack
- ✅ Updates transaction status to `"processing"`
- ✅ Deducts from system balance

### 3. **Paystack Webhook Confirmation**
When Paystack confirms the transfer:
- ✅ Transaction status → `"completed"`
- ✅ User receives money in their bank account
- ✅ Transaction is logged

If transfer fails:
- ❌ Transaction status → `"failed"`
- 💰 Balance is refunded
- 📝 Failure reason is logged

---

## 🎮 Admin Controls

### View System Balance
```bash
GET /api/admin/balance
```

**Response:**
```json
{
  "success": true,
  "balance": {
    "naira": 500000,
    "ton": 250.5,
    "totalDepositedNGN": 1000000,
    "totalWithdrawnNGN": 500000,
    "totalCollectedTON": 250.5
  },
  "pending": {
    "count": 5,
    "totalNGN": 50000,
    "availableNGN": 450000
  }
}
```

### View Pending Withdrawals
```bash
GET /api/admin/withdrawals/pending
```

### Manually Process Single Withdrawal
```bash
POST /api/admin/withdrawals/:id/process
```

**Use when:**
- Auto-processing is disabled
- You want to process a specific withdrawal immediately
- Auto-processing failed and you want to retry

### Manually Trigger Auto-Processing
```bash
POST /api/admin/auto-processing/trigger
```

**Use when:**
- You want to process pending withdrawals immediately
- Don't want to wait for the 5-minute interval

### Complete Withdrawal (Manual Override)
```bash
POST /api/admin/withdrawals/:id/complete
Body: { "note": "Processed manually via Paystack dashboard" }
```

**Use when:**
- You processed the withdrawal outside the system
- Need to mark it as completed manually

### Reject Withdrawal
```bash
POST /api/admin/withdrawals/:id/reject
Body: { "reason": "Invalid bank account" }
```

---

## 💼 TON Wallet Management

### View TON Wallet
```bash
GET /api/admin/wallet/ton
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "address": "EQ...",
    "publicKey": "...",
    "balance": 250.5,
    "balanceInSystem": 250.5,
    "totalCollected": 250.5
  }
}
```

### Set TON Wallet Address
```bash
PUT /api/admin/wallet/ton
Body: {
  "address": "EQD...",
  "publicKey": "...",
  "privateKey": "..."  // Optional, encrypt in production
}
```

**Important:**
- This is where TON from users is collected
- Set this to your main TON wallet address
- Private key should be encrypted in production

### Sync TON Balance
```bash
POST /api/admin/wallet/ton/sync
```

**Use when:**
- You want to update system balance from actual wallet
- After receiving TON from users
- To verify wallet balance matches system

### View Paystack Balance
```bash
GET /api/admin/wallet/paystack
```

**Response:**
```json
{
  "success": true,
  "paystack": {
    "success": true,
    "balance": 500000,
    "currency": "NGN"
  },
  "system": {
    "naira": 500000,
    "available": 500000
  }
}
```

---

## 🔧 Configuration

### Environment Variables

Add to `server/.env`:
```env
# Enable/disable auto-processing (default: enabled)
ENABLE_AUTO_PROCESSING=true

# Paystack secret key (required for auto-processing)
PAYSTACK_SECRET_KEY=sk_test_...

# TON wallet (set via admin API)
# TON_WALLET_ADDRESS=EQ...
```

### Paystack Webhook Setup

1. **Go to Paystack Dashboard** → Settings → Webhooks
2. **Add Webhook URL:** `https://your-domain.com/api/webhooks/paystack`
3. **Select Events:**
   - `transfer.success`
   - `transfer.failed`
   - `transfer.reversed`
4. **Copy Secret Key** → Add to `.env` as `PAYSTACK_WEBHOOK_SECRET` (for signature verification)

---

## 📊 Monitoring

### Check Auto-Processing Status

**View Settings:**
```bash
GET /api/admin/balance
# Check "autoProcessWithdrawals" in response
```

**View Processing History:**
```bash
GET /api/admin/transactions?type=payout&status=completed
```

### Daily Limits

The system tracks:
- **Daily withdrawal count** (max 10 per batch)
- **Daily withdrawal amount** (max ₦10,000,000 by default)
- **Minimum balance** (stops if below ₦100,000)

---

## 🚨 Troubleshooting

### Auto-Processing Not Working

1. **Check if enabled:**
   ```bash
   GET /api/admin/balance
   # Look for "autoProcessWithdrawals": true
   ```

2. **Check balance:**
   - Ensure balance > minimum balance (₦100,000)
   - Add Naira if needed: `POST /api/admin/balance/deposit`

3. **Check Paystack:**
   - Verify `PAYSTACK_SECRET_KEY` is set
   - Check Paystack balance: `GET /api/admin/wallet/paystack`
   - Ensure Paystack account is active

4. **Check logs:**
   - Look for auto-processing messages in server logs
   - Check for errors in console

### Withdrawals Stuck in "Processing"

1. **Check Paystack:**
   - Go to Paystack Dashboard → Transfers
   - Find the transfer by reference
   - Check status

2. **Manually confirm:**
   ```bash
   POST /api/admin/withdrawals/:id/complete
   Body: { "note": "Confirmed via Paystack dashboard" }
   ```

### Balance Mismatch

1. **Sync TON balance:**
   ```bash
   POST /api/admin/wallet/ton/sync
   ```

2. **Check transactions:**
   ```bash
   GET /api/admin/transactions?type=payout
   ```

3. **Review pending:**
   ```bash
   GET /api/admin/withdrawals/pending
   ```

---

## 📝 Best Practices

1. **Monitor Daily:**
   - Check balance: `GET /api/admin/balance`
   - Review pending: `GET /api/admin/withdrawals/pending`
   - Check Paystack balance

2. **Set Appropriate Limits:**
   - `minBalanceNGN`: Keep enough for daily operations
   - `maxDailyWithdrawalNGN`: Set based on your liquidity

3. **Regular Sync:**
   - Sync TON balance daily: `POST /api/admin/wallet/ton/sync`
   - Verify Paystack balance matches system

4. **Monitor Auto-Processing:**
   - Check server logs for processing results
   - Review failed transactions regularly
   - Adjust settings based on volume

5. **Security:**
   - Encrypt TON private key in production
   - Use Paystack webhook signature verification
   - Monitor for suspicious activity

---

## 🎯 Quick Start

### 1. Set Up TON Wallet
```bash
PUT /api/admin/wallet/ton
Body: {
  "address": "YOUR_TON_WALLET_ADDRESS"
}
```

### 2. Add Initial Naira Balance
```bash
POST /api/admin/balance/deposit
Body: {
  "amount": 1000000,
  "note": "Initial liquidity"
}
```

### 3. Enable Auto-Processing (if disabled)
```bash
POST /api/admin/auto-processing/toggle
```

### 4. Configure Settings
```bash
PUT /api/admin/auto-processing/settings
Body: {
  "minBalanceNGN": 100000,
  "maxDailyWithdrawalNGN": 10000000
}
```

### 5. Set Up Paystack Webhook
- Go to Paystack Dashboard
- Add webhook URL: `https://your-domain.com/api/webhooks/paystack`
- Select transfer events

---

## ✅ That's It!

Your system is now set up for automatic withdrawal processing. The system will:
- ✅ Process withdrawals every 5 minutes
- ✅ Send money via Paystack automatically
- ✅ Confirm transfers via webhooks
- ✅ Track everything in the database
- ✅ Allow you to override and manage manually

**Need help?** Check the server logs or use the admin endpoints to monitor and control the system.

---

**Last Updated:** January 2024

