const mongoose = require('mongoose');

const indexingQueueSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['URL_UPDATED', 'URL_DELETED'],
    default: 'URL_UPDATED'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  retries: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  error: {
    type: String
  },
  processedAt: {
    type: Date
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
indexingQueueSchema.index({ status: 1, addedAt: 1 });
indexingQueueSchema.index({ articleId: 1 });

module.exports = mongoose.model('IndexingQueue', indexingQueueSchema); 