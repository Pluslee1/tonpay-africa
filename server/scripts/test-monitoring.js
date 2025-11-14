import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.API_URL || 'http://localhost:5000';

async function testMonitoring(adminToken) {
  console.log('🧪 Testing Monitoring Endpoints...\n');

  const headers = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: Health Check (no auth needed)
    console.log('1️⃣ Testing Health Check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check:', health.data);
    console.log('');

    // Test 2: Admin Stats
    console.log('2️⃣ Testing Admin Stats...');
    const stats = await axios.get(`${API_BASE}/api/admin/stats`, { headers });
    console.log('✅ Admin Stats Retrieved');
    console.log('   Server Status:', stats.data.server.status);
    console.log('   Uptime:', stats.data.server.uptime);
    console.log('   Total Users:', stats.data.users.total);
    console.log('   Total Transactions:', stats.data.transactions.total);
    console.log('   Success Rate:', stats.data.transactions.successRate + '%');
    console.log('   Total Revenue:', stats.data.revenue.totalNGN);
    console.log('');

    // Test 3: Transactions
    console.log('3️⃣ Testing Transactions Endpoint...');
    const transactions = await axios.get(`${API_BASE}/api/admin/transactions?limit=5`, { headers });
    console.log('✅ Transactions Retrieved');
    console.log('   Total:', transactions.data.pagination.total);
    console.log('   Showing:', transactions.data.transactions.length, 'transactions');
    console.log('');

    // Test 4: Users
    console.log('4️⃣ Testing Users Endpoint...');
    const users = await axios.get(`${API_BASE}/api/admin/users?limit=5`, { headers });
    console.log('✅ Users Retrieved');
    console.log('   Total:', users.data.pagination.total);
    console.log('   Showing:', users.data.users.length, 'users');
    console.log('');

    // Test 5: Transaction Analytics
    console.log('5️⃣ Testing Transaction Analytics...');
    const txAnalytics = await axios.get(`${API_BASE}/api/admin/analytics/transactions?days=7`, { headers });
    console.log('✅ Transaction Analytics Retrieved');
    console.log('   Period:', txAnalytics.data.period);
    console.log('   Total Transactions:', txAnalytics.data.summary.totalTransactions);
    console.log('   Total Volume:', txAnalytics.data.summary.totalVolume);
    console.log('');

    // Test 6: User Analytics
    console.log('6️⃣ Testing User Analytics...');
    const userAnalytics = await axios.get(`${API_BASE}/api/admin/analytics/users?days=7`, { headers });
    console.log('✅ User Analytics Retrieved');
    console.log('   Period:', userAnalytics.data.period);
    console.log('   New Users:', userAnalytics.data.summary.totalNewUsers);
    console.log('');

    console.log('🎉 All monitoring endpoints working correctly!');
    console.log('\n📊 Full Stats Summary:');
    console.log(JSON.stringify(stats.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        console.error('\n💡 Token is invalid or expired. Please login again to get a new token.');
      } else if (error.response.status === 403) {
        console.error('\n💡 Access denied. Make sure your user has admin role.');
      }
    } else {
      console.error('❌ Error:', error.message);
      console.error('\n💡 Make sure your server is running on', API_BASE);
    }
    process.exit(1);
  }
}

// Get token from command line
const token = process.argv[2];

if (!token) {
  console.error('❌ Please provide admin token');
  console.error('\nUsage: node test-monitoring.js <admin_token>');
  console.error('\nTo get admin token:');
  console.error('1. Create admin user: node create-admin.js');
  console.error('2. Login: POST /api/auth/login');
  console.error('3. Use the accessToken from response');
  process.exit(1);
}

testMonitoring(token);


