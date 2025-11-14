import mongoose from 'mongoose';
import crypto from 'crypto';

const giftSchema = new mongoose.Schema({
  // Recipient info
  recipientAddress: { type: String, index: true }, // Optional - can be claimed later
  recipientTelegramId: { type: String, index: true }, // Telegram user ID
  recipientTelegramUsername: String, // For display
  
  // Sender info
  senderAddress: { type: String, required: true, index: true },
  senderTelegramId: String,
  senderTelegramUsername: String,
  
  // Gift details
  amountTON: { type: Number, required: true, min: 0.01 },
  amountNGN: Number,
  message: { type: String, maxlength: 500 },
  
  // Claim mechanism
  claimToken: { 
    type: String, 
    unique: true, 
    default: () => crypto.randomBytes(32).toString('hex'),
    index: true
  },
  claimLink: String, // Full URL to claim gift
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'claimed', 'converted', 'expired', 'cancelled'], 
    default: 'pending' 
  },
  converted: { type: Boolean, default: false },
  convertedTo: String, // 'TON' or 'NGN'
  
  // Expiration
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  
  // Timestamps
  sentAt: Date,
  claimedAt: Date,
  convertedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Index for finding unclaimed gifts
giftSchema.index({ claimToken: 1, status: 1 });
giftSchema.index({ recipientTelegramId: 1, status: 1 });
giftSchema.index({ expiresAt: 1, status: 1 });

export default mongoose.model('Gift', giftSchema);





