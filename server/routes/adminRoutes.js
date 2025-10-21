const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// POST login
router.post('/login', adminController.login);

// POST register (optional, untuk setup awal)
router.post('/register', adminController.register);

// GET profile (protected route)
router.get('/profile', adminController.verifyToken, adminController.getProfile);

module.exports = router;
