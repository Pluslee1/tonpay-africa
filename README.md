# TONPay Africa v2.0

Complete TON to NGN off-ramp platform with Split Bill, Gifts, Admin Dashboard, and Verification.

## Features

- 💰 TON to Naira conversion
- 🧾 Split Bill (TON or NGN)
- 🎁 Gift receiving and conversion
- 👑 Admin dashboard with profit tracking
- ✅ BVN/SubHub verification
- 📱 Telegram Mini App ready

## Setup

### Backend

```bash
cd server
npm install
cp ../.env.example .env
# Edit .env with your values
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## MongoDB

Install MongoDB locally or use MongoDB Atlas. Update `MONGODB_URI` in `.env`.

## Admin Access

1. Go to `/admin`
2. Login with any email/password (first login creates admin)
3. View dashboard with stats and transactions

## API Endpoints

- `GET /api/rate` - Get TON/NGN rate
- `POST /api/split-bill` - Create split bill
- `GET /api/gifts` - Get user gifts
- `POST /api/gifts/webhook` - Receive gift (mock)
- `POST /api/gifts/convert` - Convert gift
- `POST /api/verify` - Verify user (BVN/SubHub)
- `GET /api/admin/stats` - Admin stats
- `POST /api/auth/login` - Admin login

## Testing

1. Connect wallet on Dashboard
2. Create split bill with participants
3. Receive mock gift via webhook
4. Verify account in Settings
5. View admin dashboard

## Production Notes

- Replace mock rate with CoinGecko API
- Integrate real TON wallet for liquidity
- Add Paystack/Flutterwave for payouts
- Set up real BVN/SubHub verification
- Add proper authentication for users
