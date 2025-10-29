const { Pool } = require('pg');
require('dotenv').config();

// Support connection string atau individual params
const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

poolConfig.ssl = { rejectUnauthorized: false };

// Force IPv4 to avoid ENETUNREACH error on Railway
poolConfig.family = 4;

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
