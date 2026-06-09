// Create Production Institution
const axios = require('axios');

const CENTRAL_PLATFORM_URL = 'https://microtrainer-platform.onrender.com';

async function createInstitution() {
  try {
    // Step 1: Admin Login
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post(`${CENTRAL_PLATFORM_URL}/api/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    
    // Step 2: Create Institution
    console.log('\n🏢 Creating production institution...');
    const institutionResponse = await axios.post(
      `${CENTRAL_PLATFORM_URL}/api/admin/institutions`,
      {
        name: 'My Production Institution',
        contactEmail: 'production@example.com',
        plan: 'free'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = institutionResponse.data;
    
    console.log('\n✅ Institution created successfully!');
    console.log('\n📋 RESPONSE:', JSON.stringify(data, null, 2));
    console.log('\n📋 SAVE THESE VALUES:');
    console.log('================================');
    console.log(`INSTITUTION_ID=${data.institutionId || data.institution?.institutionId}`);
    console.log(`PLATFORM_API_KEY=${data.apiKey || data.institution?.apiKey}`);
    console.log(`CENTRAL_PLATFORM_URL=${CENTRAL_PLATFORM_URL}`);
    console.log('================================');
    console.log('\n🎯 Add these to your backend environment variables on Render!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createInstitution();
