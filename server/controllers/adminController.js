const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login admin
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password harus diisi',
      });
    }

    // Get admin from database
    const [rows] = await db.query(
      'SELECT * FROM admin WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah',
      });
    }

    const admin = rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id_admin, 
        username: admin.username,
        nama_lengkap: admin.nama_lengkap 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        admin: {
          id: admin.id_admin,
          username: admin.username,
          nama_lengkap: admin.nama_lengkap,
        },
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

// Register new admin (optional, for initial setup)
exports.register = async (req, res) => {
  try {
    const { username, password, nama_lengkap } = req.body;

    if (!username || !password || !nama_lengkap) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi',
      });
    }

    // Check if username already exists
    const [existing] = await db.query(
      'SELECT * FROM admin WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin
    const [result] = await db.query(
      'INSERT INTO admin (username, password, nama_lengkap) VALUES (?, ?, ?)',
      [username, hashedPassword, nama_lengkap]
    );

    res.status(201).json({
      success: true,
      message: 'Admin berhasil didaftarkan',
      data: {
        id: result.insertId,
        username,
        nama_lengkap,
      },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message,
    });
  }
};

// Verify token (middleware)
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid',
    });
  }
};

// Get current admin profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id_admin, username, nama_lengkap, created_at FROM admin WHERE id_admin = ?',
      [req.admin.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};
