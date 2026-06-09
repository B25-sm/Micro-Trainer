// Get All Institutions
const axios = require('axios');

const CENTRAL_PLATFORM_URL = 'https://microtrainer-platform.onrender.com';

async function getInstitutions() {
  try {
    // Step 1: Admin Login
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post(`${CENTRAL_PLATFORM_URL}/api/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    
    // Step 2: Get Institutions
    console.log('\n🏢 Fetching institutions...');
    const response = await axios.get(
      `${CENTRAL_PLATFORM_URL}/api/admin/institutions`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('\n📋 FULL RESPONSE:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

getInstitutions();
