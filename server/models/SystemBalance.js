import mongoose from 'mongoose';

const systemBalanceSchema = new mongoose.Schema({
  balanceNGN: { type: Number, default: 0 },
  balanceTON: { type: Number, default: 0 },
  totalDepositedNGN: { type: Number, default: 0 },
  totalWithdrawnNGN: { type: Number, default: 0 },
  totalCollectedTON: { type: Number, default: 0 },
  
  // TON Wallet Management
  tonWalletAddress: { type: String, default: '' },
  tonWalletPrivateKey: { type: String, default: '' }, // Encrypted in production
  tonWalletPublicKey: { type: String, default: '' },
  
  // Auto-processing settings
  autoProcessWithdrawals: { type: Boolean, default: true },
  minBalanceNGN: { type: Number, default: 100000 }, // Minimum balance before auto-processing stops
  maxDailyWithdrawalNGN: { type: Number, default: 10000000 }, // Max daily auto-withdrawals
  
  // Paystack settings
  paystackEnabled: { type: Boolean, default: true },
  
  lastUpdated: { type: Date, default: Date.now }
}, {
  collection: 'systembalance' // Use singular collection name
});

// Ensure only one document exists
systemBalanceSchema.statics.getBalance = async function() {
  let balance = await this.findOne();
  if (!balance) {
    balance = new this({ 
      balanceNGN: 0, 
      balanceTON: 0,
      autoProcessWithdrawals: true,
      minBalanceNGN: 100000,
      maxDailyWithdrawalNGN: 10000000
    });
    await balance.save();
  }
  return balance;
};

export default mongoose.model('SystemBalance', systemBalanceSchema);

