const upload = require('../config/multer');
const path = require('path');

// Upload single image
exports.uploadImage = upload.single('image');

// After upload, return the file path
exports.handleUpload = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Return the file URL/path
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message,
    });
  }
};

