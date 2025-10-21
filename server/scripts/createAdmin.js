/**
 * Script untuk membuat admin baru langsung ke database
 * 
 * Usage:
 * node scripts/createAdmin.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('\n🔐 Setup Admin Baru\n');
    
    const username = await question('Username: ');
    const password = await question('Password: ');
    const namaLengkap = await question('Nama Lengkap: ');
    
    if (!username || !password || !namaLengkap) {
      console.error('❌ Semua field harus diisi!');
      rl.close();
      process.exit(1);
    }
    
    // Check if username exists
    const [existing] = await db.query(
      'SELECT * FROM admin WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      console.error(`❌ Username '${username}' sudah digunakan!`);
      rl.close();
      process.exit(1);
    }
    
    // Hash password
    console.log('\n⏳ Membuat hash password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert to database
    console.log('⏳ Menyimpan ke database...');
    const [result] = await db.query(
      'INSERT INTO admin (username, password, nama_lengkap) VALUES (?, ?, ?)',
      [username, hashedPassword, namaLengkap]
    );
    
    console.log('\n✅ Admin berhasil dibuat!\n');
    console.log('ID:', result.insertId);
    console.log('Username:', username);
    console.log('Nama Lengkap:', namaLengkap);
    console.log('\n⚠️  Simpan password Anda dengan aman!\n');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
