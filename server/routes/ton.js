import express from 'express';
import * as ton from '../services/ton.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get TON balance for an address
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const result = await ton.getBalance(address);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      balance: result.balance,
      balanceNano: result.balanceNano,
      address: result.address,
      status: result.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction history
router.get('/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await ton.getTransactionHistory(address, limit);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      transactions: result.transactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify transaction
router.get('/verify/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const result = await ton.verifyTransaction(txHash);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      confirmed: result.confirmed,
      fee: result.fee,
      timestamp: result.timestamp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get TON to NGN exchange rate
router.get('/rate', async (req, res) => {
  try {
    const result = await ton.getTONtoNGNRate();
    
    res.json({
      success: true,
      rate: result.rate,
      timestamp: result.timestamp
    });
  } catch (error) {
    res.status(500).json({ 
      success: true, 
      rate: 2000, 
      error: 'Using fallback rate' 
    });
  }
});

// Estimate gas fee
router.post('/estimate-fee', async (req, res) => {
  try {
    const { destinationAddress, amount } = req.body;
    
    const result = await ton.estimateGasFee(destinationAddress, amount);
    
    res.json({
      success: true,
      fee: result.fee,
      feeNano: result.feeNano
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate address
router.post('/validate-address', async (req, res) => {
  try {
    const { address } = req.body;
    const result = ton.validateAddress(address);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      valid: false, 
      error: error.message 
    });
  }
});

export default router;
