import express from 'express';
import * as paystack from '../services/paystack.js';

const router = express.Router();

// Verify bank account using Paystack (with demo fallback)
router.post('/', async (req, res) => {
  try {
    const { bankCode, accountNumber } = req.body;
    
    console.log('🔍 Bank verification request:', { bankCode, accountNumber });
    
    if (!bankCode || !accountNumber) {
      console.warn('❌ Missing bankCode or accountNumber');
      return res.status(400).json({ success: false, error: 'bankCode and accountNumber required' });
    }

    // Check if Paystack key is configured
    const hasValidKey = process.env.PAYSTACK_SECRET_KEY && 
                        process.env.PAYSTACK_SECRET_KEY !== 'your_key_here' &&
                        process.env.PAYSTACK_SECRET_KEY.startsWith('sk_');
    
    if (!hasValidKey) {
      console.warn('⚠️  Paystack key not configured properly, using DEMO MODE for verification');
      console.log('   Key exists:', !!process.env.PAYSTACK_SECRET_KEY);
      console.log('   Key starts with sk_:', process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_'));
      
      // Demo mode - return mock account name
      const mockAccountName = `${accountNumber.slice(0, 4)} TEST ACCOUNT`;
      
      console.log('✅ DEMO MODE: Returning mock account:', mockAccountName);
      
      return res.json({ 
        success: true, 
        accountName: mockAccountName,
        data: { accountName: mockAccountName },
        demo: true // Indicate this is demo data
      });
    }

    console.log('🔑 Attempting Paystack verification with valid key...');
    
    // Use real Paystack verification
    const result = await paystack.verifyBankAccount(accountNumber, bankCode);
    
    console.log('📊 Paystack result:', { success: result.success, error: result.error });
    
    if (!result.success) {
      // If Paystack fails (invalid key, network error), fall back to demo mode
      console.warn('⚠️  Paystack verification failed, using DEMO MODE:', result.error);
      
      const mockAccountName = `${accountNumber.slice(0, 4)} TEST ACCOUNT`;
      
      console.log('✅ DEMO MODE FALLBACK: Returning mock account:', mockAccountName);
      
      return res.json({ 
        success: true, 
        accountName: mockAccountName,
        data: { accountName: mockAccountName },
        demo: true,
        note: 'Using demo mode - configure PAYSTACK_SECRET_KEY for real verification'
      });
    }

    console.log('✅ Real Paystack verification success:', result.accountName);
    
    res.json({ 
      success: true, 
      accountName: result.accountName,
      data: { accountName: result.accountName }
    });
  } catch (error) {
    console.error('❌ Bank verification EXCEPTION:', error);
    
    // Even on error, provide demo fallback
    const mockAccountName = `DEMO TEST ACCOUNT`;
    
    console.log('✅ EXCEPTION FALLBACK: Returning mock account:', mockAccountName);
    
    res.json({ 
      success: true, 
      accountName: mockAccountName,
      data: { accountName: mockAccountName },
      demo: true,
      note: 'Using demo mode due to error - configure PAYSTACK_SECRET_KEY for real verification'
    });
  }
});

export default router;







