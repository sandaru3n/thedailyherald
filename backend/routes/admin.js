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

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin only)
router.get('/analytics', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Articles created in period
    const articlesCreated = await Article.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Articles published in period
    const articlesPublished = await Article.countDocuments({
      publishedAt: { $gte: startDate }
    });

    // Views in period
    const viewsInPeriod = await Article.aggregate([
      {
        $match: {
          publishedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    // Articles by category in period
    const articlesByCategory = await Article.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          categoryName: '$category.name',
          count: 1
        }
      }
    ]);

    // Daily article creation for chart
    const dailyArticles = await Article.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const analytics = {
      period: parseInt(period),
      articlesCreated,
      articlesPublished,
      totalViews: viewsInPeriod[0]?.totalViews || 0,
      articlesByCategory,
      dailyArticles
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Server error'
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