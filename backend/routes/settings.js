const express = require('express');
const Settings = require('../models/Settings');
const { auth, requireRole } = require('../middleware/auth');
const googleInstantIndexingService = require('../services/googleInstantIndexingService');
const queueService = require('../services/queueService')();

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
      seoSettings,
      googleInstantIndexing
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
    
    // Update Google Instant Indexing settings
    if (googleInstantIndexing !== undefined) {
      if (googleInstantIndexing.enabled !== undefined) {
        settings.googleInstantIndexing.enabled = googleInstantIndexing.enabled;
      }
      if (googleInstantIndexing.serviceAccountJson !== undefined) {
        settings.googleInstantIndexing.serviceAccountJson = googleInstantIndexing.serviceAccountJson;
      }
      if (googleInstantIndexing.projectId !== undefined) {
        settings.googleInstantIndexing.projectId = googleInstantIndexing.projectId;
      }
    }

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

// @route   POST /api/settings/google-indexing/test
// @desc    Test Google Instant Indexing configuration
// @access  Private (Admin only)
router.post('/google-indexing/test', auth, requireRole('admin'), async (req, res) => {
  try {
    const result = await googleInstantIndexingService.testConfiguration();
    res.json({
      success: result.success,
      message: result.message || result.error,
      details: result.details
    });
  } catch (error) {
    console.error('Test Google Indexing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test Google Instant Indexing configuration',
      details: error.message
    });
  }
});

// @route   GET /api/settings/google-indexing/stats
// @desc    Get Google Instant Indexing statistics
// @access  Private (Admin only)
router.get('/google-indexing/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const stats = await googleInstantIndexingService.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get Google Indexing stats error:', error);
    // Return default stats instead of error to prevent frontend issues
    res.json({
      success: true,
      stats: {
        enabled: false,
        lastIndexedAt: null,
        totalIndexed: 0,
        projectId: null
      }
    });
  }
});

// @route   POST /api/settings/google-indexing/submit-url
// @desc    Submit a URL for instant indexing
// @access  Private (Admin only)
router.post('/google-indexing/submit-url', auth, requireRole('admin'), async (req, res) => {
  try {
    const { url, type = 'URL_UPDATED' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Validate submission type
    if (!['URL_UPDATED', 'URL_DELETED'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid submission type. Must be URL_UPDATED or URL_DELETED'
      });
    }

    console.log(`🚀 Submitting URL for indexing: ${url} (${type})`);
    const result = await googleInstantIndexingService.submitUrl(url, type);

    if (result.success) {
      console.log(`✅ URL submitted successfully: ${url}`);
      res.json({
        success: true,
        message: `URL submitted successfully for ${type === 'URL_UPDATED' ? 'indexing' : 'removal'}`,
        details: result.data
      });
    } else {
      console.log(`❌ URL submission failed: ${url} - ${result.error}`);
      res.status(400).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }
  } catch (error) {
    console.error('Submit URL for indexing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit URL for indexing',
      details: error.message
    });
  }
});

// @route   GET /api/settings/google-indexing/queue-status
// @desc    Get indexing queue status
// @access  Private (Admin only)
router.get('/google-indexing/queue-status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const queueStatus = await queueService.getQueueStatus();
    const queueItems = await queueService.getQueueItems();
    res.json({ success: true, queueStatus, queueItems });
  } catch (error) {
    console.error('Queue status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get queue status',
      details: error.message 
    });
  }
});

// @route   POST /api/settings/google-indexing/queue-clear
// @desc    Clear indexing queue
// @access  Private (Admin only)
router.post('/google-indexing/queue-clear', auth, requireRole(['admin']), async (req, res) => {
  try {
    await queueService.clearQueue();
    res.json({ success: true, message: 'Queue cleared successfully' });
  } catch (error) {
    console.error('Clear queue error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear queue',
      details: error.message 
    });
  }
});

// @route   POST /api/settings/google-indexing/queue-retry
// @desc    Retry failed queue items
// @access  Private (Admin only)
router.post('/google-indexing/queue-retry', auth, requireRole(['admin']), async (req, res) => {
  try {
    await queueService.retryFailedItems();
    res.json({ success: true, message: 'Failed items retried' });
  } catch (error) {
    console.error('Retry failed items error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retry items',
      details: error.message 
    });
  }
});

// Get text replacement rules
router.get('/text-replacements', auth, async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      success: true,
      textReplacements: settings.textReplacements || { enabled: false, rules: [] }
    });
  } catch (error) {
    console.error('Error fetching text replacements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch text replacements' });
  }
});

// Update text replacement rules
router.put('/text-replacements', auth, async (req, res) => {
  try {
    const { enabled, rules } = req.body;
    
    const settings = await Settings.getSettings();
    settings.textReplacements = {
      enabled: enabled || false,
      rules: rules || []
    };
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Text replacements updated successfully',
      textReplacements: settings.textReplacements
    });
  } catch (error) {
    console.error('Error updating text replacements:', error);
    res.status(500).json({ success: false, message: 'Failed to update text replacements' });
  }
});

// Add a new text replacement rule
router.post('/text-replacements/rules', auth, async (req, res) => {
  try {
    const { find, replace, description } = req.body;
    
    if (!find || !replace) {
      return res.status(400).json({ 
        success: false, 
        message: 'Find and replace text are required' 
      });
    }
    
    const settings = await Settings.getSettings();
    
    if (!settings.textReplacements) {
      settings.textReplacements = { enabled: false, rules: [] };
    }
    
    settings.textReplacements.rules.push({
      find,
      replace,
      description: description || '',
      isActive: true
    });
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Text replacement rule added successfully',
      rule: settings.textReplacements.rules[settings.textReplacements.rules.length - 1]
    });
  } catch (error) {
    console.error('Error adding text replacement rule:', error);
    res.status(500).json({ success: false, message: 'Failed to add text replacement rule' });
  }
});

// Update a text replacement rule
router.put('/text-replacements/rules/:index', auth, async (req, res) => {
  try {
    const { index } = req.params;
    const { find, replace, description, isActive } = req.body;
    
    const settings = await Settings.getSettings();
    
    if (!settings.textReplacements || !settings.textReplacements.rules[index]) {
      return res.status(404).json({ 
        success: false, 
        message: 'Text replacement rule not found' 
      });
    }
    
    const rule = settings.textReplacements.rules[index];
    rule.find = find || rule.find;
    rule.replace = replace || rule.replace;
    rule.description = description !== undefined ? description : rule.description;
    rule.isActive = isActive !== undefined ? isActive : rule.isActive;
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Text replacement rule updated successfully',
      rule
    });
  } catch (error) {
    console.error('Error updating text replacement rule:', error);
    res.status(500).json({ success: false, message: 'Failed to update text replacement rule' });
  }
});

// Delete a text replacement rule
router.delete('/text-replacements/rules/:index', auth, async (req, res) => {
  try {
    const { index } = req.params;
    
    const settings = await Settings.getSettings();
    
    if (!settings.textReplacements || !settings.textReplacements.rules[index]) {
      return res.status(404).json({ 
        success: false, 
        message: 'Text replacement rule not found' 
      });
    }
    
    settings.textReplacements.rules.splice(index, 1);
    await settings.save();
    
    res.json({
      success: true,
      message: 'Text replacement rule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting text replacement rule:', error);
    res.status(500).json({ success: false, message: 'Failed to delete text replacement rule' });
  }
});

// Test text replacement
router.post('/text-replacements/test', auth, async (req, res) => {
  try {
    const { text, rules } = req.body;
    
    if (!text || !rules || !Array.isArray(rules)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Text and rules array are required' 
      });
    }
    
    let result = text;
    
    // Apply each replacement rule
    for (const rule of rules) {
      if (rule.isActive && rule.find && rule.replace) {
        const regex = new RegExp(rule.find, 'g');
        result = result.replace(regex, rule.replace);
      }
    }
    
    res.json({
      success: true,
      original: text,
      result: result,
      changed: text !== result
    });
  } catch (error) {
    console.error('Error testing text replacement:', error);
    res.status(500).json({ success: false, message: 'Failed to test text replacement' });
  }
});

// Test text replacements on existing articles
router.post('/text-replacements/test-existing', auth, async (req, res) => {
  try {
    const { testExistingArticles } = require('../utils/updateExistingArticles');
    const result = await testExistingArticles();
    
    res.json({
      success: result.success,
      message: result.message || 'Test completed',
      processed: result.processed,
      updated: result.updated,
      errors: result.errors,
      dryRun: true
    });
  } catch (error) {
    console.error('Error testing existing articles:', error);
    res.status(500).json({ success: false, message: 'Failed to test existing articles' });
  }
});

// Apply text replacements to existing articles
router.post('/text-replacements/apply-existing', auth, async (req, res) => {
  try {
    const { applyToExistingArticles } = require('../utils/updateExistingArticles');
    const result = await applyToExistingArticles();
    
    res.json({
      success: result.success,
      message: result.message || 'Update completed',
      processed: result.processed,
      updated: result.updated,
      errors: result.errors,
      dryRun: false
    });
  } catch (error) {
    console.error('Error updating existing articles:', error);
    res.status(500).json({ success: false, message: 'Failed to update existing articles' });
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
      socialMedia: settings.socialMedia,
      contactInfo: settings.contactInfo
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