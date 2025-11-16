# TONPay Africa v2.0 - Complete Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2. Setup MongoDB

Install MongoDB locally or use MongoDB Atlas (free tier).

**Local MongoDB:**
```bash
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb
```

**MongoDB Atlas (Cloud):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `server/.env`

### 3. Configure Environment

**Backend (.env in server folder):**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tonpay-africa
JWT_SECRET=your-random-secret-key-here
LIQUIDITY_WALLET_ADDRESS=EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Start Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

## 📁 Project Structure

```
tonpay-africa/
├── src/
│   ├── components/       # React components
│   │   ├── Layout.jsx
│   │   └── TonConnectProvider.jsx
│   ├── pages/            # Page components
│   │   ├── Dashboard.jsx
│   │   ├── SplitBill.jsx
│   │   ├── Gifts.jsx
│   │   ├── Settings.jsx
│   │   └── Admin.jsx
│   ├── context/          # React context
│   │   └── AuthContext.jsx
│   ├── App.jsx           # Main app router
│   ├── main.jsx          # Entry point
│   └── index.css         # Tailwind CSS
├── server/
│   ├── models/           # MongoDB models
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── Split.js
│   │   └── Gift.js
│   ├── routes/           # API routes
│   │   ├── rate.js
│   │   ├── splitBill.js
│   │   ├── gift.js
│   │   ├── verify.js
│   │   ├── admin.js
│   │   ├── auth.js
│   │   └── transaction.js
│   ├── middleware/       # Auth middleware
│   │   └── auth.js
│   └── index.js          # Express server
└── public/
    └── tonconnect-manifest.json
```

## 🧪 Testing Flow

### 1. Dashboard
- Open `http://localhost:5173`
- Click "Connect Wallet" button
- Select wallet (Tonkeeper, etc.)
- View balance in TON and NGN

### 2. Split Bill
- Go to "Split Bill" tab
- Enter total amount (e.g., 10 TON)
- Add participants (wallet addresses)
- Choose split type (TON or NGN)
- Create split bill

### 3. Gifts
- Go to "Gifts" tab
- Connect wallet
- Mock gift via API:
```bash
curl -X POST http://localhost:5000/api/gifts/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "recipientAddress": "EQxxxxxxxxxxxxx",
    "senderAddress": "EQyyyyyyyyyyyyy",
    "amountTON": 0.5,
    "message": "Happy Birthday!"
  }'
```
- Convert gift to TON or NGN

### 4. Settings - Verification
- Go to "Settings" tab
- Enter BVN (11 digits) or SubHub ID
- Click verify
- Status updates to "Verified"

### 5. Admin Dashboard
- Go to "Admin" tab
- Login with email/password (first login creates admin)
- View:
  - Total TON collected
  - Total Naira sent
  - Profit (2% fees)
  - All transactions

## 🔧 API Endpoints

### Public
- `GET /api/rate` - Get TON/NGN rate
- `POST /api/split-bill` - Create split bill
- `GET /api/gifts?address=...` - Get user gifts
- `POST /api/gifts/webhook` - Receive gift (mock)
- `POST /api/gifts/convert` - Convert gift
- `POST /api/verify` - Verify user
- `GET /api/verify/status` - Get verification status

### Admin (requires auth)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `GET /api/admin/stats` - Get admin stats
- `GET /api/admin/transactions` - Get all transactions

## 🎨 Features Explained

### Split Bill
- Host creates bill with total amount
- Adds participants by wallet address
- Chooses: credit in TON or convert to NGN
- Each participant gets equal share
- Backend stores split details

### Gifts
- Webhook receives Telegram gifts
- Gift stored with recipient address
- User can convert to TON or NGN
- Auto-convert option available

### Admin Dashboard
- Tracks all TON collected (liquidity pool)
- Shows total Naira sent out
- Calculates 2% profit margin
- Lists all transactions with status

### Verification
- BVN: 11-digit verification (mock)
- SubHub: ID-based verification (mock)
- Verified users: ₦500,000 daily limit
- Unverified: ₦20,000 daily limit

## 🔐 Security Notes

- JWT tokens for admin auth
- Password hashing with bcrypt
- Rate limiting (add in production)
- Input validation on all endpoints
- CORS enabled for localhost

## 🚨 Common Issues

**MongoDB not connecting:**
- Check MongoDB is running: `mongod`
- Verify connection string in `.env`
- Try MongoDB Atlas if local fails

**TON Connect not working:**
- Check `tonconnect-manifest.json` exists in `public/`
- Update manifest URL in `TonConnectProvider.jsx`
- Use HTTPS in production

**CORS errors:**
- Backend CORS is configured for localhost
- Check proxy in `vite.config.js`

## 📝 Next Steps for Production

1. Replace mock rate with CoinGecko API
2. Integrate real TON wallet for liquidity
3. Add Paystack/Flutterwave for payouts
4. Real BVN/SubHub verification APIs
5. Add rate limiting
6. Deploy frontend (Vercel/Netlify)
7. Deploy backend (Railway/Render)
8. Set up MongoDB Atlas
9. Add error monitoring (Sentry)
10. Add analytics

## 🎯 Testing Checklist

- [ ] Wallet connects successfully
- [ ] Balance displays correctly
- [ ] Split bill creates and saves
- [ ] Gift webhook receives gift
- [ ] Gift converts to TON/NGN
- [ ] Verification works (BVN/SubHub)
- [ ] Admin login works
- [ ] Admin dashboard shows stats
- [ ] Transactions list displays







