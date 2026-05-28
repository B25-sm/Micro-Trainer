// =======================================================
// 🔒 LICENSE VALIDATION SERVICE
// Validates license keys and tracks deployments
// =======================================================

const crypto = require('crypto');

// License server URL (YOUR server that validates licenses)
const LICENSE_SERVER_URL = process.env.LICENSE_SERVER_URL || 'https://your-license-server.onrender.com';

// Local license key (from environment)
const LICENSE_KEY = process.env.LICENSE_KEY;
const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'localhost';
const STUDENT_EMAIL = process.env.STUDENT_EMAIL;

console.log('🔒 License Service initialized');

// =======================================================
// 🔹 VALIDATE LICENSE (Remote)
// =======================================================
async function validateLicense() {
  try {
    console.log('🔍 Validating license...');
    
    // Check if license key exists
    if (!LICENSE_KEY) {
      console.error('❌ LICENSE_KEY not found in environment variables');
      console.error('');
      console.error('📋 To obtain a license key:');
      console.error('   1. Contact: [your-email@example.com]');
      console.error('   2. Subject: "MicroTrainer License Request"');
      console.error('   3. Include: Your name, email, and intended use');
      console.error('');
      console.error('📄 See LICENSE file for full terms');
      return false;
    }
    
    // Check if student email exists
    if (!STUDENT_EMAIL) {
      console.error('❌ STUDENT_EMAIL not found in environment variables');
      console.error('   Add STUDENT_EMAIL=your@email.com to .env');
      return false;
    }
    
    // Call license server to validate
    const response = await fetch(`${LICENSE_SERVER_URL}/api/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license_key: LICENSE_KEY,
        deployment_url: DEPLOYMENT_URL,
        student_email: STUDENT_EMAIL,
        timestamp: Date.now(),
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ License validation failed:', error.message);
      console.error('');
      console.error('📧 Contact: [your-email@example.com]');
      console.error('🌐 Website: [https://your-website.com]');
      return false;
    }
    
    const result = await response.json();
    
    if (result.valid) {
      console.log('✅ License validated successfully');
      console.log(`   Student: ${result.student_name || STUDENT_EMAIL}`);
      console.log(`   Expires: ${result.expires_at || 'Never'}`);
      return true;
    } else {
      console.error('❌ Invalid license:', result.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ License validation error:', error.message);
    console.error('');
    console.error('⚠️  Could not connect to license server');
    console.error('   This might be a network issue or the license server is down');
    console.error('');
    console.error('📧 Contact: [your-email@example.com] if this persists');
    
    // In development, allow to continue with warning
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Running in development mode - continuing without validation');
      return true;
    }
    
    return false;
  }
}

// =======================================================
// 🔹 VALIDATE LICENSE (Offline Fallback)
// =======================================================
function validateLicenseOffline() {
  try {
    if (!LICENSE_KEY) {
      return false;
    }
    
    // Simple format: email:hash
    const [email, hash] = LICENSE_KEY.split(':');
    
    if (!email || !hash) {
      console.error('❌ Invalid license key format');
      return false;
    }
    
    // Verify hash (simple check)
    const expectedHash = crypto
      .createHash('sha256')
      .update(`${email}:microtrainer:2026`)
      .digest('hex')
      .substring(0, 16);
    
    if (hash !== expectedHash) {
      console.error('❌ Invalid license key');
      return false;
    }
    
    console.log('✅ License validated (offline mode)');
    console.log(`   Email: ${email}`);
    return true;
    
  } catch (error) {
    console.error('❌ Offline validation error:', error.message);
    return false;
  }
}

// =======================================================
// 🔹 PERIODIC LICENSE CHECK
// =======================================================
function startPeriodicCheck(intervalMinutes = 60) {
  console.log(`🔄 Starting periodic license check (every ${intervalMinutes} minutes)`);
  
  setInterval(async () => {
    console.log('🔍 Periodic license check...');
    const valid = await validateLicense();
    
    if (!valid) {
      console.error('❌ License validation failed during periodic check');
      console.error('⚠️  Application will continue but may be terminated');
      console.error('📧 Contact: [your-email@example.com]');
    }
  }, intervalMinutes * 60 * 1000);
}

// =======================================================
// 🔹 GENERATE LICENSE KEY (For your use)
// =======================================================
function generateLicenseKey(email) {
  const hash = crypto
    .createHash('sha256')
    .update(`${email}:microtrainer:2026`)
    .digest('hex')
    .substring(0, 16);
  
  return `${email}:${hash}`;
}

// =======================================================
// 🔹 CHECK ATTRIBUTION
// =======================================================
function checkAttribution() {
  // This would check if attribution is present in the frontend
  // For now, just log a reminder
  console.log('');
  console.log('📋 ATTRIBUTION REMINDER:');
  console.log('   Please ensure "Powered by MicroTrainer" is visible in your UI');
  console.log('   See LICENSE file for attribution requirements');
  console.log('');
}

module.exports = {
  validateLicense,
  validateLicenseOffline,
  startPeriodicCheck,
  generateLicenseKey,
  checkAttribution,
};
