import express from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Gift from '../models/Gift.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import axios from 'axios';
import { sendGiftNotification, sendGiftSentConfirmation, formatTelegramUsername } from '../services/telegram.js';

const router = express.Router();
const memoryGifts = [];

const isDbConnected = () => mongoose.connection.readyState === 1;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Get received gifts for user
router.get('/', async (req, res) => {
  try {
    const { address, telegramId } = req.query;
    
    if (isDbConnected()) {
      const query = {};
      if (address) query.recipientAddress = address;
      if (telegramId) query.recipientTelegramId = telegramId;
      
      const gifts = await Gift.find(query)
        .where('status').in(['sent', 'claimed'])
        .sort({ createdAt: -1 });
      return res.json({ success: true, gifts });
    }
    
    // Filter gifts - match by address or telegramId, and status
    const gifts = memoryGifts
      .filter(g => {
        const matchesAddress = address && g.recipientAddress && g.recipientAddress === address;
        const matchesTelegramId = telegramId && g.recipientTelegramId && g.recipientTelegramId === telegramId;
        const hasValidStatus = g.status === 'sent' || g.status === 'claimed';
        const matches = (matchesAddress || matchesTelegramId) && hasValidStatus;
        if (address && g.recipientAddress) {
          console.log(`[GET /api/gifts] Checking gift ${g._id}: recipientAddress=${g.recipientAddress}, queryAddress=${address}, matches=${matches}, status=${g.status}`);
        }
        return matches;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    console.log(`[GET /api/gifts] Found ${gifts.length} gifts for address: ${address}, telegramId: ${telegramId}`);
    console.log(`[GET /api/gifts] Total memory gifts: ${memoryGifts.length}`);
    console.log(`[GET /api/gifts] All memory gifts:`, memoryGifts.map(g => ({ id: g._id, recipientAddress: g.recipientAddress, status: g.status })));
    
    res.json({ success: true, gifts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sent gifts for user
router.get('/sent', async (req, res) => {
  try {
    const { address, telegramId } = req.query;
    
    if (isDbConnected()) {
      const query = {};
      if (address) query.senderAddress = address;
      if (telegramId) query.senderTelegramId = telegramId;
      
      const gifts = await Gift.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, gifts });
    }
    
    const gifts = memoryGifts
      .filter(g => (address && g.senderAddress === address) || (telegramId && g.senderTelegramId === telegramId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, gifts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook: Receive gift (called by Telegram or mock)
router.post('/webhook', async (req, res) => {
  try {
    const { recipientAddress, senderAddress, amountTON, message } = req.body;

    // Get current rate (fallback to 2000)
    let rate = 2000;
    try {
      const rateRes = await axios.get('http://localhost:5000/api/rate');
      rate = rateRes.data.rate || rate;
    } catch (_) {}

    if (isDbConnected()) {
      const gift = new Gift({
        recipientAddress,
        senderAddress,
        amountTON,
        amountNGN: amountTON * rate,
        message,
        status: 'sent', // Set to 'sent' so it appears in received gifts list
        sentAt: new Date()
      });
      await gift.save();
      return res.json({ success: true, gift });
    }

    // In-memory fallback
    const giftId = 'MEM-' + crypto.randomBytes(8).toString('hex');
    const gift = {
      _id: giftId,
      id: giftId, // Also set id for compatibility
      recipientAddress,
      senderAddress,
      amountTON: parseFloat(amountTON),
      amountNGN: parseFloat(amountTON) * rate,
      message: message || '',
      converted: false,
      convertedTo: null,
      status: 'sent', // Set to 'sent' so it appears in received gifts list and can be converted
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    memoryGifts.push(gift);
    console.log(`[POST /api/gifts/webhook] Created demo gift:`, { 
      id: gift._id, 
      recipientAddress: gift.recipientAddress, 
      status: gift.status, 
      amountTON: gift.amountTON,
      converted: gift.converted
    });
    console.log(`[POST /api/gifts/webhook] Total memory gifts: ${memoryGifts.length}`);
    res.json({ success: true, gift });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a gift
router.post('/send', async (req, res) => {
  try {
    const { 
      senderAddress, 
      senderTelegramId,
      recipientTelegramUsername, 
      recipientTelegramId,
      recipientAddress,
      amountTON, 
      message,
      expiresInDays = 30
    } = req.body;

    // Validation
    if (!senderAddress) {
      return res.status(400).json({ error: 'Sender address is required' });
    }
    if (!amountTON || amountTON < 0.01) {
      return res.status(400).json({ error: 'Amount must be at least 0.01 TON' });
    }
    if (!recipientTelegramUsername && !recipientTelegramId && !recipientAddress) {
      return res.status(400).json({ error: 'Recipient Telegram username, ID, or address is required' });
    }

    // Get current rate
    let rate = 2000;
    try {
      const rateRes = await axios.get(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/rate`);
      rate = rateRes.data.rate || rate;
    } catch (_) {}

    // Get sender info
    let senderUsername = 'Anonymous';
    if (isDbConnected() && senderTelegramId) {
      const sender = await User.findOne({ telegramId: senderTelegramId });
      if (sender) {
        senderUsername = sender.profile?.firstName || sender.telegramId || 'Anonymous';
      }
    }

    // Create gift
    const claimToken = crypto.randomBytes(32).toString('hex');
    const claimLink = `${FRONTEND_URL}/gifts/claim?token=${claimToken}`;

    const giftData = {
      senderAddress,
      senderTelegramId,
      senderTelegramUsername: senderUsername,
      recipientTelegramUsername: formatTelegramUsername(recipientTelegramUsername),
      recipientTelegramId,
      recipientAddress,
      amountTON: parseFloat(amountTON),
      amountNGN: parseFloat(amountTON) * rate,
      message: message || '',
      claimToken,
      claimLink,
      status: 'pending',
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    };

    let gift;
    if (isDbConnected()) {
      gift = new Gift(giftData);
      await gift.save();
    } else {
      gift = {
        _id: 'MEM-' + crypto.randomBytes(8).toString('hex'),
        ...giftData,
        createdAt: new Date().toISOString()
      };
      memoryGifts.push(gift);
    }

    // Send Telegram notification to recipient
    if (recipientTelegramId) {
      const notificationResult = await sendGiftNotification(recipientTelegramId, {
        amountTON: gift.amountTON,
        amountNGN: gift.amountNGN,
        message: gift.message,
        claimLink: gift.claimLink,
        senderUsername: gift.senderTelegramUsername,
        expiresInDays
      });

      if (notificationResult.success) {
        gift.status = 'sent';
        gift.sentAt = new Date();
        if (isDbConnected()) {
          await gift.save();
        }
      } else {
        console.warn('Failed to send Telegram notification:', notificationResult.error);
        // Gift is still created, but status remains 'pending'
      }
    } else {
      // If no Telegram ID, mark as sent anyway (they can claim via link)
      gift.status = 'sent';
      gift.sentAt = new Date();
      if (isDbConnected()) {
        await gift.save();
      }
    }

    // Send confirmation to sender
    if (senderTelegramId) {
      await sendGiftSentConfirmation(senderTelegramId, {
        amountTON: gift.amountTON,
        recipientUsername: gift.recipientTelegramUsername || 'Recipient',
        claimLink: gift.claimLink
      });
    }

    res.json({ 
      success: true, 
      gift,
      message: recipientTelegramId 
        ? 'Gift sent! Recipient will receive a Telegram notification.' 
        : 'Gift created! Share the claim link with the recipient.'
    });
  } catch (error) {
    console.error('Send gift error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Claim a gift by token
router.post('/claim', async (req, res) => {
  try {
    const { claimToken, recipientAddress, recipientTelegramId } = req.body;

    if (!claimToken) {
      return res.status(400).json({ error: 'Claim token is required' });
    }

    let gift;
    if (isDbConnected()) {
      gift = await Gift.findOne({ 
        claimToken, 
        status: { $in: ['pending', 'sent'] }
      });
    } else {
      gift = memoryGifts.find(g => 
        g.claimToken === claimToken && 
        (g.status === 'pending' || g.status === 'sent')
      );
    }

    if (!gift) {
      return res.status(404).json({ error: 'Gift not found or already claimed' });
    }

    // Check expiration
    if (new Date(gift.expiresAt) < new Date()) {
      gift.status = 'expired';
      if (isDbConnected()) {
        await gift.save();
      }
      return res.status(400).json({ error: 'Gift has expired' });
    }

    // Update gift with recipient info
    if (recipientAddress) gift.recipientAddress = recipientAddress;
    if (recipientTelegramId) gift.recipientTelegramId = recipientTelegramId;
    gift.status = 'claimed';
    gift.claimedAt = new Date();

    if (isDbConnected()) {
      await gift.save();
    }

    res.json({ 
      success: true, 
      gift,
      message: 'Gift claimed successfully! You can now convert it to TON or NGN.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get gift by claim token (for claim page)
router.get('/claim/:token', async (req, res) => {
  try {
    const { token } = req.params;

    let gift;
    if (isDbConnected()) {
      gift = await Gift.findOne({ claimToken: token });
    } else {
      gift = memoryGifts.find(g => g.claimToken === token);
    }

    if (!gift) {
      return res.status(404).json({ error: 'Gift not found' });
    }

    // Check expiration
    if (new Date(gift.expiresAt) < new Date() && gift.status !== 'claimed') {
      gift.status = 'expired';
      if (isDbConnected()) {
        await gift.save();
      }
    }

    res.json({ success: true, gift });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert gift
router.post('/convert', async (req, res) => {
  try {
    const { giftId, toCurrency, address } = req.body;

    console.log(`[POST /api/gifts/convert] Conversion request:`, { giftId, toCurrency, address });

    let gift;
    if (isDbConnected()) {
      gift = await Gift.findById(giftId);
    } else {
      gift = memoryGifts.find(g => g._id === giftId || g.id === giftId);
    }
    
    if (!gift) {
      console.log(`[POST /api/gifts/convert] Gift not found. ID: ${giftId}, Total memory gifts: ${memoryGifts.length}`);
      console.log(`[POST /api/gifts/convert] Memory gift IDs:`, memoryGifts.map(g => ({ id: g._id, status: g.status })));
      return res.status(400).json({ error: 'Gift not found' });
    }

    console.log(`[POST /api/gifts/convert] Found gift:`, {
      id: gift._id,
      status: gift.status,
      converted: gift.converted,
      recipientAddress: gift.recipientAddress,
      senderAddress: gift.senderAddress
    });

    // Check if gift is already converted
    if (gift.converted) {
      return res.status(400).json({ error: 'Gift has already been converted' });
    }

    // Check if gift is available for conversion (sent or claimed status)
    // For demo gifts or gifts without explicit status, default to 'sent'
    const giftStatus = gift.status || 'sent';
    
    if (giftStatus !== 'claimed' && giftStatus !== 'sent') {
      console.log(`[POST /api/gifts/convert] Gift status check failed. Gift ID: ${giftId}, Status: ${giftStatus}, Expected: 'sent' or 'claimed'`);
      
      // Auto-fix: If status is missing or invalid but gift exists, set to 'sent' for demo gifts
      const isDemoGift = gift.senderAddress && (gift.senderAddress.startsWith('EQ' + 'D'.repeat(46)) || gift.senderAddress.includes('DDDDDD'));
      if (isDemoGift && !gift.converted) {
        console.log(`[POST /api/gifts/convert] Auto-fixing demo gift status to 'sent'`);
        gift.status = 'sent';
        if (isDbConnected()) {
          await gift.save();
        }
      } else {
        return res.status(400).json({ 
          error: 'Gift is not available for conversion',
          details: `Gift status is '${giftStatus}'. Must be 'sent' or 'claimed' to convert.`
        });
      }
    }

    // Verify ownership - for demo gifts, be more lenient
    if (gift.recipientAddress && gift.recipientAddress !== address) {
      // For demo/testing, allow if address is close or if it's a demo gift
      const isDemoGift = gift.senderAddress && gift.senderAddress.startsWith('EQ' + 'D'.repeat(46));
      if (!isDemoGift) {
        console.log(`[POST /api/gifts/convert] Ownership check failed. Gift recipient: ${gift.recipientAddress}, User address: ${address}`);
        return res.status(403).json({ error: 'You are not the recipient of this gift' });
      }
    }

    // Fetch live rate from TonAPI or CoinGecko, fallback to 2000
    let rate = 2000;
    try {
      const cg = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: { ids: 'the-open-network', vs_currencies: 'ngn' }, timeout: 5000
      });
      rate = cg.data?.['the-open-network']?.ngn || rate;
    } catch (e) {
      try {
        const tonapi = await axios.get('https://tonapi.io/v2/rates?tokens=ton&currencies=ngn', { timeout: 5000 });
        rate = tonapi.data?.rates?.ton?.prices?.ngn || rate;
      } catch (_) {}
    }

    const grossNGN = gift.amountTON * rate;
    const fee = Math.round(grossNGN * 0.02); // 2% fee in NGN
    const netNGN = grossNGN - fee;

    gift.converted = true;
    gift.convertedTo = toCurrency;
    gift.status = toCurrency === 'NGN' ? 'withdrawn' : 'converted';
    if (isDbConnected()) {
      await gift.save();
    }

    // Record transaction (admin can view fees/profit)
    if (isDbConnected()) {
      const transaction = new Transaction({
        walletAddress: address,
        type: 'gift',
        amountTON: gift.amountTON,
        amountNGN: grossNGN,
        giftId: gift._id,
        fee,
        status: 'completed'
      });
      await transaction.save();
    }

    // For NGN conversion, backend would transfer TON from user gift to pool wallet here.
    // For TON conversion, backend would credit user's on-chain balance via TonConnect flow.

    const summary = {
      sender: gift.senderAddress || 'Unknown',
      amountTON: gift.amountTON,
      conversion: toCurrency,
      valueReceived: toCurrency === 'NGN' ? netNGN : gift.amountTON,
      rate,
      fee,
      createdAt: new Date().toISOString()
    };

    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;





