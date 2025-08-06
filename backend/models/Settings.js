const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  siteDescription: {
    type: String,
    trim: true,
    maxlength: 500
  },
  siteLogo: {
    type: String,
    trim: true
  },
  siteFavicon: {
    type: String,
    trim: true
  },
  siteUrl: {
    type: String,
    required: true,
    trim: true
  },
  publisherName: {
    type: String,
    required: true,
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
      trim: true
    },
    defaultDescription: {
      type: String,
      trim: true
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
  googleInstantIndexing: {
    enabled: {
      type: Boolean,
      default: false
    },
    serviceAccountJson: {
      type: String,
      trim: true
    },
    projectId: {
      type: String,
      trim: true
    },
    lastIndexedAt: {
      type: Date
    },
    totalIndexed: {
      type: Number,
      default: 0
    }
  },
  textReplacements: {
    enabled: {
      type: Boolean,
      default: false
    },
    rules: [{
      find: {
        type: String,
        required: true,
        trim: true
      },
      replace: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }]
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
    // Create empty settings if none exist - no default values
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    
    settings = await this.create({
      siteName: '',
      siteDescription: '',
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      publisherName: '',
      publisherUrl: process.env.SITE_URL || 'http://localhost:3000'
    });
  }
  
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema); 