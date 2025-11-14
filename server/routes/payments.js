import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { transactionLimiter } from '../middleware/rateLimiter.js';
import { validateTransaction, validateBankAccount } from '../middleware/validator.js';
import * as paystack from '../services/paystack.js';
import * as vtpass from '../services/vtpass.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

router.post('/airtime', authMiddleware, transactionLimiter, async (req, res) => {
  try {
    const { network, phone, amountTON, amountNGN, rate } = req.body;
    
    if (!req.user.canTransact(amountNGN)) {
      return res.status(403).json({ 
        error: 'Transaction exceeds your daily limit. Please verify your account to increase limits.' 
      });
    }

    const requestId = `TP-AIR-${Date.now()}-${req.userId}`;
    
    const result = await vtpass.buyAirtime(network, phone, amountNGN, requestId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const transaction = new Transaction({
      userId: req.userId,
      walletAddress: req.user.walletAddress,
      type: 'airtime',
      amountTON,
      amountNGN,
      status: 'completed',
      metadata: {
        network,
        phone,
        vtpassRequestId: requestId,
        vtpassTransactionId: result.transactionId
      }
    });
    await transaction.save();

    req.user.limits.dailyUsed += amountNGN;
    req.user.limits.monthlyUsed += amountNGN;
    await req.user.save();

    res.json({
      success: true,
      transaction: {
        id: transaction._id,
        status: transaction.status,
        message: result.message
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/data', authMiddleware, transactionLimiter, async (req, res) => {
  try {
    const { network, phone, planId, amountTON, amountNGN, rate } = req.body;
    
    if (!req.user.canTransact(amountNGN)) {
      return res.status(403).json({ 
        error: 'Transaction exceeds your daily limit. Please verify your account to increase limits.' 
      });
    }

    const requestId = `TP-DATA-${Date.now()}-${req.userId}`;
    
    const result = await vtpass.buyData(network, phone, planId, requestId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const transaction = new Transaction({
      userId: req.userId,
      walletAddress: req.user.walletAddress,
      type: 'data',
      amountTON,
      amountNGN,
      status: 'completed',
      metadata: {
        network,
        phone,
        planId,
        vtpassRequestId: requestId,
        vtpassTransactionId: result.transactionId
      }
    });
    await transaction.save();

    req.user.limits.dailyUsed += amountNGN;
    req.user.limits.monthlyUsed += amountNGN;
    await req.user.save();

    res.json({
      success: true,
      transaction: {
        id: transaction._id,
        status: transaction.status,
        message: result.message
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bank-transfer', authMiddleware, transactionLimiter, validateBankAccount, async (req, res) => {
  try {
    const { bankCode, accountNumber, accountName, amountTON, amountNGN, rate } = req.body;
    
    if (!req.user.canTransact(amountNGN)) {
      return res.status(403).json({ 
        error: 'Transaction exceeds your daily limit. Please verify your account to increase limits.' 
      });
    }

    const verifyResult = await paystack.verifyBankAccount(accountNumber, bankCode);
    if (!verifyResult.success) {
      return res.status(400).json({ error: 'Account verification failed' });
    }

    const recipientResult = await paystack.createTransferRecipient(
      accountNumber,
      bankCode,
      verifyResult.accountName
    );
    
    if (!recipientResult.success) {
      return res.status(400).json({ error: 'Failed to create transfer recipient' });
    }

    const reference = `TP-BANK-${Date.now()}-${req.userId}`;
    const fee = amountNGN * 0.02;
    const finalAmount = amountNGN - fee;

    const transferResult = await paystack.initiateTransfer(
      finalAmount,
      recipientResult.recipientCode,
      reference,
      `Payout to ${verifyResult.accountName}`
    );
    
    if (!transferResult.success) {
      return res.status(400).json({ error: transferResult.error });
    }

    const transaction = new Transaction({
      userId: req.userId,
      walletAddress: req.user.walletAddress,
      type: 'payout',
      amountTON,
      amountNGN,
      fee,
      status: 'pending',
      bankDetails: {
        bankName: req.body.bankName,
        bankCode,
        accountNumber,
        accountName: verifyResult.accountName
      },
      metadata: {
        paystackReference: reference,
        paystackTransferCode: transferResult.transferCode,
        recipientCode: recipientResult.recipientCode
      }
    });
    await transaction.save();

    req.user.limits.dailyUsed += amountNGN;
    req.user.limits.monthlyUsed += amountNGN;
    await req.user.save();

    res.json({
      success: true,
      transaction: {
        id: transaction._id,
        status: transaction.status,
        reference,
        fee,
        finalAmount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/banks', async (req, res) => {
  try {
    const result = await paystack.getBanks();
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      banks: result.banks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/data-plans/:network', async (req, res) => {
  try {
    const { network } = req.params;
    const result = await vtpass.getDataPlans(network);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error, plans: [] });
    }

    res.json({
      success: true,
      plans: result.plans
    });
  } catch (error) {
    res.status(500).json({ error: error.message, plans: [] });
  }
});

router.post('/verify-account', async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;
    const result = await paystack.verifyBankAccount(accountNumber, bankCode);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      accountName: result.accountName
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/paystack-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = req.body;
    const webhookData = paystack.handlePaystackWebhook(event);
    
    if (webhookData) {
      const transaction = await Transaction.findOne({
        'metadata.paystackReference': webhookData.reference
      });
      
      if (transaction) {
        if (webhookData.type === 'transfer_success') {
          transaction.status = 'completed';
        } else if (webhookData.type === 'transfer_failed') {
          transaction.status = 'failed';
        } else if (webhookData.type === 'transfer_reversed') {
          transaction.status = 'reversed';
        }
        
        await transaction.save();
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

export default router;
