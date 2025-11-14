import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tonpay-africa';

async function unlockAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = process.argv[2] || 'admin@tonpay.com';
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    // Reset failed login attempts and unlock account
    user.security.failedLoginAttempts = 0;
    user.security.lockUntil = undefined;
    await user.save();

    console.log('✅ Admin account unlocked and reset');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Failed attempts: ${user.security.failedLoginAttempts}`);
    console.log(`   Locked until: ${user.security.lockUntil || 'Not locked'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

unlockAdmin();

