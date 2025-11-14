# 🏗️ TonPay Africa Backend - Complete Explanation

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Main Server File (index.js)](#main-server-file)
4. [Database Models](#database-models)
5. [API Routes](#api-routes)
6. [Middleware](#middleware)
7. [Services](#services)
8. [How It All Works Together](#how-it-all-works-together)
9. [API Endpoints Summary](#api-endpoints-summary)

---

## 🏛️ Architecture Overview

Your backend is built using **Node.js** with **Express.js** framework. It follows a **MVC (Model-View-Controller)** pattern:

- **Models**: Database schemas (MongoDB/Mongoose)
- **Routes**: API endpoints (Controllers)
- **Services**: External API integrations (Paystack, VTPass, TON)
- **Middleware**: Security, authentication, validation

```
Request Flow:
Frontend → Express Server → Middleware → Routes → Services → Database → Response
```

---

## 📁 Project Structure

```
server/
├── index.js              # Main server entry point
├── models/               # Database schemas
│   ├── User.js          # User model
│   ├── Transaction.js   # Transaction model
│   ├── Split.js         # Split bill model
│   └── Gift.js          # Gift model
├── routes/              # API endpoints
│   ├── auth.js          # Authentication routes
│   ├── payments.js      # Payment processing
│   ├── user.js          # User management
│   ├── transaction.js   # Transaction history
│   ├── splitBill.js     # Split bill feature
│   ├── gift.js          # Gift cards
│   ├── ton.js           # TON blockchain
│   ├── tonpay.js        # TON payment processing
│   ├── admin.js         # Admin operations
│   ├── verify.js        # KYC verification
│   └── rate.js          # Exchange rates
├── middleware/          # Request processing
│   ├── auth.js          # JWT authentication
│   ├── security.js      # Security headers
│   ├── rateLimiter.js   # Rate limiting
│   └── validator.js     # Input validation
└── services/            # External integrations
    ├── paystack.js      # Paystack payment gateway
    ├── vtpass.js        # VTPass (airtime/data)
    ├── ton.js           # TON blockchain service
    └── notifications.js # Email/SMS notifications
```

---

## 🚀 Main Server File (index.js)

This is the **heart of your backend**. Here's what it does:

### 1. **Imports & Setup**
```javascript
- Express: Web server framework
- CORS: Allows frontend to make requests
- Mongoose: MongoDB database connection
- dotenv: Loads environment variables (.env file)
```

### 2. **Security Middleware** (Applied to ALL requests)
```javascript
- securityHeaders: Adds security headers (XSS protection, etc.)
- CORS: Allows requests from your frontend
- Body Parser: Parses JSON and form data (max 10MB)
- Request Sanitizer: Cleans user input to prevent attacks
- Request Logger: Logs all requests for debugging
- Rate Limiter: Prevents too many requests (DDoS protection)
```

### 3. **MongoDB Connection**
```javascript
- Connects to MongoDB Atlas (cloud database)
- Handles connection errors gracefully
- Shows helpful error messages if connection fails
```

### 4. **API Routes** (Mounted at `/api/*`)
```javascript
/api/rate          → Exchange rate endpoints
/api/split-bill    → Split bill feature
/api/gifts         → Gift card endpoints
/api/verify        → KYC verification
/api/verify-account → Bank account verification
/api/admin         → Admin operations
/api/auth          → Login, register, JWT tokens
/api/transaction   → Transaction history
/api/user          → User profile management
/api/payments      → Payment processing (airtime, data, bank transfer)
/api/ton           → TON blockchain operations
/api/tonpay        → TON payment processing
```

### 5. **Error Handling**
```javascript
- 404 Handler: Returns error for unknown routes
- Error Handler: Catches all errors and returns proper responses
```

---

## 💾 Database Models

### **User Model** (`models/User.js`)

Stores all user information:

```javascript
{
  telegramId: String,           // Telegram user ID
  walletAddress: String,        // TON wallet address
  email: String,                 // User email
  phone: String,                // Phone number
  password: String,              // Hashed password (bcrypt)
  
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    dateOfBirth: Date
  },
  
  role: 'user' | 'admin',       // User role
  
  kyc: {
    status: 'pending' | 'verified' | 'rejected',
    bvn: String,                // Bank Verification Number
    nin: String,                // National ID Number
    documents: [...]            // Uploaded documents
  },
  
  bankAccounts: [{              // User's bank accounts
    bankName: String,
    accountNumber: String,
    accountName: String
  }],
  
  limits: {
    daily: 20000,               // Daily transaction limit (NGN)
    monthly: 500000,            // Monthly limit
    dailyUsed: 0,               // Amount used today
    monthlyUsed: 0              // Amount used this month
  },
  
  referral: {
    code: String,              // Unique referral code
    referredBy: ObjectId,      // Who referred this user
    referralCount: Number,     // How many people they referred
    earnings: Number           // Referral earnings
  },
  
  security: {
    twoFactorEnabled: Boolean,
    failedLoginAttempts: Number,
    lockUntil: Date            // Account lock time
  }
}
```

**Key Methods:**
- `comparePassword()`: Checks if password is correct
- `isLocked()`: Checks if account is locked
- `canTransact()`: Checks if user can make transaction (within limits)

### **Transaction Model** (`models/Transaction.js`)

Records all transactions:

```javascript
{
  userId: ObjectId,            // Who made the transaction
  walletAddress: String,       // TON wallet address
  type: 'airtime' | 'data' | 'payout' | 'gift' | 'split',
  amountTON: Number,          // Amount in TON
  amountNGN: Number,          // Amount in Naira
  fee: Number,                // Transaction fee
  status: 'pending' | 'completed' | 'failed',
  metadata: {                 // Additional info
    network: String,          // For airtime/data
    phone: String,
    paystackReference: String,
    vtpassTransactionId: String
  },
  bankDetails: {              // For bank transfers
    bankName: String,
    accountNumber: String,
    accountName: String
  }
}
```

### **Split Model** (`models/Split.js`)

For split bill feature:

```javascript
{
  createdBy: ObjectId,        // Who created the split
  title: String,              // "Dinner at Restaurant"
  totalAmount: Number,        // Total amount to split
  participants: [{            // People involved
    userId: ObjectId,
    amount: Number,           // Their share
    paid: Boolean             // Have they paid?
  }]
}
```

### **Gift Model** (`models/Gift.js`)

For gift cards:

```javascript
{
  senderId: ObjectId,         // Who sent the gift
  recipientId: ObjectId,      // Who receives it
  amount: Number,
  message: String,
  status: 'pending' | 'redeemed'
}
```

---

## 🛣️ API Routes

### **Authentication Routes** (`/api/auth`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register` | POST | Create new user account |
| `/login` | POST | Login and get JWT token |
| `/refresh` | POST | Refresh access token |
| `/me` | GET | Get current user info |
| `/logout` | POST | Logout (client-side token removal) |
| `/change-password` | POST | Change password |
| `/request-reset` | POST | Request password reset |
| `/reset-password` | POST | Reset password with token |
| `/telegram-auth` | POST | Authenticate via Telegram |

**How Login Works:**
1. User sends email/phone + password
2. Server finds user in database
3. Compares password (bcrypt)
4. Checks if account is locked
5. Generates JWT tokens (access + refresh)
6. Returns tokens to frontend
7. Frontend stores tokens and sends in `Authorization` header

### **Payment Routes** (`/api/payments`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/airtime` | POST | Buy airtime |
| `/data` | POST | Buy data bundle |
| `/bank-transfer` | POST | Transfer to bank account |
| `/banks` | GET | Get list of Nigerian banks |
| `/data-plans/:network` | GET | Get data plans for network |
| `/verify-account` | POST | Verify bank account number |
| `/paystack-webhook` | POST | Paystack webhook handler |

**Payment Flow Example (Airtime):**
```
1. User requests: POST /api/payments/airtime
   Body: { network: "MTN", phone: "08012345678", amountTON: 1, amountNGN: 2000 }
   
2. Middleware checks:
   - Is user authenticated? (authMiddleware)
   - Is rate limit OK? (rateLimiter)
   - Can user transact? (checks limits)
   
3. Service calls VTPass API to buy airtime
   
4. Create transaction record in database
   
5. Update user's daily/monthly limits
   
6. Return success response
```

### **User Routes** (`/api/user`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/profile` | GET | Get user profile |
| `/profile` | PUT | Update profile |
| `/wallet` | GET | Get wallet info |
| `/wallet` | PUT | Update wallet address |
| `/bank-accounts` | GET | Get bank accounts |
| `/bank-accounts` | POST | Add bank account |
| `/limits` | GET | Get transaction limits |

### **Transaction Routes** (`/api/transaction`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Get user's transactions |
| `/:id` | GET | Get specific transaction |
| `/stats` | GET | Get transaction statistics |

### **TON Routes** (`/api/ton`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/balance` | GET | Get TON wallet balance |
| `/address` | POST | Validate TON address |
| `/rate` | GET | Get TON to NGN exchange rate |

---

## 🛡️ Middleware

### **Authentication Middleware** (`middleware/auth.js`)

**What it does:**
1. Extracts JWT token from `Authorization` header
2. Verifies token is valid and not expired
3. Finds user in database
4. Checks if account is suspended/banned
5. Attaches user info to `req.user` for use in routes

**Usage:**
```javascript
router.get('/protected-route', authMiddleware, (req, res) => {
  // req.user is now available!
  res.json({ user: req.user });
});
```

### **Security Middleware** (`middleware/security.js`)

- **Security Headers**: Prevents XSS, clickjacking attacks
- **CORS**: Controls which domains can make requests
- **Request Logger**: Logs all requests for monitoring
- **Error Handler**: Catches errors and returns proper responses
- **404 Handler**: Returns error for unknown routes

### **Rate Limiter** (`middleware/rateLimiter.js`)

Prevents abuse:
- **API Limiter**: 100 requests per 15 minutes (general)
- **Auth Limiter**: 5 requests per 15 minutes (login/register)
- **Transaction Limiter**: 10 requests per minute (payments)

### **Validator** (`middleware/validator.js`)

Validates and sanitizes user input:
- Checks required fields
- Validates email format
- Validates phone numbers
- Sanitizes strings (removes dangerous characters)

---

## 🔌 Services

### **Paystack Service** (`services/paystack.js`)

Handles Nigerian payment gateway:

**Functions:**
- `verifyBankAccount()`: Verify bank account number
- `getBanks()`: Get list of Nigerian banks
- `createTransferRecipient()`: Create recipient for transfer
- `initiateTransfer()`: Send money to bank account
- `verifyTransfer()`: Check transfer status
- `getBalance()`: Get Paystack account balance
- `handlePaystackWebhook()`: Process webhook events

**How Bank Transfer Works:**
```
1. User provides: account number, bank code, amount
2. Verify account number → Get account name
3. Create transfer recipient in Paystack
4. Initiate transfer from Paystack balance
5. Save transaction record
6. Paystack sends webhook when transfer completes
7. Update transaction status
```

### **VTPass Service** (`services/vtpass.js`)

Handles airtime and data purchases:

**Functions:**
- `buyAirtime()`: Purchase airtime
- `buyData()`: Purchase data bundle
- `getDataPlans()`: Get available data plans

### **TON Service** (`services/ton.js`)

Handles TON blockchain operations:

**Functions:**
- `getBalance()`: Get TON wallet balance from blockchain
- Uses TonAPI to query blockchain

### **Notifications Service** (`services/notifications.js`)

Sends emails and SMS:
- Welcome emails
- Password reset emails
- Transaction notifications

---

## 🔄 How It All Works Together

### **Example: User Buys Airtime**

```
1. Frontend sends request:
   POST /api/payments/airtime
   Headers: { Authorization: "Bearer <JWT_TOKEN>" }
   Body: { network: "MTN", phone: "08012345678", amountTON: 1, amountNGN: 2000 }

2. Express receives request → Goes through middleware:
   ✅ Security headers added
   ✅ CORS checked
   ✅ Body parsed
   ✅ Request sanitized
   ✅ Request logged
   ✅ Rate limit checked

3. Route handler (`/api/payments/airtime`):
   ✅ authMiddleware: Verifies JWT, loads user into req.user
   ✅ transactionLimiter: Checks rate limit
   ✅ Validates request body
   ✅ Checks if user.canTransact(amountNGN) → within limits?
   
4. Service call:
   ✅ Calls vtpass.buyAirtime(network, phone, amountNGN)
   ✅ VTPass API processes payment
   ✅ Returns success/error

5. Database operations:
   ✅ Create Transaction record
   ✅ Update user.limits.dailyUsed
   ✅ Update user.limits.monthlyUsed
   ✅ Save to MongoDB

6. Response sent to frontend:
   ✅ { success: true, transaction: {...} }

7. Error handling:
   ✅ If any step fails, errorHandler catches it
   ✅ Returns proper error response
```

### **Example: User Login**

```
1. Frontend sends:
   POST /api/auth/login
   Body: { email: "user@example.com", password: "password123" }

2. Middleware:
   ✅ Rate limiter (prevents brute force)
   ✅ Body parser

3. Route handler:
   ✅ Find user by email
   ✅ Check if account is locked
   ✅ Compare password (bcrypt)
   ✅ If wrong: increment failedLoginAttempts
   ✅ If correct: reset failedLoginAttempts, update lastLogin
   ✅ Generate JWT tokens (access + refresh)
   ✅ Return tokens + user info

4. Frontend stores tokens and uses for authenticated requests
```

---

## 📊 API Endpoints Summary

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/telegram-auth` - Telegram authentication

### **Payments**
- `POST /api/payments/airtime` - Buy airtime
- `POST /api/payments/data` - Buy data
- `POST /api/payments/bank-transfer` - Transfer to bank
- `GET /api/payments/banks` - Get banks list
- `GET /api/payments/data-plans/:network` - Get data plans
- `POST /api/payments/verify-account` - Verify bank account

### **User Management**
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/wallet` - Get wallet
- `PUT /api/user/wallet` - Update wallet
- `GET /api/user/bank-accounts` - Get bank accounts
- `POST /api/user/bank-accounts` - Add bank account

### **Transactions**
- `GET /api/transaction` - Get transactions
- `GET /api/transaction/:id` - Get specific transaction
- `GET /api/transaction/stats` - Get statistics

### **TON Blockchain**
- `GET /api/ton/balance` - Get TON balance
- `POST /api/ton/address` - Validate address
- `GET /api/ton/rate` - Get exchange rate

### **Split Bill**
- `POST /api/split-bill` - Create split bill
- `GET /api/split-bill` - Get user's splits
- `POST /api/split-bill/:id/pay` - Pay your share

### **Gifts**
- `POST /api/gifts` - Send gift
- `GET /api/gifts` - Get gifts
- `POST /api/gifts/:id/redeem` - Redeem gift

### **Admin**
- `GET /api/admin/users` - Get all users
- `GET /api/admin/transactions` - Get all transactions
- `PUT /api/admin/users/:id/status` - Update user status

---

## 🔐 Security Features

1. **JWT Authentication**: Secure token-based auth
2. **Password Hashing**: Bcrypt (one-way encryption)
3. **Rate Limiting**: Prevents DDoS and brute force
4. **Input Validation**: Prevents injection attacks
5. **Security Headers**: XSS, clickjacking protection
6. **Account Locking**: Locks after 5 failed login attempts
7. **Transaction Limits**: Daily/monthly limits per user
8. **KYC Verification**: Know Your Customer verification

---

## 🚀 Environment Variables Needed

Create `server/.env` file:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://...

# JWT Secrets
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# VTPass
VTPASS_API_KEY=your-api-key
VTPASS_PUBLIC_KEY=your-public-key

# TON
TONAPI_KEY=your-tonapi-key
TONCENTER_API_KEY=your-toncenter-key

# Notifications (optional)
SENDGRID_API_KEY=...
TWILIO_ACCOUNT_SID=...
```

---

## 📝 Key Concepts

### **JWT Tokens**
- **Access Token**: Short-lived (1 hour), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access token
- Stored in frontend, sent in `Authorization: Bearer <token>` header

### **MongoDB/Mongoose**
- **Schema**: Defines data structure
- **Model**: Used to create/read/update/delete documents
- **Methods**: Custom functions on models (e.g., `comparePassword()`)

### **Middleware**
- Functions that run before route handlers
- Can modify request, check auth, validate, etc.
- Call `next()` to continue, or return response to stop

### **Services**
- Separate files for external API integrations
- Keeps code organized and reusable
- Handles API-specific logic

---

## 🎯 Next Steps

1. **Set up environment variables** in `server/.env`
2. **Test endpoints** using Postman or your frontend
3. **Add more features** as needed
4. **Monitor logs** for errors
5. **Set up webhooks** for Paystack (production)

---

This backend is well-structured and follows best practices! 🎉


