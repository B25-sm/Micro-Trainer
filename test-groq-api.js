// Test GROQ API
const axios = require('axios');

// API key from your backend
const GROQ_API_KEY = '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';

async function testGroqAPI() {
  console.log('🧪 Testing GROQ API...\n');
  console.log('✅ API Key:', GROQ_API_KEY.substring(0, 15) + '...');
  console.log('📡 Making test request to GROQ...\n');
  
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { 
            role: 'user', 
            content: 'Say "GROQ API is working!" in exactly 5 words.' 
          }
        ],
        temperature: 0.5,
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    const reply = response.data.choices[0].message.content;
    
    console.log('✅ GROQ API Response:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(reply);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 GROQ API IS WORKING PERFECTLY!\n');
    
  } catch (error) {
    console.error('❌ GROQ API ERROR:\n');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.error('\n⚠️  INVALID API KEY!');
      } else if (error.response.status === 429) {
        console.error('\n⚠️  RATE LIMIT EXCEEDED!');
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('⚠️  REQUEST TIMEOUT!');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testGroqAPI();
