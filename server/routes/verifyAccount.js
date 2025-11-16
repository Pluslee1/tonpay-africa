import express from 'express';
import * as paystack from '../services/paystack.js';

const router = express.Router();

// Verify bank account using Paystack
router.post('/', async (req, res) => {
  try {
    const { bankCode, accountNumber } = req.body;
    
    if (!bankCode || !accountNumber) {
      return res.status(400).json({ success: false, error: 'bankCode and accountNumber required' });
    }

    // Use real Paystack verification
    const result = await paystack.verifyBankAccount(accountNumber, bankCode);
    
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error || 'Account verification failed' });
    }

    res.json({ 
      success: true, 
      accountName: result.accountName,
      data: { accountName: result.accountName } // Also include in data for compatibility
    });
  } catch (error) {
    console.error('Bank verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;







