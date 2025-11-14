# 💰 Withdrawal and Balance Management Guide

This guide explains how to manage Naira balance and process withdrawals in TonPay Africa.

## 📊 System Overview

**How it works:**
1. Users send TON → System collects TON
2. System converts TON to NGN (using current rate)
3. Admin processes NGN payouts to user bank accounts
4. System tracks balance and transactions

---

## 🔍 View System Balance

**Endpoint:** `GET /api/admin/balance`

**Authentication:** Admin only

**Response:**
```json
{
  "success": true,
  "balance": {
    "naira": 500000,
    "ton": 250.5,
    "totalDepositedNGN": 1000000,
    "totalWithdrawnNGN": 500000,
    "totalCollectedTON": 250.5,
    "lastUpdated": "2024-01-15T10:30:00Z"
  },
  "pending": {
    "count": 5,
    "totalNGN": 50000,
    "availableNGN": 450000
  }
}
```

**Example (using curl):**
```bash
curl -X GET http://localhost:5000/api/admin/balance \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 💵 Add Naira to System (For Liquidity)

When you need to add more Naira to process user withdrawals:

**Endpoint:** `POST /api/admin/balance/deposit`

**Body:**
```json
{
  "amount": 1000000,
  "note": "Added liquidity for January payouts"
}
```

**Response:**
```json
{
  "success": true,
  "message": "₦1,000,000 added to system balance",
  "balance": {
    "naira": 1500000,
    "ton": 250.5
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/admin/balance/deposit \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000000, "note": "Added liquidity"}'
```

---

## 📋 View Pending Withdrawals

See all pending user withdrawal requests:

**Endpoint:** `GET /api/admin/withdrawals/pending`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "totalPendingNGN": 50000,
  "withdrawals": [
    {
      "id": "transaction_id",
      "amountNGN": 10000,
      "amountTON": 5,
      "fee": 200,
      "bankDetails": {
        "bankName": "Access Bank",
        "accountNumber": "1234567890",
        "accountName": "John Doe"
      },
      "user": {
        "email": "user@example.com",
        "name": "John Doe"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## ✅ Process/Complete a Withdrawal

When you've sent money to a user's bank account, mark it as completed:

**Endpoint:** `POST /api/admin/withdrawals/:id/complete`

**Body (optional):**
```json
{
  "note": "Processed via Paystack transfer code: TRF_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal of ₦10,000 processed successfully",
  "transaction": {
    "id": "transaction_id",
    "amountNGN": 10000,
    "status": "completed",
    "bankDetails": {...}
  },
  "balance": {
    "naira": 490000,
    "ton": 250.5
  }
}
```

**What happens:**
- System balance is deducted
- Transaction status changes to "completed"
- Audit trail is created

---

## ❌ Reject a Withdrawal

If a withdrawal request is invalid or needs to be cancelled:

**Endpoint:** `POST /api/admin/withdrawals/:id/reject`

**Body:**
```json
{
  "reason": "Invalid bank account details"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal rejected",
  "transaction": {
    "id": "transaction_id",
    "status": "failed"
  }
}
```

---

## 🏦 Admin Withdraw Money from System

If you need to withdraw money from the system to your own account:

**Endpoint:** `POST /api/admin/withdraw`

**Body:**
```json
{
  "amount": 500000,
  "bankDetails": {
    "bankName": "Access Bank",
    "bankCode": "044",
    "accountNumber": "1234567890",
    "accountName": "Your Name"
  },
  "note": "Monthly profit withdrawal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal request of ₦500,000 created",
  "withdrawal": {
    "id": "transaction_id",
    "amountNGN": 500000,
    "status": "pending",
    "bankDetails": {...}
  },
  "note": "This withdrawal needs to be processed manually. Complete it using /api/admin/withdrawals/:id/complete"
}
```

**Note:** Admin withdrawals also need to be manually completed for audit purposes.

---

## 📱 Using the Admin Dashboard

### Option 1: Via Browser (Admin Dashboard)
1. Go to: `http://localhost:5173/admin`
2. Login with admin credentials
3. Navigate to "Balance Management" section (if implemented in UI)

### Option 2: Via API (Recommended for Production)
Use Postman, curl, or any HTTP client with your admin token.

---

## 🔄 Typical Workflow

### Daily Operations:

1. **Morning Check:**
   ```bash
   GET /api/admin/balance
   ```
   - Check available balance
   - Check pending withdrawals

2. **Add Liquidity (if needed):**
   ```bash
   POST /api/admin/balance/deposit
   ```
   - Add Naira if balance is low

3. **Process Pending Withdrawals:**
   ```bash
   GET /api/admin/withdrawals/pending
   ```
   - Review pending requests
   - Send money via Paystack/Flutterwave
   - Mark as completed:
   ```bash
   POST /api/admin/withdrawals/:id/complete
   ```

4. **End of Day:**
   - Review all transactions
   - Check balance
   - Plan next day's liquidity needs

---

## 💡 Important Notes

1. **System Balance:** The system automatically tracks:
   - TON collected from users
   - NGN available for payouts
   - Total deposits and withdrawals

2. **Pending Withdrawals:** When a user requests a withdrawal:
   - Transaction is created with status "pending"
   - System balance is NOT deducted yet
   - Admin must manually process and mark as completed

3. **Balance Safety:** Always check available balance before processing:
   ```
   Available = Total Balance - Pending Withdrawals
   ```

4. **Audit Trail:** All operations are logged in transactions for audit purposes.

---

## 🚨 Troubleshooting

### "Insufficient balance" error:
- Add more Naira using `/api/admin/balance/deposit`
- Or reject some pending withdrawals

### Transaction not found:
- Check transaction ID is correct
- Ensure transaction status is "pending"

### Balance not updating:
- Check MongoDB connection
- Verify SystemBalance model is working
- Check server logs for errors

---

## 📞 Support

For issues or questions:
1. Check server logs: `npm start` in server directory
2. Check MongoDB connection
3. Verify admin token is valid
4. Review transaction history

---

**Last Updated:** January 2024

