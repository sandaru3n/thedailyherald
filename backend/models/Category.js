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
categorySchema.pre('save', async function(next) {
  // Generate slug if it doesn't exist or if name is modified
  if (!this.slug || this.isModified('name')) {
    this.slug = await this.constructor.generateUniqueSlug(this.name, this._id);
  }
  
  next();
});

// Static method to generate unique slug
categorySchema.statics.generateUniqueSlug = async function(name, excludeId = null) {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug exists
  const query = { slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  while (await this.findOne(query)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

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