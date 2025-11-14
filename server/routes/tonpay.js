import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { transactionLimiter } from '../middleware/rateLimiter.js';
import * as ton from '../services/ton.js';
import * as vtpass from '../services/vtpass.js';
import * as paystack from '../services/paystack.js';
import Transaction from '../models/Transaction.js';
import { sendTransactionNotification } from '../services/notifications.js';

const router = express.Router();

/**
 * Buy airtime using TON from connected wallet
 * User sends TON → We process → Airtime delivered
 */
router.post('/airtime', authMiddleware, transactionLimiter, async (req, res) => {
  try {
    const { network, phoneNumber, tonAmount, ngnAmount, rate, tonTransactionHash } = req.body;
    
    // Check transaction limits
    if (!req.user.canTransact(ngnAmount)) {
      return res.status(403).json({ 
        error: 'Transaction exceeds your daily limit. Please verify your account.' 
      });
    }

    // Verify TON transaction if hash provided
    if (tonTransactionHash) {
      const verification = await ton.verifyTransaction(tonTransactionHash);
      if (!verification.confirmed) {
        return res.status(400).json({ error: 'TON transaction not confirmed yet' });
      }
    }

    // Process airtime purchase
    const requestId = `TP-AIR-${Date.now()}-${req.userId}`;
    const vtpassResult = await vtpass.buyAirtime(network, phoneNumber, ngnAmount, requestId);
    
    if (!vtpassResult.success) {
      return res.status(400).json({ error: vtpassResult.error });
    }

    // Save transaction
    const transaction = new Transaction({
      userId: req.userId,
      walletAddress: req.user.walletAddress || req.body.walletAddress,
      type: 'airtime',
      amountTON: tonAmount,
      amountNGN: ngnAmount,
      status: 'completed',
      metadata: {
        network,
        phoneNumber,
        rate,
        tonTransactionHash,
        vtpassRequestId: requestId,
        vtpassTransactionId: vtpassResult.transactionId
      }
    });
    await transaction.save();

    // Update user limits
    req.user.limits.dailyUsed += ngnAmount;
    req.user.limits.monthlyUsed += ngnAmount;
    await req.user.save();

    // Send notification
    sendTransactionNotification(req.user, transaction).catch(console.error);

    res.json({
      success: true,
      message: `${tonAmount} TON spent for ₦${ngnAmount} ${network} airtime`,
      transaction: {
        id: transaction._id,
        status: transaction.status,
        tonSpent: tonAmount,
        ngnValue: ngnAmount
      }
    });
  } catch (error) {
    console.error('TON airtime error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Buy data using TON from connected wallet
 */
router.post('/data', authMiddleware, transactionLimiter, async (req, res) => {
  try {
    const { network, phoneNumber, planId, tonAmount, ngnAmount, rate, tonTransactionHash } = req.body;
    
    if (!req.user.canTransact(ngnAmount)) {
      return res.status(403).json({ 
        error: 'Transaction exceeds your daily limit.' 
      });
    }

    // Verify TON transaction
    if (tonTransactionHash) {
      const verification = await ton.verifyTransaction(tonTransactionHash);
      if (!verification.confirmed) {
        return res.status(400).json({ error: 'TON transaction not confirmed yet' });
      }
    }

    // Purchase data
    const requestId = `TP-DATA-${Date.now()}-${req.userId}`;
    const vtpassResult = await vtpass.buyData(network, phoneNumber, planId, requestId);
    
    if (!vtpassResult.success) {
      return res.status(400).json({ error: vtpassResult.error });
    }

    // Save transaction
    const transaction = new Transaction({
      userId: req.userId,
      walletAddress: req.user.walletAddress || req.body.walletAddress,
      type: 'data',
      amountTON: tonAmount,
      amountNGN: ngnAmount,
      status: 'completed',
      metadata: {
        network,
        phoneNumber,
        planId,
        rate,
        tonTransactionHash,
        vtpassRequestId: requestId,
        vtpassTransactionId: vtpassResult.transactionId
      }
    });
    await transaction.save();

    req.user.limits.dailyUsed += ngnAmount;
    req.user.limits.monthlyUsed += ngnAmount;
    await req.user.save();

    sendTransactionNotification(req.user, transaction).catch(console.error);

    res.json({
      success: true,
      message: `${tonAmount} TON spent for data bundle`,
      transaction: {
        id: transaction._id,
        status: transaction.status,
        tonSpent: tonAmount,
        ngnValue: ngnAmount
      }
    });
  } catch (error) {
    console.error('TON data error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send money to bank using TON
 */
router.post('/bank-transfer', authMiddleware, transactionLimiter, async (req, res) => {
  try {
    const { bankCode, accountNumber, tonAmount, ngnAmount, rate, tonTransactionHash } = req.body;
    
    if (!req.user.canTransact(ngnAmount)) {
      return res.status(403).json({ 
        error: 'Transaction exceeds your daily limit.' 
      });
    }

    // Verify account
    const verifyResult = await paystack.verifyBankAccount(accountNumber, bankCode);
    if (!verifyResult.success) {
      return res.status(400).json({ error: 'Account verification failed' });
    }

    // Verify TON transaction
    if (tonTransactionHash) {
      const verification = await ton.verifyTransaction(tonTransactionHash);
      if (!verification.confirmed) {
        return res.status(400).json({ error: 'TON transaction not confirmed yet' });
      }
    }

    // Create recipient
    const recipientResult = await paystack.createTransferRecipient(
      accountNumber,
      bankCode,
      verifyResult.accountName
    );
    
    if (!recipientResult.success) {
      return res.status(400).json({ error: 'Failed to create recipient' });
    }

    // Calculate fee and final amount
    const reference = `TP-BANK-${Date.now()}-${req.userId}`;
    const fee = ngnAmount * 0.02; // 2% fee
    const finalAmount = ngnAmount - fee;

    // Initiate transfer
    const transferResult = await paystack.initiateTransfer(
      finalAmount,
      recipientResult.recipientCode,
      reference,
      `Transfer from TONPay - ${tonAmount} TON`
    );
    
    if (!transferResult.success) {
      return res.status(400).json({ error: transferResult.error });
    }

    // Save transaction
    const transaction = new Transaction({
      userId: req.userId,
      walletAddress: req.user.walletAddress || req.body.walletAddress,
      type: 'payout',
      amountTON: tonAmount,
      amountNGN: ngnAmount,
      fee,
      status: 'pending',
      bankDetails: {
        bankCode,
        accountNumber,
        accountName: verifyResult.accountName
      },
      metadata: {
        rate,
        tonTransactionHash,
        paystackReference: reference,
        paystackTransferCode: transferResult.transferCode,
        recipientCode: recipientResult.recipientCode
      }
    });
    await transaction.save();

    req.user.limits.dailyUsed += ngnAmount;
    req.user.limits.monthlyUsed += ngnAmount;
    await req.user.save();

    sendTransactionNotification(req.user, transaction).catch(console.error);

    res.json({
      success: true,
      message: `${tonAmount} TON sent to ${verifyResult.accountName}`,
      transaction: {
        id: transaction._id,
        status: transaction.status,
        tonSpent: tonAmount,
        ngnValue: ngnAmount,
        fee,
        finalAmount,
        recipient: verifyResult.accountName
      }
    });
  } catch (error) {
    console.error('TON bank transfer error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
