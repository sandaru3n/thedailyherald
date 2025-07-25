const express = require('express');
const Article = require('../models/Article');
const Category = require('../models/Category');
const Admin = require('../models/Admin');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get basic dashboard statistics
// @access  Private (Admin only)
router.get('/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Get total counts
    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({ status: 'published' });
    const draftArticles = await Article.countDocuments({ status: 'draft' });
    const totalCategories = await Category.countDocuments();
    const totalUsers = await Admin.countDocuments();

    // Get total views
    const totalViews = await Article.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    const stats = {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalCategories,
      totalUsers,
      totalViews: totalViews[0]?.totalViews || 0
    };

    res.json({
      success: true,
      ...stats
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Get total counts
    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({ status: 'published' });
    const draftArticles = await Article.countDocuments({ status: 'draft' });
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });
    const totalAdmins = await Admin.countDocuments();

    // Get recent articles
    const recentArticles = await Article.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('category', 'name')
      .populate('author', 'name')
      .select('title status createdAt category author');

    // Get top categories by article count
    const topCategories = await Category.find()
      .sort({ articleCount: -1 })
      .limit(5)
      .select('name articleCount color');

    // Get articles by status for chart
    const articlesByStatus = await Article.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get articles by month for chart
    const articlesByMonth = await Article.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get total views
    const totalViews = await Article.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    // Get most viewed articles
    const mostViewedArticles = await Article.find()
      .sort({ views: -1 })
      .limit(5)
      .populate('category', 'name')
      .select('title views category');

    const dashboardData = {
      statistics: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalCategories,
        activeCategories,
        totalAdmins,
        totalViews: totalViews[0]?.totalViews || 0
      },
      recentArticles,
      topCategories,
      articlesByStatus,
      articlesByMonth,
      mostViewedArticles
    };

    res.json({
      success: true,
      dashboard: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   GET /api/admin/admins
// @desc    Get all admins
// @access  Private (Admin only)
router.get('/admins', auth, requireRole(['admin']), async (req, res) => {
  try {
    const admins = await Admin.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      admins
    });

  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   POST /api/admin/admins
// @desc    Create new admin
// @access  Private (Admin only)
router.post('/admins', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, role = 'editor' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({
        error: 'Admin with this email already exists'
      });
    }

    const admin = new Admin({
      name,
      email: email.toLowerCase(),
      password,
      role
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: admin.toPublicJSON()
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   PUT /api/admin/admins/:id
// @desc    Update admin
// @access  Private (Admin only)
router.put('/admins/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.admin._id.toString() && isActive === false) {
      return res.status(400).json({
        error: 'Cannot deactivate your own account'
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Admin updated successfully',
      admin: updatedAdmin
    });

  } catch (error) {
    console.error('Update admin error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Email already exists'
      });
    }
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/admins/:id
// @desc    Delete admin
// @access  Private (Admin only)
router.delete('/admins/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({
        error: 'Cannot delete your own account'
      });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found'
      });
    }

    await Admin.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all admin users
// @access  Private (Admin only)
router.get('/users', auth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await Admin.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   POST /api/admin/users
// @desc    Create new admin user
// @access  Private (Admin only)
router.post('/users', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, role = 'editor', isActive = true } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await Admin.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    const user = new Admin({
      name,
      email: email.toLowerCase(),
      password,
      role,
      isActive
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update admin user
// @access  Private (Admin only)
router.put('/users/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, role, isActive } = req.body;

    const user = await Admin.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.admin._id.toString() && isActive === false) {
      return res.status(400).json({
        error: 'Cannot deactivate your own account'
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (password) updates.password = password;
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedUser = await Admin.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Email already exists'
      });
    }
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete admin user
// @access  Private (Admin only)
router.delete('/users/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({
        error: 'Cannot delete your own account'
      });
    }

    const user = await Admin.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    await Admin.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get comprehensive analytics data
// @access  Private (Admin only)
router.get('/analytics', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Get basic counts
    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({ status: 'published' });
    const draftArticles = await Article.countDocuments({ status: 'draft' });
    const totalUsers = await Admin.countDocuments();
    const totalCategories = await Category.countDocuments({ isActive: true });

    // Get total views
    const totalViewsResult = await Article.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;

    // Get recent views (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentViewsResult = await Article.aggregate([
      { $match: { updatedAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, recentViews: { $sum: '$views' } } }
    ]);
    const recentViews = recentViewsResult.length > 0 ? recentViewsResult[0].recentViews : 0;

    // Get monthly views (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyViewsResult = await Article.aggregate([
      { $match: { updatedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, monthlyViews: { $sum: '$views' } } }
    ]);
    const monthlyViews = monthlyViewsResult.length > 0 ? monthlyViewsResult[0].monthlyViews : 0;

    // Get top articles by views
    const topArticles = await Article.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title views slug')
      .populate('category', 'name color');

    // Get views by category
    const viewsByCategory = await Article.aggregate([
      { $match: { status: 'published' } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
      { $unwind: '$categoryInfo' },
      { $group: { 
        _id: '$categoryInfo._id', 
        category: { $first: '$categoryInfo.name' },
        color: { $first: '$categoryInfo.color' },
        views: { $sum: '$views' }
      }},
      { $sort: { views: -1 } },
      { $limit: 6 }
    ]);

    // Get system information
    const systemInfo = {
      uptime: `${Math.floor(process.uptime() / 86400)} days, ${Math.floor((process.uptime() % 86400) / 3600)} hours`,
      memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      database: 'MongoDB',
      version: '1.0.0'
    };

    // Calculate average views per article
    const avgViewsPerArticle = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;

    res.json({
      success: true,
      analytics: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalViews,
        totalUsers,
        totalCategories,
        recentViews,
        monthlyViews,
        avgViewsPerArticle,
        topArticles: topArticles.map(article => ({
          _id: article._id,
          title: article.title,
          views: article.views || 0,
          slug: article.slug,
          category: article.category?.name || 'Uncategorized'
        })),
        viewsByCategory: viewsByCategory.map(cat => ({
          category: cat.category,
          views: cat.views,
          color: cat.color || '#3B82F6'
        })),
        systemInfo
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    });
  }
});

// @route   GET /api/admin/system
// @desc    Get system information
// @access  Private (Admin only)
router.get('/system', auth, requireRole(['admin']), async (req, res) => {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      system: systemInfo
    });

  } catch (error) {
    console.error('System info error:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
});

module.exports = router; 