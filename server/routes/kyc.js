import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Demo KYC Verification (no API needed)
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { firstName, lastName, dateOfBirth, documentType, documentNumber } = req.body;

    // Basic validation
    if (!firstName || !lastName || !dateOfBirth || !documentNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // In demo mode, auto-approve KYC
    if (!user.kyc) user.kyc = {};
    user.kyc.status = 'verified';
    user.kyc.verifiedAt = new Date();
    user.kyc.type = documentType;
    
    // Update user profile if needed
    if (!user.profile) user.profile = {};
    if (!user.profile.firstName) user.profile.firstName = firstName;
    if (!user.profile.lastName) user.profile.lastName = lastName;
    if (!user.profile.dateOfBirth) user.profile.dateOfBirth = new Date(dateOfBirth);

    await user.save();

    res.json({
      success: true,
      message: 'KYC verified successfully (Demo mode)',
      status: 'verified'
    });
  } catch (error) {
    console.error('KYC verify error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify KYC' });
  }
});

// Get KYC status (demo mode - just return user status)
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      status: user.kyc?.status || 'pending',
      message: 'Demo mode - no external API calls'
    });
  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({ error: error.message || 'Failed to get KYC status' });
  }
});

export default router;

