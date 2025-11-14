const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  description: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  recipient: { 
    type: String, 
    required: true,
    validate: {
      validator: v => /^EQ[0-9a-zA-Z]{48}$/.test(v),
      message: props => `${props.value} is not a valid TON address!`
    }
  },
  members: [{
    address: { type: String, required: true },
    share: { type: Number, required: true },
    paid: { type: Boolean, default: false }
  }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
