/**
 * Script untuk generate password hash
 * Gunakan ini untuk membuat password admin baru
 * 
 * Usage:
 * node scripts/hashPassword.js <password>
 * 
 * Example:
 * node scripts/hashPassword.js admin123
 */

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Password tidak diberikan');
  console.log('\nUsage:');
  console.log('  node scripts/hashPassword.js <password>');
  console.log('\nContoh:');
  console.log('  node scripts/hashPassword.js admin123');
  process.exit(1);
}

async function hashPassword(password) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('\n✅ Password berhasil di-hash!\n');
    console.log('Password asli:', password);
    console.log('Password hash:', hash);
    console.log('\nGunakan hash ini di database:');
    console.log(`INSERT INTO admin (username, password, nama_lengkap) VALUES ('admin', '${hash}', 'Administrator');`);
    console.log('\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

hashPassword(password);
