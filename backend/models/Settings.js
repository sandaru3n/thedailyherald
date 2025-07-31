const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: 'The Daily Herald',
    trim: true,
    maxlength: 100
  },
  siteDescription: {
    type: String,
    trim: true,
    maxlength: 500,
    default: 'Your trusted source for the latest news and updates'
  },
  siteLogo: {
    type: String,
    trim: true
  },
  siteFavicon: {
    type: String,
    trim: true,
    default: process.env.DEFAULT_FAVICON_URL || '/uploads/favicon.ico'
  },
  siteUrl: {
    type: String,
    required: true,
    trim: true
  },
  publisherName: {
    type: String,
    required: true,
    default: 'The Daily Herald',
    trim: true
  },
  publisherUrl: {
    type: String,
    required: true,
    trim: true
  },
  publisherLogo: {
    type: String,
    trim: true
  },
  socialMedia: {
    facebook: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    }
  },
  contactInfo: {
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  seoSettings: {
    defaultTitle: {
      type: String,
      trim: true,
      default: 'The Daily Herald - Latest News'
    },
    defaultDescription: {
      type: String,
      trim: true,
      default: 'Stay informed with the latest news, breaking stories, and in-depth coverage from The Daily Herald.'
    },
    googleAnalyticsId: {
      type: String,
      trim: true
    },
    googleSearchConsole: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ isActive: true });
  
  if (!settings) {
    // Create default settings if none exist
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    const defaultFavicon = process.env.DEFAULT_FAVICON_URL || `${baseUrl}/uploads/favicon.ico`;
    
    settings = await this.create({
      siteName: 'The Daily Herald',
      siteDescription: 'Your trusted source for the latest news and updates',
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      publisherName: 'The Daily Herald',
      publisherUrl: process.env.SITE_URL || 'http://localhost:3000',
      siteFavicon: defaultFavicon
    });
  }
  
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema); 