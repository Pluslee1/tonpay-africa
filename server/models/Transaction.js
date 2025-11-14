import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  walletAddress: String,
  type: { type: String, enum: ['convert', 'split', 'gift', 'payout', 'airtime', 'data'], required: true },
  amountTON: { type: Number, required: true },
  amountNGN: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  splitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Split' },
  giftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gift' },
  bankDetails: {
    accountNumber: String,
    accountName: String,
    bankName: String
  },
  fee: { type: Number, default: 0 }, // 2% transaction fee
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);





