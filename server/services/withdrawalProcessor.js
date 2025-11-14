import Transaction from '../models/Transaction.js';
import SystemBalance from '../models/SystemBalance.js';
import * as paystack from './paystack.js';

/**
 * Automatically process pending withdrawals
 */
export const processPendingWithdrawals = async () => {
  try {
    const balance = await SystemBalance.getBalance();
    
    // Check if auto-processing is enabled
    if (!balance.autoProcessWithdrawals) {
      console.log('⏸️  Auto-processing is disabled');
      return { processed: 0, skipped: 0, failed: 0 };
    }
    
    // Check minimum balance
    if (balance.balanceNGN < balance.minBalanceNGN) {
      console.log(`⚠️  Balance too low (₦${balance.balanceNGN.toLocaleString('en-NG')}). Minimum required: ₦${balance.minBalanceNGN.toLocaleString('en-NG')}`);
      return { processed: 0, skipped: 0, failed: 0, reason: 'insufficient_balance' };
    }
    
    // Get pending withdrawals
    const pending = await Transaction.find({
      type: 'payout',
      status: 'pending'
    })
      .sort({ createdAt: 1 }) // Process oldest first
      .limit(10); // Process 10 at a time
    
    if (pending.length === 0) {
      return { processed: 0, skipped: 0, failed: 0 };
    }
    
    let processed = 0;
    let skipped = 0;
    let failed = 0;
    let totalProcessedNGN = 0;
    
    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayWithdrawals = await Transaction.find({
      type: 'payout',
      status: 'completed',
      createdAt: { $gte: today },
      'metadata.processedBy': 'auto'
    });
    
    const todayTotalNGN = todayWithdrawals.reduce((sum, tx) => sum + (tx.amountNGN || 0), 0);
    
    for (const transaction of pending) {
      // Check daily limit
      if (todayTotalNGN + totalProcessedNGN + transaction.amountNGN > balance.maxDailyWithdrawalNGN) {
        console.log(`⚠️  Daily limit reached. Skipping remaining withdrawals.`);
        skipped = pending.length - processed - failed;
        break;
      }
      
      // Check balance
      if (balance.balanceNGN < transaction.amountNGN) {
        console.log(`⚠️  Insufficient balance for transaction ${transaction._id}. Need ₦${transaction.amountNGN.toLocaleString('en-NG')}`);
        skipped++;
        continue;
      }
      
      try {
        // Verify bank account
        const verifyResult = await paystack.verifyBankAccount(
          transaction.bankDetails.accountNumber,
          transaction.bankDetails.bankCode
        );
        
        if (!verifyResult.success) {
          console.error(`❌ Account verification failed for transaction ${transaction._id}`);
          transaction.status = 'failed';
          transaction.metadata = transaction.metadata || {};
          transaction.metadata.failureReason = 'Account verification failed';
          transaction.metadata.processedBy = 'auto';
          await transaction.save();
          failed++;
          continue;
        }
        
        // Create or get recipient
        let recipientCode = transaction.metadata?.recipientCode;
        
        if (!recipientCode) {
          const recipientResult = await paystack.createTransferRecipient(
            transaction.bankDetails.accountNumber,
            transaction.bankDetails.bankCode,
            transaction.bankDetails.accountName || verifyResult.accountName
          );
          
          if (!recipientResult.success) {
            console.error(`❌ Failed to create recipient for transaction ${transaction._id}`);
            transaction.status = 'failed';
            transaction.metadata = transaction.metadata || {};
            transaction.metadata.failureReason = 'Failed to create recipient';
            transaction.metadata.processedBy = 'auto';
            await transaction.save();
            failed++;
            continue;
          }
          
          recipientCode = recipientResult.recipientCode;
        }
        
        // Initiate transfer
        const reference = `TP-AUTO-${Date.now()}-${transaction._id}`;
        const transferResult = await paystack.initiateTransfer(
          transaction.amountNGN,
          recipientCode,
          reference,
          `Payout from TonPay Africa - ${transaction.amountTON} TON`
        );
        
        if (!transferResult.success) {
          console.error(`❌ Transfer failed for transaction ${transaction._id}: ${transferResult.error}`);
          transaction.status = 'failed';
          transaction.metadata = transaction.metadata || {};
          transaction.metadata.failureReason = transferResult.error || 'Transfer failed';
          transaction.metadata.processedBy = 'auto';
          await transaction.save();
          failed++;
          continue;
        }
        
        // Update transaction
        transaction.status = 'processing'; // Set to processing, will be confirmed by webhook
        transaction.metadata = transaction.metadata || {};
        transaction.metadata.paystackReference = reference;
        transaction.metadata.paystackTransferCode = transferResult.transferCode;
        transaction.metadata.recipientCode = recipientCode;
        transaction.metadata.processedBy = 'auto';
        transaction.metadata.processedAt = new Date();
        await transaction.save();
        
        // Deduct from balance (we'll confirm via webhook, but deduct now)
        balance.balanceNGN -= transaction.amountNGN;
        balance.totalWithdrawnNGN += transaction.amountNGN;
        balance.lastUpdated = new Date();
        await balance.save();
        
        processed++;
        totalProcessedNGN += transaction.amountNGN;
        
        console.log(`✅ Processed withdrawal: ₦${transaction.amountNGN.toLocaleString('en-NG')} to ${transaction.bankDetails.accountName}`);
        
      } catch (error) {
        console.error(`❌ Error processing transaction ${transaction._id}:`, error.message);
        transaction.status = 'failed';
        transaction.metadata = transaction.metadata || {};
        transaction.metadata.failureReason = error.message;
        transaction.metadata.processedBy = 'auto';
        await transaction.save();
        failed++;
      }
    }
    
    console.log(`📊 Auto-processing complete: ${processed} processed, ${skipped} skipped, ${failed} failed`);
    
    return { processed, skipped, failed, totalProcessedNGN };
    
  } catch (error) {
    console.error('❌ Error in processPendingWithdrawals:', error);
    return { processed: 0, skipped: 0, failed: 0, error: error.message };
  }
};

/**
 * Process a single withdrawal manually (admin override)
 */
export const processSingleWithdrawal = async (transactionId, adminId) => {
  try {
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction || transaction.type !== 'payout') {
      return { success: false, error: 'Transaction not found or invalid' };
    }
    
    if (transaction.status !== 'pending') {
      return { success: false, error: 'Transaction is not pending' };
    }
    
    const balance = await SystemBalance.getBalance();
    
    if (balance.balanceNGN < transaction.amountNGN) {
      return { success: false, error: 'Insufficient balance' };
    }
    
    // Verify account
    const verifyResult = await paystack.verifyBankAccount(
      transaction.bankDetails.accountNumber,
      transaction.bankDetails.bankCode
    );
    
    if (!verifyResult.success) {
      transaction.status = 'failed';
      transaction.metadata = transaction.metadata || {};
      transaction.metadata.failureReason = 'Account verification failed';
      transaction.metadata.processedBy = 'manual';
      transaction.metadata.processedByAdmin = adminId;
      await transaction.save();
      return { success: false, error: 'Account verification failed' };
    }
    
    // Create or get recipient
    let recipientCode = transaction.metadata?.recipientCode;
    
    if (!recipientCode) {
      const recipientResult = await paystack.createTransferRecipient(
        transaction.bankDetails.accountNumber,
        transaction.bankDetails.bankCode,
        transaction.bankDetails.accountName || verifyResult.accountName
      );
      
      if (!recipientResult.success) {
        return { success: false, error: 'Failed to create recipient' };
      }
      
      recipientCode = recipientResult.recipientCode;
    }
    
    // Initiate transfer
    const reference = `TP-MANUAL-${Date.now()}-${transaction._id}`;
    const transferResult = await paystack.initiateTransfer(
      transaction.amountNGN,
      recipientCode,
      reference,
      `Payout from TonPay Africa - ${transaction.amountTON} TON`
    );
    
    if (!transferResult.success) {
      transaction.status = 'failed';
      transaction.metadata = transaction.metadata || {};
      transaction.metadata.failureReason = transferResult.error || 'Transfer failed';
      transaction.metadata.processedBy = 'manual';
      transaction.metadata.processedByAdmin = adminId;
      await transaction.save();
      return { success: false, error: transferResult.error || 'Transfer failed' };
    }
    
    // Update transaction
    transaction.status = 'processing';
    transaction.metadata = transaction.metadata || {};
    transaction.metadata.paystackReference = reference;
    transaction.metadata.paystackTransferCode = transferResult.transferCode;
    transaction.metadata.recipientCode = recipientCode;
    transaction.metadata.processedBy = 'manual';
    transaction.metadata.processedByAdmin = adminId;
    transaction.metadata.processedAt = new Date();
    await transaction.save();
    
    // Deduct from balance
    balance.balanceNGN -= transaction.amountNGN;
    balance.totalWithdrawnNGN += transaction.amountNGN;
    balance.lastUpdated = new Date();
    await balance.save();
    
    return {
      success: true,
      message: 'Withdrawal processed successfully',
      transaction: {
        id: transaction._id,
        amountNGN: transaction.amountNGN,
        status: transaction.status,
        reference
      }
    };
    
  } catch (error) {
    console.error('Error in processSingleWithdrawal:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handle Paystack webhook for transfer confirmation
 */
export const handleTransferWebhook = async (webhookData) => {
  try {
    const { event, data } = webhookData;
    
    if (event === 'transfer.success') {
      const reference = data.reference;
      const transaction = await Transaction.findOne({
        'metadata.paystackReference': reference
      });
      
      if (transaction && transaction.status === 'processing') {
        transaction.status = 'completed';
        transaction.metadata = transaction.metadata || {};
        transaction.metadata.confirmedAt = new Date();
        transaction.metadata.confirmedBy = 'paystack_webhook';
        await transaction.save();
        
        console.log(`✅ Transfer confirmed: ${reference} - ₦${transaction.amountNGN.toLocaleString('en-NG')}`);
        
        return { success: true, transactionId: transaction._id };
      }
    } else if (event === 'transfer.failed' || event === 'transfer.reversed') {
      const reference = data.reference;
      const transaction = await Transaction.findOne({
        'metadata.paystackReference': reference
      });
      
      if (transaction && transaction.status === 'processing') {
        // Refund balance
        const balance = await SystemBalance.getBalance();
        balance.balanceNGN += transaction.amountNGN;
        balance.totalWithdrawnNGN -= transaction.amountNGN;
        balance.lastUpdated = new Date();
        await balance.save();
        
        transaction.status = 'failed';
        transaction.metadata = transaction.metadata || {};
        transaction.metadata.failureReason = data.reason || 'Transfer failed';
        transaction.metadata.failedAt = new Date();
        await transaction.save();
        
        console.log(`❌ Transfer failed: ${reference} - Refunded ₦${transaction.amountNGN.toLocaleString('en-NG')}`);
        
        return { success: true, transactionId: transaction._id, refunded: true };
      }
    }
    
    return { success: false, message: 'Transaction not found or already processed' };
    
  } catch (error) {
    console.error('Error in handleTransferWebhook:', error);
    return { success: false, error: error.message };
  }
};

