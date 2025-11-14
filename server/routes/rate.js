import express from 'express';
import * as ton from '../services/ton.js';

const router = express.Router();

// Get TON to NGN rate (uses real CoinGecko API)
router.get('/', async (req, res) => {
  try {
    const result = await ton.getTONtoNGNRate();
    
    if (result.success) {
      res.json({ 
        success: true, 
        rate: result.rate,
        timestamp: result.timestamp || Date.now()
      });
    } else {
      // Fallback to default rate if API fails
      res.json({ 
        success: true, 
        rate: result.rate || 2000,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('Rate fetch error:', error);
    // Fallback to default rate
    res.json({ 
      success: true, 
      rate: 2000,
      timestamp: Date.now()
    });
  }
});

export default router;





