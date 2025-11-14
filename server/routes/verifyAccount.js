import express from 'express';

const router = express.Router();

// Verify bank account (mock)
router.post('/', async (req, res) => {
  try {
    const { bankCode, accountNumber } = req.body;
    
    if (!bankCode || !accountNumber) {
      return res.json({ success: false, error: 'bankCode and accountNumber required' });
    }

    // Mock account name
    const accountName = `Account Holder ${accountNumber.slice(-4)}`;
    
    res.json({ 
      success: true, 
      data: { accountName } 
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

export default router;






