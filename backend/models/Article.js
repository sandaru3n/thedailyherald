const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
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
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: 300
  },
  featuredImage: {
    type: String,
    default: null
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBreaking: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  seoTitle: {
    type: String,
    trim: true,
    maxlength: 60
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: 160
  },
  metaKeywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Generate slug from title before saving
articleSchema.pre('save', async function(next) {
  // Generate slug if it doesn't exist or if title is modified
  if (!this.slug || this.isModified('title')) {
    this.slug = await this.constructor.generateUniqueSlug(this.title, this._id);
  }
  
  // Generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .substring(0, 300)
      .trim();
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Calculate read time based on content length
  if (this.isModified('content') && this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  next();
});

// Static method to generate unique slug
articleSchema.statics.generateUniqueSlug = async function(title, excludeId = null) {
  let baseSlug = title
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
articleSchema.virtual('url').get(function() {
  return `/article/${this.slug}`;
});

// Method to increment views
articleSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to publish article
articleSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

// Method to unpublish article
articleSchema.methods.unpublish = function() {
  this.status = 'draft';
  this.publishedAt = null;
  return this.save();
};

// Index for better query performance
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ slug: 1 });
articleSchema.index({ title: 'text', content: 'text' });

// Add paginate method to schema
articleSchema.statics.paginate = function(query, options) {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    populate = [],
    select = null
  } = options;

  const skip = (page - 1) * limit;
  
  return new Promise(async (resolve, reject) => {
    try {
      // Get total count
      const total = await this.countDocuments(query);
      
      // Get paginated results
      let results = this.find(query).skip(skip).limit(limit).sort(sort);
      
      // Apply population
      if (populate && populate.length > 0) {
        populate.forEach(pop => {
          results = results.populate(pop);
        });
      }
      
      // Apply field selection
      if (select) {
        results = results.select(select);
      }
      
      const docs = await results.exec();
      
      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      resolve({
        docs,
        totalDocs: total,
        limit,
        page,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
        pagingCounter: skip + 1
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = mongoose.model('Article', articleSchema); 