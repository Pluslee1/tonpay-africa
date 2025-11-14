# TONPay Africa - Setup Guide

## Backend Setup

1. Navigate to server folder:
```bash
cd server
npm install
```

2. Start backend server:
```bash
npm run dev
```

Server runs on `http://localhost:3001`

## Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Update API base URL in `src/js/app.js` if needed:
```javascript
const API_BASE = 'http://localhost:3001/api';
```

3. Update TON Connect manifest URL in `src/js/app.js`:
```javascript
manifestUrl: window.location.origin + '/tonconnect-manifest.json'
```

4. Start frontend:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Testing

### 1. Connect Wallet
- Click "Connect Wallet"
- Select wallet from TON Connect
- View balance and address

### 2. Send to Bank
- Click "Send to Bank"
- Enter amount (e.g., 1.5 TON)
- Select bank (e.g., Access Bank)
- Enter account number (e.g., 0001234567)
- Account name auto-verifies
- Click "Continue"

### 3. Confirm
- Review details
- Click "Confirm & Submit"
- See success message

### 4. Check Backend
View payout requests:
```bash
curl http://localhost:3001/api/payout-requests
```

## Test Data

- Bank Code: `044` (Access Bank)
- Account Number: `0001234567`
- Mock Account Name: `Account Holder 4567`

## API Endpoints

- `POST /api/verify-account` - Verify bank account
- `POST /api/payout-request` - Submit payout request
- `GET /api/payout-requests` - View all requests

