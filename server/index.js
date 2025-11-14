import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { securityHeaders, corsConfig, requestLogger, errorHandler, notFoundHandler } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { sanitizeRequestBody } from './middleware/validator.js';
import rateRoutes from './routes/rate.js';
import splitBillRoutes from './routes/splitBill.js';
import giftRoutes from './routes/gift.js';
import verifyRoutes from './routes/verify.js';
import verifyAccountRoutes from './routes/verifyAccount.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transaction.js';
import userRoutes from './routes/user.js';
import paymentsRoutes from './routes/payments.js';
import tonRoutes from './routes/ton.js';
import tonpayRoutes from './routes/tonpay.js';
import kycRoutes from './routes/kyc.js';
import * as withdrawalProcessor from './services/withdrawalProcessor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(securityHeaders);
app.use(cors(corsConfig));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeRequestBody);
app.use(requestLogger);
app.use(apiLimiter);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tonpay-africa';

console.log('🔌 Attempting to connect to MongoDB...');
console.log('📍 URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // 10 second timeout
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 10000, // 10 second connection timeout
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 1, // Maintain at least 1 socket connection
  family: 4 // Use IPv4, skip trying IPv6
})
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('\n💡 Troubleshooting tips:');
    if (err.message.includes('ECONNREFUSED')) {
      console.error('   - MongoDB is not running locally');
      console.error('   - Install MongoDB: https://www.mongodb.com/try/download/community');
      console.error('   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
      console.error('   - Start local MongoDB: mongod (or as a service)');
    } else if (err.message.includes('authentication failed')) {
      console.error('   - Check your MongoDB username and password');
      console.error('   - Verify connection string format');
    } else if (err.message.includes('timeout')) {
      console.error('   - Check if your IP is whitelisted in MongoDB Atlas');
      console.error('   - Go to Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)');
    }
    console.error('\n⚠️  Server will continue but database operations will fail!\n');
  });

// MongoDB connection event handlers
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    name: 'TonPay Africa API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      payments: '/api/payments',
      user: '/api/user',
      transactions: '/api/transaction',
      ton: '/api/ton',
      tonpay: '/api/tonpay',
      splitBill: '/api/split-bill',
      gifts: '/api/gifts',
      admin: '/api/admin',
      rate: '/api/rate',
      verify: '/api/verify'
    },
    documentation: 'See BACKEND_EXPLANATION.md for API documentation'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Development endpoint to clear rate limits (only in development)
// This endpoint should be BEFORE the apiLimiter middleware, but since we skip it in the limiter, it's fine here
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/clear-rate-limit', async (req, res) => {
    try {
      const { clearRateLimit } = await import('./middleware/rateLimiter.js');
      clearRateLimit(req.body.ip);
      res.json({ success: true, message: 'Rate limit cleared for ' + (req.body.ip || 'all IPs') });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

// Routes
app.use('/api/rate', rateRoutes);
app.use('/api/split-bill', splitBillRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/verify-account', verifyAccountRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/ton', tonRoutes);
app.use('/api/tonpay', tonpayRoutes);
app.use('/api/kyc', kycRoutes);

// Debug: Log registered routes
console.log('📋 Registered API routes:');
console.log('   GET  /api/transaction - Get user transactions');
console.log('   POST /api/transaction/convert - Create conversion transaction');

// Paystack webhook handler (must handle raw body, before error handlers)
app.post('/api/webhooks/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature (add this in production)
    // const signature = req.headers['x-paystack-signature'];
    // if (!verifyPaystackSignature(req.body, signature)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }
    
    const webhookData = JSON.parse(req.body.toString());
    const result = await withdrawalProcessor.handleTransferWebhook(webhookData);
    
    if (result.success) {
      res.json({ success: true, message: 'Webhook processed' });
    } else {
      res.status(400).json({ success: false, message: result.message || 'Webhook processing failed' });
    }
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security middleware enabled`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`⚡ Rate limiting active`);
  } else {
    console.log(`⚡ Rate limiting DISABLED (development mode)`);
  }
  
  // Start automatic withdrawal processing (every 5 minutes)
  if (process.env.ENABLE_AUTO_PROCESSING !== 'false') {
    console.log(`🤖 Auto-processing enabled (runs every 5 minutes)`);
    
    // Process immediately on startup (optional)
    setTimeout(async () => {
      try {
        const result = await withdrawalProcessor.processPendingWithdrawals();
        console.log(`📊 Initial auto-processing: ${result.processed} processed, ${result.skipped} skipped, ${result.failed} failed`);
      } catch (error) {
        console.error('Initial auto-processing error:', error);
      }
    }, 30000); // Wait 30 seconds after startup
    
    // Schedule automatic processing every 5 minutes
    setInterval(async () => {
      try {
        const result = await withdrawalProcessor.processPendingWithdrawals();
        if (result.processed > 0 || result.failed > 0) {
          console.log(`📊 Auto-processing: ${result.processed} processed, ${result.skipped} skipped, ${result.failed} failed`);
        }
      } catch (error) {
        console.error('Auto-processing error:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  } else {
    console.log(`⏸️  Auto-processing disabled (set ENABLE_AUTO_PROCESSING=false to disable)`);
  }
});
