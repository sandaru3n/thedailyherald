const express = require('express');
const Article = require('../models/Article');
const Category = require('../models/Category');
const Settings = require('../models/Settings');
const { auth, requireRole } = require('../middleware/auth');
const queueService = require('../services/queueService')();
const sitemapService = require('../services/sitemapService');

const router = express.Router();

// Helper function to get correct site URL
async function getCorrectSiteUrl() {
  try {
    const settings = await Settings.getSettings();
    
    // Priority order: settings.siteUrl > NEXT_PUBLIC_SITE_URL > SITE_URL > localhost
    let siteUrl = settings.siteUrl;
    
    if (!siteUrl || siteUrl.includes('localhost')) {
      siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    }
    
    if (!siteUrl || siteUrl.includes('localhost')) {
      siteUrl = process.env.SITE_URL;
    }
    
    if (!siteUrl || siteUrl.includes('localhost')) {
      // If still no valid URL, try to construct from settings
      if (settings.publisherUrl) {
        siteUrl = settings.publisherUrl;
      } else {
        siteUrl = 'http://localhost:3000';
      }
    }
    
    // Ensure the URL doesn't end with a slash
    if (siteUrl && siteUrl.endsWith('/')) {
      siteUrl = siteUrl.slice(0, -1);
    }
    
    // Ensure the URL has a proper protocol
    if (siteUrl && !siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
      // For production, prefer HTTPS
      if (siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')) {
        siteUrl = `http://${siteUrl}`;
      } else {
        siteUrl = `https://${siteUrl}`;
      }
    }
    
    // For production URLs, ensure HTTPS is used
    if (siteUrl && !siteUrl.includes('localhost') && !siteUrl.includes('127.0.0.1') && siteUrl.startsWith('http://')) {
      siteUrl = siteUrl.replace('http://', 'https://');
    }
    
    console.log(`Using site URL for article indexing: ${siteUrl}`);
    return siteUrl;
  } catch (error) {
    console.error('Error getting site URL:', error);
    return 'http://localhost:3000';
  }
}

// Helper function to add article to indexing queue
async function addArticleToIndexingQueue(article) {
  try {
    console.log(`📋 Checking Google Instant Indexing configuration for article: "${article.title}"`);
    
    const settings = await Settings.getSettings();
    
    if (!settings.googleInstantIndexing?.enabled) {
      console.log('⚠️  Google Instant Indexing is not enabled, skipping queue addition');
      return;
    }

    // Get the correct site URL
    const siteUrl = await getCorrectSiteUrl();
    const articleUrl = `${siteUrl}/article/${article.slug}`;
    
    console.log(`🚀 Adding article to indexing queue: ${articleUrl}`);
    console.log(`   Article Title: "${article.title}"`);
    console.log(`   Article ID: ${article._id}`);
    console.log(`   Article Status: ${article.status}`);

    // Add to queue for immediate processing
    await queueService.addToQueue(article, 'URL_UPDATED');
    
    console.log(`✅ Article "${article.title}" added to indexing queue successfully`);
    
  } catch (error) {
    console.error(`❌ CRITICAL ERROR adding article to indexing queue: "${article.title}"`);
    console.error(`   Error Type: ${error.name || 'Unknown'}`);
    console.error(`   Error Message: ${error.message}`);
    console.error(`   Article ID: ${article._id}`);
    console.error(`   Article Slug: ${article.slug}`);
    
    // Log additional context for debugging
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    if (error.stack) {
      console.error(`   Stack Trace: ${error.stack}`);
    }
    
    // Check if it's a configuration issue
    if (error.message && error.message.includes('Google Instant Indexing')) {
      console.error(`🔧 CONFIGURATION ISSUE: Check Google Instant Indexing settings in admin panel`);
    }
  }
}

// @route   GET /api/articles
// @desc    Get all articles (with pagination and filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'published',
      category,
      search,
      titleSearch,
      featured,
      sort = '-publishedAt'
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      // First find the category by slug
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // If category not found, return empty results
        return res.json({
          success: true,
          docs: [],
          totalDocs: 0,
          limit: parseInt(limit),
          page: parseInt(page),
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null
        });
      }
    }

    // Filter by featured
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    // Title-only search functionality
    if (titleSearch) {
      query.title = { $regex: titleSearch, $options: 'i' };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'category', select: 'name color slug' },
        { path: 'author', select: 'name profilePicture description' }
      ]
    };

    const articles = await Article.paginate(query, options);

    res.json({
      success: true,
      ...articles
    });

  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   GET /api/articles/sitemap
// @desc    Get articles for sitemap (optimized for speed)
// @access  Public
router.get('/sitemap', async (req, res) => {
  try {
    const { page = 1, limit = 10000 } = req.query; // Very high default limit to get all articles

    const query = { status: 'published' };
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-publishedAt',
      // Only select fields needed for sitemap
      select: 'slug publishedAt updatedAt'
    };

    const articles = await Article.paginate(query, options);

    // Add cache headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=1800, s-maxage=1800', // 30 minutes cache
      'Content-Type': 'application/json'
    });

    console.log(`📊 Sitemap endpoint returning ${articles.docs?.length || 0} articles`);

    res.json({
      success: true,
      ...articles
    });

  } catch (error) {
    console.error('Get articles for sitemap error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   POST /api/articles/sitemap/refresh
// @desc    Manually trigger sitemap refresh
// @access  Private (Admin only)
router.post('/sitemap/refresh', auth, requireRole(['admin']), async (req, res) => {
  try {
    console.log('🔄 Manual sitemap refresh triggered by admin');
    
    // Force refresh all sitemaps
    await sitemapService.forceRefreshSitemaps();
    
    res.json({
      success: true,
      message: 'Sitemap refresh completed successfully'
    });
  } catch (error) {
    console.error('Manual sitemap refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh sitemap'
    });
  }
});

// @route   POST /api/articles/sitemap/trigger
// @desc    Trigger immediate sitemap update (no auth required for internal use)
// @access  Public (for internal service calls)
router.post('/sitemap/trigger', async (req, res) => {
  try {
    console.log('🔄 Immediate sitemap update triggered');
    
    // Trigger immediate sitemap refresh
    await sitemapService.triggerSitemapUpdate({ title: 'System Update' }, 'system');
    
    res.json({
      success: true,
      message: 'Sitemap update triggered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Immediate sitemap update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger sitemap update'
    });
  }
});

// @route   GET /api/articles/sitemap/status
// @desc    Get sitemap status and validation
// @access  Private (Admin only)
router.get('/sitemap/status', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Get all published articles count
    const publishedArticles = await Article.countDocuments({ status: 'published' });
    
    // Validate sitemap structure
    const isValid = await sitemapService.validateSitemap();
    
    // Get recent articles for sitemap verification
    const recentArticles = await Article.find({ status: 'published' })
      .select('slug title publishedAt')
      .sort('-publishedAt')
      .limit(10);
    
    res.json({
      success: true,
      sitemapStatus: {
        isValid,
        publishedArticlesCount: publishedArticles,
        recentArticles: recentArticles.map(article => ({
          slug: article.slug,
          title: article.title,
          publishedAt: article.publishedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get sitemap status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sitemap status'
    });
  }
});

// @route   GET /api/articles/:id
// @desc    Get single article by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('category', 'name color slug')
      .populate('author', 'name profilePicture description');

    if (!article) {
      return res.status(404).json({
        error: 'Article not found'
      });
    }

    // Increment views for published articles
    if (article.status === 'published') {
      await article.incrementViews();
    }

    res.json({
      success: true,
      article
    });

  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   GET /api/articles/slug/:slug
// @desc    Get single article by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug })
      .populate('category', 'name color slug')
      .populate('author', 'name profilePicture description');

    if (!article) {
      return res.status(404).json({
        error: 'Article not found'
      });
    }

    // Increment views for published articles
    if (article.status === 'published') {
      await article.incrementViews();
    }

    res.json({
      success: true,
      article
    });

  } catch (error) {
    console.error('Get article by slug error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   POST /api/articles
// @desc    Create new article
// @access  Private (Admin only)
router.post('/', auth, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      isFeatured,
      isBreaking,
      status,
      seoTitle,
      seoDescription,
      metaKeywords
    } = req.body;

    console.log('Received article data:', { title, status, category }); // Debug log

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        error: 'Title, content, and category are required'
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        error: 'Category not found'
      });
    }

    // Create article
    const article = new Article({
      title,
      content,
      excerpt,
      category,
      author: req.admin._id,
      tags: tags || [],
      featuredImage,
      isFeatured: isFeatured || false,
      isBreaking: isBreaking || false,
      status: status || 'draft',
      seoTitle,
      seoDescription,
      metaKeywords: metaKeywords || []
    });

    console.log('Article status before save:', article.status); // Debug log

    // Ensure slug is generated
    if (!article.slug) {
      article.slug = await Article.generateUniqueSlug(article.title);
    }

    await article.save();

    console.log('Article saved with status:', article.status); // Debug log

    // Increment category article count
    await categoryExists.incrementArticleCount();

    // Populate category and author
    await article.populate('category', 'name color');
    await article.populate('author', 'name');

    // Submit for instant indexing if article is published
    if (article.status === 'published') {
      await addArticleToIndexingQueue(article);
    }

    // Trigger sitemap update for new article
    await sitemapService.triggerSitemapUpdate(article, 'create');

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      article
    });

  } catch (error) {
    console.error('Create article error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Article with this title already exists'
      });
    }
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   PUT /api/articles/:id
// @desc    Update article
// @access  Private (Admin only)
router.put('/:id', auth, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      isFeatured,
      isBreaking,
      status,
      seoTitle,
      seoDescription,
      metaKeywords
    } = req.body;

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found'
      });
    }

    // Check if category is being changed
    const oldCategoryId = article.category;
    const newCategoryId = category;

    // Update article
    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (category) updates.category = category;
    if (tags) updates.tags = tags;
    if (featuredImage !== undefined) updates.featuredImage = featuredImage;
    if (isFeatured !== undefined) updates.isFeatured = isFeatured;
    if (isBreaking !== undefined) updates.isBreaking = isBreaking;
    if (status) updates.status = status;
    if (seoTitle) updates.seoTitle = seoTitle;
    if (seoDescription) updates.seoDescription = seoDescription;
    if (metaKeywords) updates.metaKeywords = metaKeywords;

    // Apply updates to the article document
    Object.assign(article, updates);

    // Ensure slug is regenerated if title changed
    if (title && title !== article.title) {
      article.slug = await Article.generateUniqueSlug(title, article._id);
    }

    const updatedArticle = await article.save();
    await updatedArticle.populate('category', 'name color');

    // Submit for instant indexing if article status changed to published
    if (status === 'published' && article.status !== 'published') {
      await addArticleToIndexingQueue(updatedArticle);
    }
    await updatedArticle.populate('author', 'name');

    // Update category article counts if category changed
    if (oldCategoryId && newCategoryId && oldCategoryId.toString() !== newCategoryId) {
      const oldCategory = await Category.findById(oldCategoryId);
      const newCategory = await Category.findById(newCategoryId);
      
      if (oldCategory) await oldCategory.decrementArticleCount();
      if (newCategory) await newCategory.incrementArticleCount();
    }

    // Trigger sitemap update for updated article
    await sitemapService.triggerSitemapUpdate(updatedArticle, 'update');

    res.json({
      success: true,
      message: 'Article updated successfully',
      article: updatedArticle
    });

  } catch (error) {
    console.error('Update article error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Article with this title already exists'
      });
    }
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/articles/:id
// @desc    Delete article
// @access  Private (Admin only)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found'
      });
    }

    // Decrement category article count
    const category = await Category.findById(article.category);
    if (category) {
      await category.decrementArticleCount();
    }

    // Trigger sitemap update for deleted article
    await sitemapService.triggerSitemapUpdate(article, 'delete');

    await Article.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   PUT /api/articles/:id/publish
// @desc    Publish article
// @access  Private (Admin only)
router.put('/:id/publish', auth, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found'
      });
    }

    await article.publish();
    await article.populate('category', 'name color');
    await article.populate('author', 'name');

    // Submit for instant indexing immediately after publishing
    await addArticleToIndexingQueue(article);

    // Trigger sitemap update for published article
    await sitemapService.triggerSitemapUpdate(article, 'publish');

    res.json({
      success: true,
      message: 'Article published successfully',
      article
    });

  } catch (error) {
    console.error('Publish article error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   PUT /api/articles/:id/unpublish
// @desc    Unpublish article
// @access  Private (Admin only)
router.put('/:id/unpublish', auth, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found'
      });
    }

    await article.unpublish();
    await article.populate('category', 'name color');
    await article.populate('author', 'name');

    // Trigger sitemap update for unpublished article
    await sitemapService.triggerSitemapUpdate(article, 'unpublish');

    res.json({
      success: true,
      message: 'Article unpublished successfully',
      article
    });

  } catch (error) {
    console.error('Unpublish article error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});



// @route   GET /api/articles/indexing-queue/status
// @desc    Get indexing queue status
// @access  Private (Admin only)
router.get('/indexing-queue/status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const queueStatus = await queueService.getQueueStatus();
    const queueItems = await queueService.getQueueItems();
    
    res.json({
      success: true,
      queueStatus,
      queueItems
    });
  } catch (error) {
    console.error('Get indexing queue status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get indexing queue status'
    });
  }
});





// @route   POST /api/articles/indexing-queue/clear
// @desc    Clear indexing queue
// @access  Private (Admin only)
router.post('/indexing-queue/clear', auth, requireRole(['admin']), async (req, res) => {
  try {
    await queueService.clearQueue();
    
    res.json({
      success: true,
      message: 'Indexing queue cleared successfully'
    });
  } catch (error) {
    console.error('Clear indexing queue error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear indexing queue'
    });
  }
});

module.exports = router; 