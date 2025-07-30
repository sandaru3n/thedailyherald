const mongoose = require('mongoose');

const navigationItemSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    default: 'home'
  },
  type: {
    type: String,
    enum: ['link', 'category'],
    default: 'link'
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isExternal: {
    type: Boolean,
    default: false
  },
  target: {
    type: String,
    enum: ['_self', '_blank'],
    default: '_self'
  }
}, {
  timestamps: true
});

const navigationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    default: 'main'
  },
  items: [navigationItemSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure order is unique within navigation
navigationSchema.index({ 'items.order': 1 });

module.exports = mongoose.model('Navigation', navigationSchema); 