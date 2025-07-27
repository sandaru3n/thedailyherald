const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Get navigation settings
router.get('/', async (req, res) => {
  try {
    // For now, return empty array - in a real app, you'd fetch from database
    res.json({
      success: true,
      navigation: []
    });
  } catch (error) {
    console.error('Error fetching navigation settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch navigation settings'
    });
  }
});

// Save navigation settings (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { navigation } = req.body;
    
    // Validate navigation data
    if (!Array.isArray(navigation)) {
      return res.status(400).json({
        success: false,
        message: 'Navigation must be an array'
      });
    }

    // In a real app, you'd save this to a database
    // For now, just return success
    console.log('Saving navigation settings:', navigation);
    
    res.json({
      success: true,
      message: 'Navigation settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving navigation settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save navigation settings'
    });
  }
});

module.exports = router; 