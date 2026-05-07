// =======================================================
// 🔐 PASSWORD HASH GENERATOR
// Utility to generate bcrypt password hashes
// =======================================================

const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log('\n='.repeat(60));
  console.log('🔐 PASSWORD HASH GENERATOR');
  console.log('='.repeat(60));
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log('='.repeat(60));
  console.log('\nAdd this to your .env file:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('='.repeat(60));
}

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.log('\n❌ Usage: node generate-password-hash.js <password>');
  console.log('Example: node generate-password-hash.js MySecurePassword123\n');
  process.exit(1);
}

generateHash(password);
