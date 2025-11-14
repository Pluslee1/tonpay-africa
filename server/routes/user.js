import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -security.twoFactorSecret -security.pin');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, phone, email, dateOfBirth } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (phone) user.phone = phone;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = email.toLowerCase();
    }
    if (dateOfBirth) user.profile.dateOfBirth = dateOfBirth;

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email or phone already in use' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { defaultConversion, autoConvertGifts, notifications, language, currency } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (defaultConversion) user.preferences.defaultConversion = defaultConversion;
    if (typeof autoConvertGifts === 'boolean') user.preferences.autoConvertGifts = autoConvertGifts;
    if (notifications) user.preferences.notifications = { ...user.preferences.notifications, ...notifications };
    if (language) user.preferences.language = language;
    if (currency) user.preferences.currency = currency;

    await user.save();
    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bank-account', authMiddleware, async (req, res) => {
  try {
    const { bankName, bankCode, accountNumber, accountName, isDefault } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (isDefault) {
      user.bankAccounts.forEach(acc => acc.isDefault = false);
    }

    user.bankAccounts.push({
      bankName,
      bankCode,
      accountNumber,
      accountName,
      isDefault: isDefault || user.bankAccounts.length === 0
    });

    await user.save();
    res.json({ success: true, bankAccounts: user.bankAccounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/bank-account/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.bankAccounts = user.bankAccounts.filter(acc => acc._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, bankAccounts: user.bankAccounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/security/pin', authMiddleware, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 4 digits' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const bcrypt = await import('bcryptjs');
    user.security.pin = await bcrypt.hash(pin, 10);
    await user.save();

    res.json({ success: true, message: 'PIN set successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const Transaction = (await import('../models/Transaction.js')).default;
    const transactions = await Transaction.find({ walletAddress: req.user?.walletAddress });
    
    const totalSpent = transactions.reduce((sum, tx) => sum + (tx.amountNGN || 0), 0);
    const totalTransactions = transactions.length;
    
    res.json({
      success: true,
      stats: {
        totalSpent,
        totalTransactions,
        kycStatus: req.user?.kyc?.status || 'pending',
        dailyLimit: req.user?.limits?.daily || 20000,
        dailyUsed: req.user?.limits?.dailyUsed || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
