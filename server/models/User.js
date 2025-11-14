import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  telegramId: String,
  walletAddress: { type: String, index: true },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  phone: { type: String, unique: true, sparse: true },
  password: String,
  
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    dateOfBirth: Date
  },
  
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  kyc: {
    status: { type: String, enum: ['pending', 'verified', 'rejected', 'initiated'], default: 'pending' },
    type: String,
    bvn: String,
    nin: String,
    verifiedAt: Date,
    sumsubApplicantId: String, // Sumsub applicant ID
    sumsubLevelName: { type: String, default: 'basic-kyc-level' },
    documents: [{
      type: String,
      url: String,
      uploadedAt: Date
    }]
  },
  
  bankAccounts: [{
    bankName: String,
    bankCode: String,
    accountNumber: String,
    accountName: String,
    isDefault: Boolean,
    addedAt: { type: Date, default: Date.now }
  }],
  
  preferences: {
    defaultConversion: { type: String, enum: ['TON', 'NGN'], default: 'NGN' },
    autoConvertGifts: { type: Boolean, default: false },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'NGN' }
  },
  
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    pin: String,
    lastPasswordChange: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date
  },
  
  limits: {
    daily: { type: Number, default: 20000 },
    monthly: { type: Number, default: 500000 },
    dailyUsed: { type: Number, default: 0 },
    monthlyUsed: { type: Number, default: 0 },
    lastReset: Date
  },
  
  referral: {
    code: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referralCount: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 }
  },
  
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function() {
  return this.security.lockUntil && this.security.lockUntil > Date.now();
};

userSchema.methods.canTransact = function(amount) {
  if (this.kyc.status !== 'verified') {
    return amount <= this.limits.daily && this.limits.dailyUsed + amount <= this.limits.daily;
  }
  return this.limits.dailyUsed + amount <= this.limits.daily && 
         this.limits.monthlyUsed + amount <= this.limits.monthly;
};

export default mongoose.model('User', userSchema);





