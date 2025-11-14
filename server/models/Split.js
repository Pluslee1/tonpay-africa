import mongoose from 'mongoose';

const splitSchema = new mongoose.Schema({
  hostAddress: { type: String, required: true },
  splitId: { type: String, unique: true, required: true },
  totalAmount: { type: Number, required: true },
  currency: { type: String, enum: ['TON', 'NGN'], default: 'TON' },
  splitType: { type: String, enum: ['ton', 'ngn'], required: true },
  participants: [{
    address: String,
    amountTON: Number,
    amountNGN: Number,
    paid: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Split', splitSchema);






