import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRegistration } from '../middleware/validator.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/notifications.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'tonpay_secret_key_change_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'tonpay_refresh_secret_key';

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

const generateReferralCode = () => {
  return 'TP' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

router.post('/register', authLimiter, validateRegistration, async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName, referralCode } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { phone }
      ]
    });

    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ 'referral.code': referralCode });
    }

    const user = new User({
      email: email?.toLowerCase(),
      phone,
      password,
      profile: { firstName, lastName },
      referral: {
        code: generateReferralCode(),
        referredBy: referrer?._id
      }
    });

    await user.save();

    if (referrer) {
      referrer.referral.referralCount += 1;
      await referrer.save();
    }

    if (user.email) {
      sendWelcomeEmail(user).catch(err => console.error('Welcome email error:', err));
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        firstName: user.profile.firstName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    const user = await User.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { phone }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isLocked()) {
      return res.status(423).json({ 
        error: 'Account locked due to too many failed attempts. Try again later.' 
      });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      user.security.failedLoginAttempts += 1;
      if (user.security.failedLoginAttempts >= 5) {
        user.security.lockUntil = Date.now() + 15 * 60 * 1000;
      }
      await user.save();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.security.failedLoginAttempts = 0;
    user.security.lockUntil = undefined;
    user.lastLogin = Date.now();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        firstName: user.profile?.firstName,
        role: user.role,
        kycStatus: user.kyc?.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -security.twoFactorSecret -security.pin');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        profile: user.profile,
        role: user.role,
        kyc: user.kyc,
        preferences: user.preferences,
        limits: user.limits,
        referral: user.referral
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.security.lastPasswordChange = Date.now();
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    
    if (!user) {
      return res.json({ success: true, message: 'If email exists, reset link sent' });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Password reset token:', resetToken);

    if (user.email) {
      sendPasswordResetEmail(user.email, resetToken).catch(err => 
        console.error('Reset email error:', err)
      );
    }

    res.json({ success: true, message: 'If email exists, reset link has been sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword;
    user.security.lastPasswordChange = Date.now();
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired reset token' });
  }
});

router.post('/telegram-auth', async (req, res) => {
  try {
    const { telegramId, firstName, lastName, username } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID required' });
    }

    let user = await User.findOne({ telegramId: String(telegramId) });
    
    if (!user) {
      user = new User({
        telegramId: String(telegramId),
        profile: {
          firstName: firstName || username,
          lastName
        },
        referral: {
          code: generateReferralCode()
        }
      });
      await user.save();
    }

    user.lastLogin = Date.now();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        telegramId: user.telegramId,
        firstName: user.profile?.firstName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;






