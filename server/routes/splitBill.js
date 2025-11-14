import express from 'express';
import Split from '../models/Split.js';
import Transaction from '../models/Transaction.js';
import crypto from 'crypto';

const router = express.Router();

// Create split bill
router.post('/', async (req, res) => {
  try {
    const { hostAddress, totalAmount, participants, splitType, rate } = req.body;

    if (!hostAddress || !totalAmount || !participants || participants.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize splitType to lowercase (accept both 'TON'/'ton' and 'NGN'/'ngn')
    const normalizedSplitType = splitType ? splitType.toLowerCase() : 'ton';

    const splitId = 'SPLIT-' + crypto.randomBytes(8).toString('hex').toUpperCase();
    const totalPeople = participants.length + 1;
    const perPersonTON = totalAmount / totalPeople;
    const perPersonNGN = perPersonTON * rate;

    const split = new Split({
      hostAddress,
      splitId,
      totalAmount,
      splitType: normalizedSplitType,
      currency: normalizedSplitType === 'ton' ? 'TON' : 'NGN',
      participants: participants.map(p => ({
        address: p.address,
        amountTON: perPersonTON,
        amountNGN: perPersonNGN,
        paid: false
      }))
    });

    await split.save();

    // Create transaction record
    const transaction = new Transaction({
      walletAddress: hostAddress,
      type: 'split',
      amountTON: totalAmount,
      amountNGN: totalAmount * rate,
      splitId: split._id,
      status: 'pending'
    });
    await transaction.save();

    res.json({
      success: true,
      splitId,
      perPerson: {
        ton: perPersonTON,
        ngn: perPersonNGN
      },
      joinUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/split?splitId=${encodeURIComponent(splitId)}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get split bill by ID
router.get('/:splitId', async (req, res) => {
  try {
    const split = await Split.findOne({ splitId: req.params.splitId });
    if (!split) {
      return res.status(404).json({ error: 'Split bill not found' });
    }
    res.json({ success: true, split });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join split bill (add participant payment)
router.post('/:splitId/join', async (req, res) => {
  try {
    const { address, amountTON } = req.body;
    const split = await Split.findOne({ splitId: req.params.splitId });
    
    if (!split) {
      return res.status(404).json({ error: 'Split bill not found' });
    }
    
    const participant = split.participants.find(p => p.address === address);
    if (!participant) {
      return res.status(400).json({ error: 'You are not a participant in this split bill' });
    }
    
    if (participant.paid) {
      return res.status(400).json({ error: 'You have already paid your share' });
    }
    
    participant.paid = true;
    await split.save();
    
    res.json({ success: true, message: 'Payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





