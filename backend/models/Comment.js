const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  authorName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  authorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isSpam: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, {
  timestamps: true
});

// Index for better query performance
commentSchema.index({ article: 1, status: 1, createdAt: -1 });
commentSchema.index({ status: 1, createdAt: -1 });
commentSchema.index({ authorEmail: 1 });

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Ensure virtuals are serialized
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', commentSchema); 