const mongoose = require('mongoose');
const RssFeed = require('../models/RssFeed');
require('dotenv').config({ path: './config.env' });

async function migrateRssFeeds() {
  try {
    console.log('Starting RSS feed migration: removing category field...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // First, let's see what feeds exist
    const allFeeds = await RssFeed.find({});
    console.log(`Found ${allFeeds.length} RSS feeds in database`);

    // Update each feed individually to ensure proper field removal
    for (const feed of allFeeds) {
      console.log(`Processing feed: ${feed.name}`);
      
      // Remove category field and update settings
      delete feed.category;
      if (!feed.settings) {
        feed.settings = {};
      }
      feed.settings.enableAutoCategory = true;
      
      await feed.save();
      console.log(`Updated feed: ${feed.name}`);
    }

    console.log('Migration completed successfully!');
    
    // Verify the migration
    const feedsWithCategory = await RssFeed.find({ category: { $exists: true } });
    if (feedsWithCategory.length === 0) {
      console.log('✅ All RSS feeds have been successfully migrated');
    } else {
      console.log(`⚠️  Warning: ${feedsWithCategory.length} feeds still have category field`);
      console.log('Feeds with category field:');
      feedsWithCategory.forEach(feed => {
        console.log(`- ${feed.name} (ID: ${feed._id})`);
      });
    }

    // Show final state of all feeds
    const finalFeeds = await RssFeed.find({});
    console.log('\nFinal feed states:');
    finalFeeds.forEach(feed => {
      console.log(`- ${feed.name}: Auto-category enabled: ${feed.settings?.enableAutoCategory || false}`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateRssFeeds();
}

module.exports = migrateRssFeeds;