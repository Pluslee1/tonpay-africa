import dotenv from 'dotenv';
import * as paystack from './services/paystack.js';
import * as vtpass from './services/vtpass.js';
import { sendWelcomeEmail } from './services/notifications.js';

dotenv.config();

console.log('🧪 Testing API Integrations...\n');

async function testIntegrations() {
  // Test 1: Paystack - Get Banks
  console.log('1️⃣ Testing Paystack - Get Banks List...');
  try {
    const banksResult = await paystack.getBanks();
    if (banksResult.success) {
      console.log(`✅ Paystack: Successfully fetched ${banksResult.banks.length} banks`);
      console.log(`   Sample: ${banksResult.banks[0]?.name}\n`);
    } else {
      console.log(`❌ Paystack Error: ${banksResult.error}\n`);
    }
  } catch (error) {
    console.log(`❌ Paystack Error: ${error.message}\n`);
  }

  // Test 2: Paystack - Verify Account (Test with GTBank account)
  console.log('2️⃣ Testing Paystack - Account Verification...');
  try {
    const verifyResult = await paystack.verifyBankAccount('0123456789', '058');
    if (verifyResult.success) {
      console.log(`✅ Paystack Verification: Account found - ${verifyResult.accountName}\n`);
    } else {
      console.log(`⚠️  Paystack Verification: ${verifyResult.error} (This is normal for test account)\n`);
    }
  } catch (error) {
    console.log(`❌ Paystack Verification Error: ${error.message}\n`);
  }

  // Test 3: Paystack - Get Balance
  console.log('3️⃣ Testing Paystack - Check Balance...');
  try {
    const balanceResult = await paystack.getBalance();
    if (balanceResult.success) {
      console.log(`✅ Paystack Balance: ₦${balanceResult.balance.toLocaleString()}\n`);
    } else {
      console.log(`❌ Paystack Balance Error: ${balanceResult.error}\n`);
    }
  } catch (error) {
    console.log(`❌ Paystack Balance Error: ${error.message}\n`);
  }

  // Test 4: VTPass - Get Data Plans
  console.log('4️⃣ Testing VTPass - Get MTN Data Plans...');
  try {
    const plansResult = await vtpass.getDataPlans('MTN');
    if (plansResult.success && plansResult.plans.length > 0) {
      console.log(`✅ VTPass: Successfully fetched ${plansResult.plans.length} MTN data plans`);
      console.log(`   Sample: ${plansResult.plans[0]?.name} - ₦${plansResult.plans[0]?.amount}\n`);
    } else {
      console.log(`❌ VTPass Error: ${plansResult.error || 'No plans found'}\n`);
    }
  } catch (error) {
    console.log(`❌ VTPass Error: ${error.message}\n`);
  }

  // Test 5: VTPass - Get Balance
  console.log('5️⃣ Testing VTPass - Check Balance...');
  try {
    const vtpassBalance = await vtpass.getBalance();
    if (vtpassBalance.success) {
      console.log(`✅ VTPass Balance: ₦${vtpassBalance.balance.toLocaleString()}\n`);
    } else {
      console.log(`❌ VTPass Balance Error: ${vtpassBalance.error}\n`);
    }
  } catch (error) {
    console.log(`❌ VTPass Balance Error: ${error.message}\n`);
  }

  // Test 6: SendGrid - Test Email
  console.log('6️⃣ Testing SendGrid - Email Service...');
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'SG.your_sendgrid_api_key') {
    console.log('⚠️  SendGrid: API key not configured, skipping email test\n');
  } else {
    try {
      const testUser = {
        email: process.env.FROM_EMAIL || 'test@example.com',
        profile: { firstName: 'Test' },
        referral: { code: 'TPTEST123' }
      };
      
      const emailResult = await sendWelcomeEmail(testUser);
      if (emailResult.success) {
        console.log(`✅ SendGrid: Test email sent successfully to ${testUser.email}\n`);
      } else {
        console.log(`❌ SendGrid Error: ${emailResult.error}\n`);
      }
    } catch (error) {
      console.log(`❌ SendGrid Error: ${error.message}\n`);
    }
  }

  console.log('✅ Integration tests completed!\n');
  console.log('📝 Next Steps:');
  console.log('   1. If all tests passed, your integrations are ready!');
  console.log('   2. Start your server: npm start');
  console.log('   3. Test real transactions through the app');
  console.log('   4. Check your email for welcome message\n');
}

testIntegrations().catch(console.error);
