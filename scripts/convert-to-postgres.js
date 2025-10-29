#!/usr/bin/env node

/**
 * Script untuk mengkonversi sintaks MySQL ke PostgreSQL
 * 
 * Cara pakai:
 * node scripts/convert-to-postgres.js
 * 
 * Atau run langsung:
 * chmod +x scripts/convert-to-postgres.js
 * ./scripts/convert-to-postgres.js
 */

const fs = require('fs');
const path = require('path');

// Files yang perlu dikonversi
const filesToConvert = [
  'server/controllers/barangController.js',
  'server/controllers/peminjamanController.js',
  'server/controllers/adminController.js'
];

console.log('🚀 Mulai konversi MySQL → PostgreSQL...\n');

filesToConvert.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File tidak ditemukan: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  
  // 1. Replace [rows] destructuring dengan result.rows
  if (content.includes('const [rows] = await db.query')) {
    content = content.replace(/const \[rows\] = await db\.query\(/g, 'const result = await db.query(');
    content = content.replace(/if \(rows\.length === 0\)/g, 'if (result.rows.length === 0)');
    content = content.replace(/rows\[0\]/g, 'result.rows[0]');
    content = content.replace(/return rows;/g, 'return result.rows;');
    content = content.replace(/data: rows,/g, 'data: result.rows,');
    content = content.replace(/rows,/g, 'result.rows,');
    changed = true;
  }
  
  // 2. Replace ? dengan $1, $2, dst
  // Ini perlu manual karena sequencenya
  let placeholderIndex = 1;
  content = content.replace(/\?/g, () => {
    const currentIndex = placeholderIndex;
    placeholderIndex++;
    return `$${currentIndex}`;
  });
  
  // Reset placeholder index
  placeholderIndex = 1;
  
  // 3. Replace insertId
  content = content.replace(/result\.insertId/g, 'result.rows[0].id_barang');
  content = content.replace(/result\.rows\[0\]\.id_barang\|result\.rows\[0\]\.id_admin/g, 'result.rows[0].id');
  
  // 4. Replace affectedRows
  content = content.replace(/result\.affectedRows === 0/g, 'result.rowCount === 0');
  content = content.replace(/result\.affectedRows ===/g, 'result.rowCount ===');
  
  // 5. Replace insert returning
  const insertPattern = /INSERT INTO (\w+) \((.*?)\) VALUES \((.*?)\)/g;
  content = content.replace(insertPattern, (match, table, columns, values) => {
    const primaryKey = table === 'barang' ? 'id_barang' : 
                     table === 'peminjaman' ? 'id_peminjaman' :
                     table === 'admin' ? 'id_admin' : 'id';
    return `INSERT INTO ${table} (${columns}) VALUES (${values}) RETURNING ${primaryKey}`;
  });
  
  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Dikonevensi: ${filePath}`);
  } else {
    console.log(`⏭️  Tidak ada perubahan: ${filePath}`);
  }
});

console.log('\n✨ Konversi selesai!');
console.log('\n⚠️  CATATAN: Script ini masih butuh review manual:');
console.log('1. Cek semua file yang dikonversi');
console.log('2. Pastikan RETURNING clause sudah benar');
console.log('3. Test tiap endpoint setelah konversi');
console.log('\nNext steps:');
console.log('1. npm install pg (di folder server)');
console.log('2. Jalankan migration: DATABASE_SCHEMA_POSTGRES.sql di Supabase');
console.log('3. Deploy dan test!');

