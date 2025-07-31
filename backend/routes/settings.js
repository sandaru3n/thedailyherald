const express = require('express');
const Settings = require('../models/Settings');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/settings
// @desc    Get site settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   PUT /api/settings
// @desc    Update site settings
// @access  Private (Admin only)
router.put('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const {
      siteName,
      siteDescription,
      siteLogo,
      siteUrl,
      publisherName,
      publisherUrl,
      publisherLogo,
      socialMedia,
      contactInfo,
      seoSettings
    } = req.body;

    // Get current settings or create new ones
    let settings = await Settings.findOne({ isActive: true });
    
    if (!settings) {
      settings = new Settings();
    }

    // Update fields if provided
    if (siteName !== undefined) settings.siteName = siteName;
    if (siteDescription !== undefined) settings.siteDescription = siteDescription;
    if (siteLogo !== undefined) settings.siteLogo = siteLogo;
    // Note: siteFavicon is handled by the upload route, not here
    if (siteUrl !== undefined) settings.siteUrl = siteUrl;
    if (publisherName !== undefined) settings.publisherName = publisherName;
    if (publisherUrl !== undefined) settings.publisherUrl = publisherUrl;
    if (publisherLogo !== undefined) settings.publisherLogo = publisherLogo;
    if (socialMedia !== undefined) settings.socialMedia = socialMedia;
    if (contactInfo !== undefined) settings.contactInfo = contactInfo;
    if (seoSettings !== undefined) settings.seoSettings = seoSettings;

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   GET /api/settings/public
// @desc    Get public site settings (for structured data)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Get base URL for favicon
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    let faviconUrl = process.env.DEFAULT_FAVICON_URL || settings.siteFavicon;
    
    // If favicon URL is relative, make it absolute using base URL
    if (faviconUrl && faviconUrl.startsWith('/')) {
      faviconUrl = `${baseUrl}${faviconUrl}`;
    }
    
    // Return only public settings for structured data
    const publicSettings = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      siteUrl: settings.siteUrl,
      siteLogo: settings.siteLogo,
      siteFavicon: faviconUrl,
      publisherName: settings.publisherName,
      publisherUrl: settings.publisherUrl,
      publisherLogo: settings.publisherLogo,
      socialMedia: settings.socialMedia
    };

    res.json({
      success: true,
      settings: publicSettings
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

module.exports = router; 