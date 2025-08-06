const mongoose = require('mongoose');

const rssFeedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  feedUrl: {
    type: String,
    required: true,
    trim: true
  },
  defaultAuthor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  minContentLength: {
    type: Number,
    default: 100,
    min: 50
  },
  maxPostsPerDay: {
    type: Number,
    default: 5,
    min: 1,
    max: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastFetched: {
    type: Date,
    default: null
  },
  lastPublished: {
    type: Date,
    default: null
  },
  postsPublishedToday: {
    type: Number,
    default: 0
  },
  totalPostsPublished: {
    type: Number,
    default: 0
  },
  settings: {
    enableAiRewrite: {
      type: Boolean,
      default: true
    },
    aiRewriteStyle: {
      type: String,
      enum: ['professional', 'casual', 'formal', 'creative'],
      default: 'professional'
    },
    includeOriginalSource: {
      type: Boolean,
      default: true
    },
    autoPublish: {
      type: Boolean,
      default: true
    },
    publishDelay: {
      type: Number, // minutes
      default: 0
    },
    enableAutoCategory: {
      type: Boolean,
      default: true
    },
    requireImage: {
      type: Boolean,
      default: true
    }
  },
  errorLog: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['error', 'warning', 'info'],
      default: 'error'
    }
  }]
}, {
  timestamps: true
});

// Reset daily post count at midnight
rssFeedSchema.methods.resetDailyCount = function() {
  const now = new Date();
  const lastReset = this.lastPublished || new Date(0);
  
  // Check if it's a new day
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.postsPublishedToday = 0;
    return this.save();
  }
  return Promise.resolve(this);
};

// Check if can publish more posts today
rssFeedSchema.methods.canPublishToday = function() {
  return this.postsPublishedToday < this.maxPostsPerDay;
};

// Increment published count
rssFeedSchema.methods.incrementPublishedCount = function() {
  this.postsPublishedToday += 1;
  this.totalPostsPublished += 1;
  this.lastPublished = new Date();
  return this.save();
};

// Add error log entry
rssFeedSchema.methods.addErrorLog = function(message, type = 'error') {
  this.errorLog.push({ message, type });
  // Keep only last 50 error logs
  if (this.errorLog.length > 50) {
    this.errorLog = this.errorLog.slice(-50);
  }
  return this.save();
};

// Clear error logs
rssFeedSchema.methods.clearErrorLogs = function() {
  this.errorLog = [];
  return this.save();
};

// Index for better query performance
rssFeedSchema.index({ isActive: 1, lastFetched: 1 });
rssFeedSchema.index({ feedUrl: 1 });

module.exports = mongoose.model('RssFeed', rssFeedSchema); 