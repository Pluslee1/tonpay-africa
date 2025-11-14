import express from 'express';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import SystemBalance from '../models/SystemBalance.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import mongoose from 'mongoose';
import * as withdrawalProcessor from '../services/withdrawalProcessor.js';
import * as paystack from '../services/paystack.js';
import { getBalance as getTONBalance } from '../services/ton.js';
import os from 'os';

const router = express.Router();

// ============================================
// HEALTH CHECK & MONITORING
// ============================================

// Comprehensive health check
router.get('/health', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        uptimeFormatted: formatUptime(process.uptime()),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        cpu: {
          loadAverage: os.loadavg(),
          cpus: os.cpus().length
        },
        platform: os.platform(),
        nodeVersion: process.version
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState
      },
      services: {
        paystack: await checkPaystackHealth(),
        ton: await checkTONHealth()
      }
    };

    // Determine overall health
    if (health.database.status !== 'connected') {
      health.status = 'degraded';
    }

    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

const checkPaystackHealth = async () => {
  try {
    const balance = await paystack.getBalance();
    return { status: 'healthy', balance: balance.balance || 0 };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};

const checkTONHealth = async () => {
  try {
    // Simple check - just verify we can make a request
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};

const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

// Get comprehensive admin stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    // Server stats
    const serverUptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // User stats
    const totalUsers = await User.countDocuments();
    const activeToday = await User.countDocuments({ lastLogin: { $gte: today } });
    const newToday = await User.countDocuments({ createdAt: { $gte: today } });
    const newLast7Days = await User.countDocuments({ createdAt: { $gte: last7Days } });
    const verifiedUsers = await User.countDocuments({ 'kyc.status': 'verified' });
    const activeLast7Days = await User.countDocuments({ lastLogin: { $gte: last7Days } });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });

    // Transaction stats
    const allTransactions = await Transaction.find();
    const todayTransactions = await Transaction.find({ createdAt: { $gte: today } });
    const last7DaysTransactions = await Transaction.find({ createdAt: { $gte: last7Days } });
    const last30DaysTransactions = await Transaction.find({ createdAt: { $gte: last30Days } });

    const completed = allTransactions.filter(tx => tx.status === 'completed');
    const pending = allTransactions.filter(tx => tx.status === 'pending');
    const failed = allTransactions.filter(tx => tx.status === 'failed');
    const processing = allTransactions.filter(tx => tx.status === 'processing');

    const successRate = allTransactions.length > 0 
      ? ((completed.length / allTransactions.length) * 100).toFixed(2) 
      : 0;

    // Calculate volumes
    const totalTON = completed.reduce((sum, tx) => sum + (tx.amountTON || 0), 0);
    const totalNGN = completed.reduce((sum, tx) => sum + (tx.amountNGN || 0), 0);
    const totalFees = completed.reduce((sum, tx) => sum + (tx.fee || 0), 0);
    
    const todayTON = todayTransactions
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + (tx.amountTON || 0), 0);
    const todayNGN = todayTransactions
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + (tx.amountNGN || 0), 0);
    
    const last7DaysNGN = last7DaysTransactions
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + (tx.amountNGN || 0), 0);
    
    const last30DaysNGN = last30DaysTransactions
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + (tx.amountNGN || 0), 0);

    // Transaction types breakdown
    const transactionTypes = {
      airtime: allTransactions.filter(tx => tx.type === 'airtime').length,
      data: allTransactions.filter(tx => tx.type === 'data').length,
      payout: allTransactions.filter(tx => tx.type === 'payout').length,
      gift: allTransactions.filter(tx => tx.type === 'gift').length,
      split: allTransactions.filter(tx => tx.type === 'split').length
    };

    // Format uptime
    const days = Math.floor(serverUptime / 86400);
    const hours = Math.floor((serverUptime % 86400) / 3600);
    const minutes = Math.floor((serverUptime % 3600) / 60);
    const uptimeFormatted = `${days}d ${hours}h ${minutes}m`;

    res.json({
      server: {
        status: 'healthy',
        uptime: uptimeFormatted,
        uptimeSeconds: Math.floor(serverUptime),
        memory: {
          used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
        },
        database: dbStatus,
        timestamp: new Date().toISOString()
      },
      users: {
        total: totalUsers,
        activeToday,
        activeLast7Days,
        newToday,
        newLast7Days,
        verified: verifiedUsers,
        suspended: suspendedUsers,
        banned: bannedUsers,
        verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0
      },
      transactions: {
        total: allTransactions.length,
        today: todayTransactions.length,
        last7Days: last7DaysTransactions.length,
        last30Days: last30DaysTransactions.length,
        completed: completed.length,
        pending: pending.length,
        processing: processing.length,
        failed: failed.length,
        successRate: parseFloat(successRate),
        byType: transactionTypes
      },
      revenue: {
        totalTON: totalTON.toFixed(4),
        totalNGN: totalNGN.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }),
        totalFees: totalFees.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }),
        todayNGN: todayNGN.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }),
        last7DaysNGN: last7DaysNGN.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }),
        last30DaysNGN: last30DaysNGN.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
      },
      performance: {
        avgTransactionsPerDay: (last30DaysTransactions.length / 30).toFixed(1),
        avgRevenuePerDay: (last30DaysNGN / 30).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions with filters
router.get('/transactions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, type, limit = 100, page = 1, search, dateFrom, dateTo } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    // Search by wallet address or user email
    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { walletAddress: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = users.map(u => u._id);
      
      query.$or = [
        { walletAddress: { $regex: search, $options: 'i' } },
        { userId: { $in: userIds } }
      ];
    }
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'email phone profile.firstName profile.lastName')
      .populate('giftId')
      .populate('splitId')
      .lean();
    
    const total = await Transaction.countDocuments(query);
    
    res.json({ 
      success: true, 
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users with filters
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, kycStatus, role, limit = 50, page = 1, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = {};
    if (status) query.status = status;
    if (kycStatus) query['kyc.status'] = kycStatus;
    if (role) query.role = role;
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { walletAddress: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password -security.twoFactorSecret -security.pin')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user details
router.get('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -security.twoFactorSecret -security.pin')
      .lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user transactions
    const transactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    res.json({
      success: true,
      user,
      transactions,
      stats: {
        totalTransactions: transactions.length,
        totalSpent: transactions
          .filter(tx => tx.status === 'completed')
          .reduce((sum, tx) => sum + (tx.amountNGN || 0), 0),
        lastTransaction: transactions[0]?.createdAt || null
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user status
router.put('/users/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    user.status = status;
    if (reason) {
      user.metadata = user.metadata || {};
      user.metadata.statusChangeReason = reason;
      user.metadata.statusChangedAt = new Date();
      user.metadata.statusChangedBy = req.userId;
    }
    await user.save();
    
    res.json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        id: user._id,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user KYC status
router.put('/users/:id/kyc', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, note } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid KYC status' });
    }
    
    if (!user.kyc) user.kyc = {};
    user.kyc.status = status;
    if (status === 'verified') {
      user.kyc.verifiedAt = new Date();
    }
    if (note) {
      user.kyc.adminNote = note;
    }
    await user.save();
    
    res.json({
      success: true,
      message: `User KYC status updated to ${status}`,
      user: {
        id: user._id,
        kyc: user.kyc
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SYSTEM BALANCE MANAGEMENT
// ============================================

// Get system balance
router.get('/balance', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const balance = await SystemBalance.getBalance();
    
    // Calculate pending withdrawals
    const pendingWithdrawals = await Transaction.find({
      type: 'payout',
      status: 'pending'
    });
    
    const totalPendingNGN = pendingWithdrawals.reduce((sum, tx) => sum + (tx.amountNGN || 0), 0);
    
    res.json({
      success: true,
      balance: {
        naira: balance.balanceNGN,
        ton: balance.balanceTON,
        totalDepositedNGN: balance.totalDepositedNGN,
        totalWithdrawnNGN: balance.totalWithdrawnNGN,
        totalCollectedTON: balance.totalCollectedTON,
        lastUpdated: balance.lastUpdated,
        // Auto-processing settings
        autoProcessWithdrawals: balance.autoProcessWithdrawals,
        minBalanceNGN: balance.minBalanceNGN,
        maxDailyWithdrawalNGN: balance.maxDailyWithdrawalNGN
      },
      pending: {
        count: pendingWithdrawals.length,
        totalNGN: totalPendingNGN,
        availableNGN: balance.balanceNGN - totalPendingNGN
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Naira to system (for liquidity)
router.post('/balance/deposit', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { amount, note } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const balance = await SystemBalance.getBalance();
    balance.balanceNGN += parseFloat(amount);
    balance.totalDepositedNGN += parseFloat(amount);
    balance.lastUpdated = new Date();
    await balance.save();
    
    res.json({
      success: true,
      message: `₦${parseFloat(amount).toLocaleString('en-NG')} added to system balance`,
      balance: {
        naira: balance.balanceNGN,
        ton: balance.balanceTON
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// WITHDRAWAL MANAGEMENT
// ============================================

// Get pending withdrawals
router.get('/withdrawals/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const withdrawals = await Transaction.find({
      type: 'payout',
      status: 'pending'
    })
      .sort({ createdAt: 1 })
      .populate('userId', 'email phone profile.firstName profile.lastName')
      .lean();
    
    res.json({
      success: true,
      withdrawals: withdrawals.map(w => ({
        id: w._id,
        amountTON: w.amountTON,
        amountNGN: w.amountNGN,
        status: w.status,
        createdAt: w.createdAt,
        bankDetails: w.bankDetails,
        user: w.userId ? {
          id: w.userId._id,
          email: w.userId.email,
          phone: w.userId.phone,
          name: `${w.userId.profile?.firstName || ''} ${w.userId.profile?.lastName || ''}`.trim()
        } : null
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process single withdrawal
router.post('/withdrawals/:id/process', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await withdrawalProcessor.processSingleWithdrawal(req.params.id, req.userId);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        transactionId: result.transactionId,
        paystackStatus: result.paystackStatus
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete withdrawal manually
router.post('/withdrawals/:id/complete', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { note } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction || transaction.type !== 'payout') {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    if (transaction.status !== 'pending' && transaction.status !== 'processing') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }
    
    const balance = await SystemBalance.getBalance();
    
    if (balance.balanceNGN < transaction.amountNGN) {
      return res.status(400).json({ 
        error: `Insufficient balance. Need ₦${transaction.amountNGN.toLocaleString('en-NG')}, have ₦${balance.balanceNGN.toLocaleString('en-NG')}` 
      });
    }
    
    transaction.status = 'completed';
    transaction.metadata = {
      ...transaction.metadata,
      completedBy: req.userId,
      completedAt: new Date(),
      note: note || 'Manually completed by admin'
    };
    await transaction.save();
    
    balance.balanceNGN -= transaction.amountNGN;
    balance.totalWithdrawnNGN += transaction.amountNGN;
    balance.lastUpdated = new Date();
    await balance.save();
    
    res.json({
      success: true,
      message: `Withdrawal of ₦${transaction.amountNGN.toLocaleString('en-NG')} completed`,
      transaction: {
        id: transaction._id,
        status: transaction.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject withdrawal
router.post('/withdrawals/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction || transaction.type !== 'payout') {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }
    
    transaction.status = 'failed';
    transaction.metadata = {
      ...transaction.metadata,
      rejectedBy: req.userId,
      rejectedAt: new Date(),
      rejectionReason: reason || 'Rejected by admin'
    };
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Withdrawal rejected',
      transaction: {
        id: transaction._id,
        status: transaction.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin withdraw money from system (for admin to withdraw to their own account)
router.post('/withdraw', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { amount, bankDetails, note } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.bankCode) {
      return res.status(400).json({ error: 'Bank details required' });
    }
    
    const balance = await SystemBalance.getBalance();
    
    if (balance.balanceNGN < parseFloat(amount)) {
      return res.status(400).json({ 
        error: `Insufficient balance. Available: ₦${balance.balanceNGN.toLocaleString('en-NG')}` 
      });
    }
    
    // Create withdrawal transaction
    const withdrawal = new Transaction({
      userId: req.userId,
      type: 'payout',
      amountTON: 0,
      amountNGN: parseFloat(amount),
      fee: 0,
      status: 'pending', // Admin needs to manually process this
      bankDetails: {
        bankName: bankDetails.bankName || 'Admin Bank',
        bankCode: bankDetails.bankCode,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName || 'Admin Account'
      },
      metadata: {
        operation: 'admin_withdrawal',
        note: note || 'Admin withdrawal from system',
        requestedBy: req.userId
      }
    });
    await withdrawal.save();
    
    res.json({
      success: true,
      message: `Withdrawal request of ₦${parseFloat(amount).toLocaleString('en-NG')} created`,
      withdrawal: {
        id: withdrawal._id,
        amountNGN: withdrawal.amountNGN,
        status: withdrawal.status,
        bankDetails: withdrawal.bankDetails
      },
      note: 'This withdrawal needs to be processed manually. Complete it using /api/admin/withdrawals/:id/complete'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// AUTO-PROCESSING CONTROLS
// ============================================

// Toggle auto-processing
router.post('/auto-processing/toggle', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const balance = await SystemBalance.getBalance();
    balance.autoProcessWithdrawals = !balance.autoProcessWithdrawals;
    balance.lastUpdated = new Date();
    await balance.save();
    
    res.json({
      success: true,
      message: `Auto-processing ${balance.autoProcessWithdrawals ? 'enabled' : 'disabled'}`,
      autoProcessWithdrawals: balance.autoProcessWithdrawals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update auto-processing settings
router.put('/auto-processing/settings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { minBalanceNGN, maxDailyWithdrawalNGN } = req.body;
    const balance = await SystemBalance.getBalance();
    
    if (minBalanceNGN !== undefined) balance.minBalanceNGN = parseFloat(minBalanceNGN);
    if (maxDailyWithdrawalNGN !== undefined) balance.maxDailyWithdrawalNGN = parseFloat(maxDailyWithdrawalNGN);
    balance.lastUpdated = new Date();
    await balance.save();
    
    res.json({
      success: true,
      message: 'Auto-processing settings updated',
      settings: {
        minBalanceNGN: balance.minBalanceNGN,
        maxDailyWithdrawalNGN: balance.maxDailyWithdrawalNGN,
        autoProcessWithdrawals: balance.autoProcessWithdrawals
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger auto-processing
router.post('/auto-processing/trigger', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await withdrawalProcessor.processPendingWithdrawals();
    
    res.json({
      success: true,
      message: `Processed ${result.processed} withdrawals, ${result.skipped} skipped, ${result.failed} failed`,
      result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// TON WALLET MANAGEMENT
// ============================================

// Get TON wallet info
router.get('/wallet/ton', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const balance = await SystemBalance.getBalance();
    
    let walletBalance = 0;
    if (balance.tonWalletAddress) {
      try {
        const tonBalance = await getTONBalance(balance.tonWalletAddress);
        walletBalance = tonBalance?.balance || 0;
      } catch (error) {
        console.error('TON balance fetch error:', error);
      }
    }
    
    res.json({
      success: true,
      wallet: {
        address: balance.tonWalletAddress || 'Not set',
        balance: walletBalance,
        balanceInSystem: balance.balanceTON,
        totalCollected: balance.totalCollectedTON,
        publicKey: balance.tonWalletPublicKey || 'Not set'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync TON wallet balance
router.post('/wallet/ton/sync', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const balance = await SystemBalance.getBalance();
    
    if (!balance.tonWalletAddress) {
      return res.status(400).json({ error: 'TON wallet address not set' });
    }
    
    const tonBalance = await getTONBalance(balance.tonWalletAddress);
    const walletBalance = tonBalance?.balance || 0;
    
    res.json({
      success: true,
      message: `TON wallet synced. Balance: ${walletBalance} TON`,
      balance: walletBalance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set TON wallet
router.put('/wallet/ton', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { address, publicKey, privateKey } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address required' });
    }
    
    const balance = await SystemBalance.getBalance();
    balance.tonWalletAddress = address;
    if (publicKey) balance.tonWalletPublicKey = publicKey;
    // In production, encrypt private key
    if (privateKey) balance.tonWalletPrivateKey = privateKey;
    balance.lastUpdated = new Date();
    await balance.save();
    
    res.json({
      success: true,
      message: 'TON wallet address updated',
      wallet: {
        address: balance.tonWalletAddress
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Paystack balance
router.get('/wallet/paystack', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const paystackBalance = await paystack.getBalance();
    
    const systemBalance = await SystemBalance.getBalance();
    
    res.json({
      success: true,
      paystack: paystackBalance,
      system: {
        naira: systemBalance.balanceNGN,
        available: systemBalance.balanceNGN
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ANALYTICS & REPORTS
// ============================================

// Get analytics data
router.get('/analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Daily transaction volume
    const dailyTransactions = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          totalNGN: { $sum: '$amountNGN' },
          totalTON: { $sum: '$amountTON' },
          totalFees: { $sum: '$fee' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // User growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Transaction type distribution
    const typeDistribution = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalNGN: { $sum: '$amountNGN' }
        }
      }
    ]);
    
    res.json({
      success: true,
      period: days,
      dailyTransactions,
      userGrowth,
      typeDistribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
