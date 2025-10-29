const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const { Pool } = require('pg');
require('dotenv').config();

// Simplified configuration using connection string with SSL
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
};

// Create connection pool for PostgreSQL
const pool = new Pool(poolConfig);

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Connection string:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    console.error('   Check your .env file configuration');
    return;
  }
  console.log('✅ PostgreSQL database connected successfully');
});

module.exports = pool;
