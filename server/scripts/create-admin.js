import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tonpay-africa';

async function createAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get email from command line or use default
    const email = process.argv[2] || 'admin@tonpay.com';
    const password = process.argv[3] || 'admin123456';

    console.log(`📧 Creating admin user: ${email}`);
    console.log(`🔑 Password: ${password}\n`);

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      // Always update password to ensure it's set correctly
      user.password = password; // Will be hashed by pre-save hook
      await user.save();
      console.log('✅ Updated existing user to admin role (password reset)');
    } else {
      // Create new admin user
      user = new User({
        email: email.toLowerCase(),
        password: password,
        profile: {
          firstName: 'Admin',
          lastName: 'User'
        },
        role: 'admin',
        'kyc.status': 'verified' // Auto-verify admin
      });
      await user.save();
      console.log('✅ Created new admin user');
    }

    console.log('\n📊 Admin User Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Created: ${user.createdAt}`);

    console.log('\n🎯 Next Steps:');
    console.log('1. Login to get admin token:');
    console.log(`   POST /api/auth/login`);
    console.log(`   Body: { "email": "${email}", "password": "${password}" }`);
    console.log('\n2. Use the accessToken to access admin endpoints:');
    console.log('   GET /api/admin/stats');
    console.log('   Authorization: Bearer <accessToken>');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();

