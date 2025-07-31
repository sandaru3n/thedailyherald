const express = require('express');
const path = require('path');
const fs = require('fs');
const { auth, requireRole } = require('../middleware/auth');
const { uploadFavicon, uploadsDir } = require('../middleware/upload');
const Settings = require('../models/Settings');

const router = express.Router();

// @route   POST /api/upload/favicon
// @desc    Upload favicon file
// @access  Private (Admin only)
router.post('/favicon', auth, requireRole('admin'), (req, res) => {
  console.log('Favicon upload request received');
  console.log('Request headers:', req.headers);
  console.log('Request body keys:', Object.keys(req.body || {}));
  
  uploadFavicon(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        error: err.message || 'Upload failed'
      });
    }

    console.log('File uploaded:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    try {
      // Generate the file URL
      const baseUrl = process.env.SITE_URL || 'http://localhost:5000';
      const fileUrl = `${baseUrl}/api/upload/uploads/${req.file.filename}`;

      // Update settings with new favicon URL
      let settings = await Settings.findOne({ isActive: true });
      if (!settings) {
        settings = new Settings();
      }

      // Delete old favicon file if it exists
      if (settings.siteFavicon) {
        // Extract filename from the full URL
        const oldFilename = path.basename(settings.siteFavicon);
        const oldFilePath = path.join(uploadsDir, oldFilename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update settings with new favicon URL
      settings.siteFavicon = fileUrl;
      await settings.save();

      res.json({
        success: true,
        message: 'Favicon uploaded successfully',
        fileUrl: fileUrl,
        filename: req.file.filename
      });

    } catch (error) {
      console.error('Error saving favicon:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save favicon'
      });
    }
  });
});

// @route   GET /api/upload/uploads/:filename
// @desc    Serve uploaded files
// @access  Public
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }
});

// Test endpoint to verify authentication
router.get('/test-auth', auth, requireRole('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working',
    admin: req.admin.email
  });
});

module.exports = router; 