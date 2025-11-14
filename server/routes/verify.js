import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get verification status
router.get('/status', async (req, res) => {
  try {
    // If address is provided, check by wallet; otherwise, respond with defaults
    const user = req.query.address ? await User.findOne({ walletAddress: req.query.address }) : null;
    const kyc = user?.kyc;
    res.json({
      verified: kyc?.status === 'verified',
      type: kyc?.type,
      dailyLimit: kyc?.status === 'verified' ? 500000 : 20000
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit verification (requires auth)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { bvn, nin } = req.body;

    const hasValidBVN = typeof bvn === 'string' && /^\d{11}$/.test(bvn);
    const hasValidNIN = typeof nin === 'string' && /^\d{11}$/.test(nin);

    if (!hasValidBVN && !hasValidNIN) {
      return res.status(400).json({ error: 'Provide a valid BVN or NIN (11 digits)' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.kyc = {
      ...(user.kyc || {}),
      status: 'verified',
      type: hasValidBVN ? 'bvn' : 'nin',
      bvn: hasValidBVN ? bvn : user.kyc?.bvn,
      nin: hasValidNIN ? nin : user.kyc?.nin,
      verifiedAt: new Date()
    };
    user.limits = {
      ...(user.limits || {}),
      daily: 500000,
      monthly: Math.max(user.limits?.monthly || 500000, 5000000)
    };
    await user.save();

    res.json({ success: true, verified: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;






