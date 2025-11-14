# 🎁 Gift System - Complete Guide

## ✨ Features Implemented

### 1. **Send Gift Interface**
- ✅ Input recipient Telegram username
- ✅ Input gift amount in TON
- ✅ Optional personal message (up to 500 characters)
- ✅ Gift expiration settings (7, 14, 30, 60, or 90 days)
- ✅ Balance validation before sending
- ✅ Automatic balance deduction

### 2. **Telegram Integration**
- ✅ Sends beautiful notification to recipient via Telegram Bot API
- ✅ Includes gift amount, message, and claim link
- ✅ Inline button to claim gift directly
- ✅ Sends confirmation to sender
- ✅ Works even if recipient hasn't interacted with bot (via claim link)

### 3. **Gift Claiming System**
- ✅ Unique claim token for each gift
- ✅ Shareable claim link
- ✅ Claim via link (works for anyone, even without Telegram)
- ✅ Automatic expiration checking
- ✅ Status tracking (pending, sent, claimed, expired)

### 4. **Gift Management**
- ✅ **Received Gifts Tab** - View all gifts sent to you
- ✅ **Send Gift Tab** - Send new gifts
- ✅ **Sent Gifts Tab** - View all gifts you've sent
- ✅ Status indicators (sent, claimed, expired)
- ✅ Copy claim link for sharing

### 5. **Advanced Features**
- ✅ Gift expiration (prevents unclaimed gifts from sitting forever)
- ✅ Real-time TON/NGN conversion rates
- ✅ Gift history tracking
- ✅ Multi-currency conversion (TON or NGN)
- ✅ Transaction recording for admin
- ✅ Fee calculation (2% for NGN conversion)

---

## 🚀 How to Use

### For Senders:

1. **Go to Gifts Page** → Click "🎁 Send Gift" tab
2. **Enter Recipient Username** (e.g., `@john_doe` or `john_doe`)
3. **Enter Amount** (minimum 0.01 TON)
4. **Add Message** (optional, up to 500 characters)
5. **Choose Expiration** (7-90 days)
6. **Click "Send Gift"**
7. Recipient receives Telegram notification automatically!

### For Recipients:

1. **Receive Telegram Notification** with gift details
2. **Click "Claim Gift Now"** button in Telegram
3. **Or use the claim link** if shared separately
4. **Connect wallet** (if not already connected)
5. **Choose conversion**: TON or NGN
6. **Gift is credited** to your account!

---

## 🔧 Backend Setup

### Required Environment Variables

Add to `server/.env`:

```env
# Telegram Bot Token (get from @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Frontend URL (for claim links)
FRONTEND_URL=https://your-frontend-url.com

# Backend URL (for internal API calls)
BACKEND_URL=http://localhost:5000
```

### Get Telegram Bot Token:

1. Open Telegram → Search `@BotFather`
2. Send `/newbot` or use existing bot
3. Send `/token` to get your bot token
4. Copy token to `server/.env`

---

## 📋 API Endpoints

### Send Gift
```
POST /api/gifts/send
Body: {
  senderAddress: "EQ...",
  senderTelegramId: "123456789",
  recipientTelegramUsername: "@username",
  amountTON: 1.5,
  message: "Happy Birthday!",
  expiresInDays: 30
}
```

### Claim Gift
```
POST /api/gifts/claim
Body: {
  claimToken: "abc123...",
  recipientAddress: "EQ...",
  recipientTelegramId: "987654321"
}
```

### Get Gift by Token
```
GET /api/gifts/claim/:token
```

### Get Received Gifts
```
GET /api/gifts?address=EQ...&telegramId=123
```

### Get Sent Gifts
```
GET /api/gifts/sent?address=EQ...&telegramId=123
```

---

## 🎯 Deep Thinking Features Added

### 1. **Security & Spam Prevention**
- ✅ Minimum gift amount (0.01 TON)
- ✅ Balance validation before sending
- ✅ Unique claim tokens (cryptographically secure)
- ✅ Gift expiration prevents abuse
- ✅ Status tracking prevents double-claiming

### 2. **User Experience**
- ✅ Beautiful Telegram notifications with inline buttons
- ✅ Clear status indicators (sent, claimed, expired)
- ✅ Copy claim link for easy sharing
- ✅ Gift history (sent and received)
- ✅ Helpful instructions and tooltips

### 3. **Flexibility**
- ✅ Works with or without Telegram (claim links)
- ✅ Supports both Telegram username and wallet address
- ✅ Multiple expiration options
- ✅ Optional personal messages
- ✅ Multi-currency conversion

### 4. **Business Logic**
- ✅ Automatic fee calculation (2% for NGN)
- ✅ Transaction recording for admin analytics
- ✅ Real-time exchange rates
- ✅ Gift analytics (who sent, who received, conversion rates)

### 5. **Future Enhancements** (Ideas)
- 📅 Scheduled gifts (send on specific date)
- 🎁 Gift templates (birthday, holiday, etc.)
- 👥 Group gifts (multiple people contribute)
- 🎉 Gift cards (predefined amounts)
- 📊 Gift analytics dashboard
- 🔔 Reminder notifications (before expiration)
- 💰 Gift pools (save up for larger gifts)

---

## 🧪 Testing

### Test Send Gift:

1. **Connect wallet** in the app
2. **Go to Gifts** → "Send Gift" tab
3. **Enter test username**: `@your_telegram_username`
4. **Enter amount**: `0.1 TON`
5. **Add message**: "Test gift!"
6. **Click Send**
7. **Check Telegram** - You should receive a notification!

### Test Claim Gift:

1. **Open the claim link** from Telegram notification
2. **Or use the link** from "Sent Gifts" tab
3. **Connect wallet** (if not connected)
4. **Claim the gift**
5. **Convert to TON or NGN**

---

## 🐛 Troubleshooting

### Telegram Notification Not Sending?

1. **Check Bot Token**: Make sure `TELEGRAM_BOT_TOKEN` is set in `server/.env`
2. **Check Recipient**: User must have interacted with bot OR use claim link
3. **Check Logs**: Backend console will show Telegram API errors
4. **Fallback**: Gift is still created, recipient can use claim link

### Gift Not Appearing?

1. **Check Status**: Gift might be "pending" if notification failed
2. **Check Expiration**: Gift might have expired
3. **Refresh**: Try refreshing the gifts list
4. **Check Filters**: Make sure you're looking at the right tab (received/sent)

### Claim Link Not Working?

1. **Check Token**: Make sure the token in URL is correct
2. **Check Expiration**: Gift might have expired
3. **Check Status**: Gift might already be claimed
4. **Check Backend**: Make sure backend is running

---

## 📝 Notes

- **Telegram Username Lookup**: Telegram Bot API doesn't allow direct username lookup. The system works by:
  1. If user has interacted with bot → We can send notification
  2. If not → Gift is created with claim link (can be shared manually)

- **Balance Deduction**: Currently deducts from demo balance or real wallet. In production, you'd want to:
  - Lock the TON amount in escrow
  - Transfer when gift is claimed
  - Refund if gift expires

- **Rate Limiting**: Consider adding rate limits to prevent spam:
  - Max gifts per day per user
  - Max gift amount per transaction
  - Cooldown between gifts

---

## 🎉 You're All Set!

Your gift system is now fully functional with:
- ✅ Send gifts via Telegram
- ✅ Beautiful notifications
- ✅ Claim mechanism
- ✅ Gift history
- ✅ Expiration handling
- ✅ Multi-currency conversion

**Test it out and enjoy!** 🎁

