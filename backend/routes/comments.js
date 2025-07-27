const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Article = require('../models/Article');
const { auth } = require('../middleware/auth');

// Comment settings storage (in production, this should be in a database)
let commentSettings = {
  autoApprove: false
};

// Get comment settings (admin only)
router.get('/admin/settings', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      settings: commentSettings
    });
  } catch (error) {
    console.error('Error fetching comment settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comment settings'
    });
  }
});

// Update comment settings (admin only)
router.patch('/admin/settings', auth, async (req, res) => {
  try {
    const { autoApprove } = req.body;
    
    if (typeof autoApprove !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'autoApprove must be a boolean value'
      });
    }

    commentSettings.autoApprove = autoApprove;

    res.json({
      success: true,
      message: 'Comment settings updated successfully',
      settings: commentSettings
    });
  } catch (error) {
    console.error('Error updating comment settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment settings'
    });
  }
});

// Get comments for an article (public)
router.get('/article/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Get approved comments only
    const comments = await Comment.find({
      article: articleId,
      status: 'approved',
      parentComment: null // Only top-level comments
    })
    .populate('replies', 'content authorName createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Comment.countDocuments({
      article: articleId,
      status: 'approved',
      parentComment: null
    });

    res.json({
      success: true,
      comments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + comments.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
});

// Create a new comment (public)
router.post('/', async (req, res) => {
  try {
    const { content, authorName, authorEmail, articleId, parentCommentId } = req.body;

    // Validate required fields
    if (!content || !authorName || !authorEmail || !articleId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Create comment
    const commentData = {
      content,
      authorName,
      authorEmail,
      article: articleId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    if (parentCommentId) {
      commentData.parentComment = parentCommentId;
    }

    // Check auto-approve setting
    if (commentSettings.autoApprove) {
      commentData.status = 'approved';
      commentData.approvedAt = new Date();
      commentData.approvedBy = null; // Auto-approved, no specific admin
    }

    const comment = new Comment(commentData);
    await comment.save();

    // If parent comment exists, add this as a reply
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id }
      });
    }

    const message = commentSettings.autoApprove 
      ? 'Comment submitted and published successfully!' 
      : 'Comment submitted successfully. It will be reviewed before publishing.';

    res.status(201).json({
      success: true,
      message,
      comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit comment'
    });
  }
});

// Get all comments (admin only)
router.get('/admin', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, articleId } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (articleId) filter.article = articleId;

    const comments = await Comment.find(filter)
      .populate('article', 'title slug')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments(filter);

    res.json({
      success: true,
      comments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + comments.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
});

// Approve/reject comment (admin only)
router.patch('/:commentId/status', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateData = {
      status,
      approvedBy: req.admin._id,
      approvedAt: new Date()
    };

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      updateData,
      { new: true }
    ).populate('article', 'title slug');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.json({
      success: true,
      message: `Comment ${status} successfully`,
      comment
    });
  } catch (error) {
    console.error('Error updating comment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment status'
    });
  }
});

// Delete comment (admin only)
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Remove from parent comment's replies if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId }
      });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
});

// Get comment statistics (admin only)
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const stats = await Comment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalComments = await Comment.countDocuments();
    const pendingComments = await Comment.countDocuments({ status: 'pending' });

    const statsObject = {
      total: totalComments,
      pending: pendingComments,
      approved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      statsObject[stat._id] = stat.count;
    });

    res.json({
      success: true,
      stats: statsObject
    });
  } catch (error) {
    console.error('Error fetching comment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comment statistics'
    });
  }
});

module.exports = router; 