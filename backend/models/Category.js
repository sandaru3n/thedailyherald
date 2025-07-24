const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  icon: {
    type: String,
    default: 'newspaper'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  articleCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug from name before saving
categorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Virtual for URL
categorySchema.virtual('url').get(function() {
  return `/category/${this.slug}`;
});

// Method to increment article count
categorySchema.methods.incrementArticleCount = function() {
  this.articleCount += 1;
  return this.save();
};

// Method to decrement article count
categorySchema.methods.decrementArticleCount = function() {
  if (this.articleCount > 0) {
    this.articleCount -= 1;
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Category', categorySchema); 