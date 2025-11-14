import axios from 'axios';

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log('🧪 Testing Backend Server...\n');
console.log(`📍 Testing: ${BASE_URL}\n`);

const tests = [
  {
    name: 'Root Endpoint',
    url: `${BASE_URL}/`,
    method: 'GET'
  },
  {
    name: 'Health Check',
    url: `${BASE_URL}/health`,
    method: 'GET'
  },
  {
    name: 'Rate Endpoint',
    url: `${BASE_URL}/api/rate`,
    method: 'GET'
  }
];

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000
      });

      if (response.status === 200) {
        console.log(`✅ ${test.name}: PASSED (Status: ${response.status})`);
        if (test.name === 'Health Check') {
          console.log(`   Database: ${response.data.database || 'unknown'}`);
        }
        if (test.name === 'Rate Endpoint') {
          console.log(`   Rate: ${response.data.rate || 'N/A'}`);
        }
        passed++;
      } else {
        console.log(`⚠️  ${test.name}: Unexpected status ${response.status}`);
        failed++;
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.name}: FAILED - Server is not running!`);
        console.log(`   Error: Cannot connect to ${BASE_URL}`);
        console.log(`   💡 Make sure the server is running: cd server && npm start`);
      } else if (error.response) {
        console.log(`❌ ${test.name}: FAILED (Status: ${error.response.status})`);
        console.log(`   Error: ${error.response.data?.error || error.message}`);
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Error: ${error.message}`);
      }
      failed++;
    }
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed === 0) {
    console.log('🎉 All tests passed! Your backend is working well!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
    process.exit(1);
  }
}

runTests();

