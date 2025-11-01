const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// POST upload image
router.post('/image', uploadController.uploadImage, uploadController.handleUpload);

module.exports = router;

