const express = require('express');
const router = express.Router();
const RssFeed = require('../models/RssFeed');
const Admin = require('../models/Admin');
const rssService = require('../services/rssService');
const { auth } = require('../middleware/auth');

// Get all RSS feeds
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const feeds = await RssFeed.find(query)
      .populate('defaultAuthor', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await RssFeed.countDocuments(query);

    res.json({
      feeds,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single RSS feed
router.get('/:id', auth, async (req, res) => {
  try {
    const feed = await RssFeed.findById(req.params.id)
      .populate('defaultAuthor', 'name email');

    if (!feed) {
      return res.status(404).json({ message: 'RSS feed not found' });
    }

    res.json(feed);
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new RSS feed
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      feedUrl,
      defaultAuthorId,
      minContentLength,
      maxPostsPerDay,
      settings
    } = req.body;

    // Validate required fields
    if (!name || !feedUrl || !defaultAuthorId) {
      return res.status(400).json({ 
        message: 'Name, feed URL, and default author are required' 
      });
    }

    // Validate author exists
    const author = await Admin.findById(defaultAuthorId);
    if (!author) {
      return res.status(400).json({ message: 'Author not found' });
    }

    // Test RSS feed URL
    try {
      await rssService.fetchRssFeed(feedUrl);
    } catch (error) {
      return res.status(400).json({ 
        message: 'Invalid RSS feed URL or feed is not accessible' 
      });
    }

    const feed = new RssFeed({
      name,
      feedUrl,
      defaultAuthor: defaultAuthorId,
      minContentLength: minContentLength || 100,
      maxPostsPerDay: maxPostsPerDay || 5,
      settings: {
        enableAiRewrite: settings?.enableAiRewrite ?? true,
        aiRewriteStyle: settings?.aiRewriteStyle || 'professional',
        includeOriginalSource: settings?.includeOriginalSource ?? true,
        autoPublish: settings?.autoPublish ?? true,
        publishDelay: settings?.publishDelay || 0,
        enableAutoCategory: settings?.enableAutoCategory ?? true
      }
    });

    await feed.save();

    const populatedFeed = await RssFeed.findById(feed._id)
      .populate('defaultAuthor', 'name email');

    res.status(201).json(populatedFeed);
  } catch (error) {
    console.error('Error creating RSS feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update RSS feed
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      feedUrl,
      defaultAuthorId,
      minContentLength,
      maxPostsPerDay,
      isActive,
      settings
    } = req.body;

    const feed = await RssFeed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'RSS feed not found' });
    }

    // Validate author if provided
    if (defaultAuthorId) {
      const author = await Admin.findById(defaultAuthorId);
      if (!author) {
        return res.status(400).json({ message: 'Author not found' });
      }
      feed.defaultAuthor = defaultAuthorId;
    }

    // Test RSS feed URL if changed
    if (feedUrl && feedUrl !== feed.feedUrl) {
      try {
        await rssService.fetchRssFeed(feedUrl);
        feed.feedUrl = feedUrl;
      } catch (error) {
        return res.status(400).json({ 
          message: 'Invalid RSS feed URL or feed is not accessible' 
        });
      }
    }

    // Update fields
    if (name) feed.name = name;
    if (minContentLength !== undefined) feed.minContentLength = minContentLength;
    if (maxPostsPerDay !== undefined) feed.maxPostsPerDay = maxPostsPerDay;
    if (isActive !== undefined) feed.isActive = isActive;
    
    if (settings) {
      feed.settings = {
        ...feed.settings,
        ...settings
      };
    }

    await feed.save();

    const updatedFeed = await RssFeed.findById(feed._id)
      .populate('defaultAuthor', 'name email');

    res.json(updatedFeed);
  } catch (error) {
    console.error('Error updating RSS feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete RSS feed
router.delete('/:id', auth, async (req, res) => {
  try {
    const feed = await RssFeed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'RSS feed not found' });
    }

    await RssFeed.findByIdAndDelete(req.params.id);
    res.json({ message: 'RSS feed deleted successfully' });
  } catch (error) {
    console.error('Error deleting RSS feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process single RSS feed
router.post('/:id/process', auth, async (req, res) => {
  try {
    const feed = await RssFeed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'RSS feed not found' });
    }

    if (!feed.isActive) {
      return res.status(400).json({ message: 'RSS feed is not active' });
    }

    const result = await rssService.processRssFeed(req.params.id);
    
    res.json({
      message: 'RSS feed processed successfully',
      result
    });
  } catch (error) {
    console.error('Error processing RSS feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process all active RSS feeds
router.post('/process/all', auth, async (req, res) => {
  try {
    const results = await rssService.processAllActiveFeeds();
    
    res.json({
      message: 'All RSS feeds processed',
      results
    });
  } catch (error) {
    console.error('Error processing all RSS feeds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test RSS feed URL
router.post('/test', auth, async (req, res) => {
  try {
    const { feedUrl } = req.body;
    
    if (!feedUrl) {
      return res.status(400).json({ message: 'Feed URL is required' });
    }

    const items = await rssService.fetchRssFeed(feedUrl);
    
    // Extract sample data from first few items
    const sampleItems = items.slice(0, 3).map(item => ({
      title: item.title || 'No title',
      description: item.description || item.summary || 'No description',
      link: item.link || 'No link',
      pubDate: item.pubDate || item.published || 'No date'
    }));

    res.json({
      message: 'RSS feed is valid',
      totalItems: items.length,
      sampleItems
    });
  } catch (error) {
    console.error('Error testing RSS feed:', error);
    res.status(400).json({ 
      message: 'Invalid RSS feed or not accessible',
      error: error.message 
    });
  }
});

// Test category identification
router.post('/test-category', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const categoryIdentificationService = require('../services/categoryIdentificationService');
    const result = await categoryIdentificationService.identifyCategoryWithConfidence(title, content);
    
    if (!result.category) {
      return res.status(500).json({ 
        message: 'Failed to identify category',
        error: 'No category could be determined'
      });
    }
    
    res.json({
      message: 'Category identified successfully',
      category: {
        _id: result.category._id,
        name: result.category.name,
        description: result.category.description
      },
      confidence: result.confidence,
      confidencePercentage: (result.confidence * 100).toFixed(1),
      method: result.method,
      analysis: {
        title: title,
        contentPreview: content.substring(0, 200) + '...',
        totalWords: content.split(' ').length
      }
    });
  } catch (error) {
    console.error('Error testing category identification:', error);
    res.status(500).json({ 
      message: 'Error identifying category',
      error: error.message 
    });
  }
});

// Get RSS feed statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const feed = await RssFeed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'RSS feed not found' });
    }

    const stats = {
      totalPostsPublished: feed.totalPostsPublished,
      postsPublishedToday: feed.postsPublishedToday,
      maxPostsPerDay: feed.maxPostsPerDay,
      lastFetched: feed.lastFetched,
      lastPublished: feed.lastPublished,
      isActive: feed.isActive,
      errorLogCount: feed.errorLog.length,
      recentErrors: feed.errorLog.slice(-5)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching RSS feed stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear error logs
router.delete('/:id/errors', auth, async (req, res) => {
  try {
    const feed = await RssFeed.findById(req.params.id);
    if (!feed) {
      return res.status(404).json({ message: 'RSS feed not found' });
    }

    await feed.clearErrorLogs();
    res.json({ message: 'Error logs cleared successfully' });
  } catch (error) {
    console.error('Error clearing error logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 