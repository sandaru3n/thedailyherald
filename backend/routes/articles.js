const express = require('express');
const Article = require('../models/Article');
const Category = require('../models/Category');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

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

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'category', select: 'name color' },
        { path: 'author', select: 'name' }
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

// @route   GET /api/articles/:id
// @desc    Get single article by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('category', 'name color')
      .populate('author', 'name');

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
      .populate('category', 'name color')
      .populate('author', 'name');

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
    await updatedArticle.populate('author', 'name');

    // Update category article counts if category changed
    if (oldCategoryId && newCategoryId && oldCategoryId.toString() !== newCategoryId) {
      const oldCategory = await Category.findById(oldCategoryId);
      const newCategory = await Category.findById(newCategoryId);
      
      if (oldCategory) await oldCategory.decrementArticleCount();
      if (newCategory) await newCategory.incrementArticleCount();
    }

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

// @route   GET /api/articles/sitemap
// @desc    Get articles for sitemap (optimized for speed)
// @access  Public
router.get('/sitemap', async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;

    const query = { status: 'published' };
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-publishedAt',
      // Only select fields needed for sitemap
      select: 'slug publishedAt updatedAt'
    };

    const articles = await Article.paginate(query, options);

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

module.exports = router; 