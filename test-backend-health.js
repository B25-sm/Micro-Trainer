const axios = require('axios');

async function testBackendHealth() {
  try {
    console.log('Testing backend health endpoint...');
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ SUCCESS:', response.data);
  } catch (error) {
    console.log('❌ FAILED:', error.response?.status, error.response?.statusText);
    console.log('Error:', error.message);
  }
}

testBackendHealth();
