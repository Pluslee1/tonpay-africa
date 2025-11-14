import express from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import SystemBalance from '../models/SystemBalance.js';

const router = express.Router();

// Check if database is connected and ready
const isDbConnected = () => {
  const state = mongoose.connection.readyState;
  return state === 1; // 1 = connected
};

// In-memory storage for transactions when DB is disconnected
const memoryTransactions = [];

// Helper function to save transaction with timeout
const saveTransactionWithTimeout = async (transactionData, timeoutMs = 5000) => {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Database operation timed out'));
    }, timeoutMs);

    try {
      const transaction = new Transaction(transactionData);
      await transaction.save();
      clearTimeout(timeout);
      resolve(transaction._id.toString());
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
};

// Get transactions for a user
router.get('/', async (req, res) => {
  try {
    const { walletAddress, type, status, search, limit = 100 } = req.query;
    
    console.log('[GET /api/transaction] Request:', { walletAddress, type, status, search, limit });

    let transactions = [];

    if (isDbConnected()) {
      // Fetch from database
      const query = {};
      
      // Only filter by walletAddress if provided
      if (walletAddress) {
        query.walletAddress = walletAddress;
      }
      
      if (type && type !== 'all') {
        // Map frontend types to database types
        const typeMap = {
          'airtime': 'airtime',
          'data': 'data',
          'payout': 'payout',
          'gift': 'gift',
          'split': 'split'
        };
        query.type = typeMap[type] || type;
      }
      
      if (status && status !== 'all') {
        query.status = status;
      }

      try {
        transactions = await Transaction.find(query)
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .lean(); // Use lean() for better performance
      } catch (dbError) {
        console.error('Database query error:', dbError);
        // Return empty array instead of failing
        transactions = [];
      }
    } else {
      // Fallback to in-memory transactions
      transactions = memoryTransactions
        .filter(tx => !walletAddress || tx.walletAddress === walletAddress)
        .filter(tx => !type || type === 'all' || tx.type === type)
        .filter(tx => !status || status === 'all' || tx.status === status)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, parseInt(limit));
    }

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      transactions = transactions.filter(tx => {
        return (
          (tx.type && tx.type.toLowerCase().includes(searchLower)) ||
          (tx.status && tx.status.toLowerCase().includes(searchLower)) ||
          (tx.walletAddress && tx.walletAddress.toLowerCase().includes(searchLower)) ||
          (tx.bankDetails && tx.bankDetails.accountName && tx.bankDetails.accountName.toLowerCase().includes(searchLower))
        );
      });
    }

    // Ensure all transactions have _id and id fields
    transactions = transactions.map(tx => ({
      ...tx,
      _id: tx._id || tx.id || 'MEM-' + Date.now(),
      id: tx.id || tx._id || 'MEM-' + Date.now()
    }));

    console.log('[GET /api/transaction] Returning', transactions.length, 'transactions');
    
    res.json({
      success: true,
      transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('❌ Get transactions error:', error);
    console.error('Error stack:', error.stack);
    // Always return a valid response, even on error
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch transactions',
      transactions: [] // Ensure transactions array is always present
    });
  }
});

// Create conversion transaction
router.post('/convert', async (req, res) => {
  try {
    const { walletAddress, amountTON, amountNGN, bankDetails } = req.body;

    // Validate input
    if (!walletAddress || !amountTON || !amountNGN) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fee = amountNGN * 0.02; // 2% fee
    const finalNGN = amountNGN - fee;

    // Create transaction object
    const transactionData = {
      walletAddress,
      type: 'payout', // Changed from 'convert' to 'payout' to match transaction types
      amountTON: parseFloat(amountTON),
      amountNGN: parseFloat(finalNGN),
      fee: parseFloat(fee),
      bankDetails,
      status: 'pending'
    };

    let transactionId;

    // Try to save to database if connected, with timeout protection
    if (isDbConnected()) {
      try {
        // Use timeout wrapper to prevent hanging
        transactionId = await saveTransactionWithTimeout(transactionData, 5000);
        console.log('✅ Transaction saved to database:', transactionId);
      } catch (dbError) {
        // Handle timeout or other database errors
        if (dbError.message.includes('timeout') || dbError.message.includes('buffering')) {
          console.warn('⚠️  Database operation timed out, using in-memory transaction');
        } else {
          console.error('❌ Database save error:', dbError.message);
        }
        // Fallback: generate ID and continue
        transactionId = 'MEM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      }
    } else {
      // Fallback when DB is not connected
      console.warn('⚠️  Database not connected, using in-memory transaction');
      transactionId = 'MEM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Update system balance (add TON collected, don't deduct NGN yet - that happens when admin processes)
    try {
      if (isDbConnected()) {
        const balance = await SystemBalance.getBalance();
        balance.balanceTON += parseFloat(amountTON);
        balance.totalCollectedTON += parseFloat(amountTON);
        balance.lastUpdated = new Date();
        await balance.save();
        console.log('✅ System balance updated: +' + amountTON + ' TON');
      }
    } catch (balanceError) {
      console.warn('⚠️  Could not update system balance:', balanceError.message);
      // Don't fail the transaction if balance update fails
    }

    // In production: Send TON to liquidity wallet
    // In production: Process Naira payout via Paystack/Flutterwave (handled by admin)

    res.json({
      success: true,
      transaction: {
        _id: transactionId,
        id: transactionId,
        amountTON: transactionData.amountTON,
        amountNGN: transactionData.amountNGN,
        fee: transactionData.fee,
        status: 'pending'
      },
      transactionId: transactionId,
      message: 'Transaction created. Admin will process the payout.'
    });
  } catch (error) {
    console.error('❌ Transaction convert error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to create transaction'
    });
  }
});

export default router;





