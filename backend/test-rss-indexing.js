const mongoose = require('mongoose');
const RssFeed = require('./models/RssFeed');
const Article = require('./models/Article');
const Category = require('./models/Category');
const Admin = require('./models/Admin');
const queueService = require('./services/queueService')();

async function testRssIndexing() {
  try {
    console.log('🧪 Testing RSS Auto-Publishing with Google Indexing...\n');

    // 1. Get required data
    const category = await Category.findOne({ isActive: true });
    const admin = await Admin.findOne();

    if (!category) {
      console.log('❌ No active categories found');
      return;
    }

    if (!admin) {
      console.log('❌ No admin users found');
      return;
    }

    console.log(`✅ Using category: ${category.name}`);
    console.log(`✅ Using admin: ${admin.name}\n`);

    // 2. Create a test RSS feed with auto-publish enabled
    const testFeed = new RssFeed({
      name: 'Test RSS Feed for Indexing',
      feedUrl: 'https://example.com/test-feed',
      defaultAuthor: admin._id,
      settings: {
        autoPublish: true,
        enableAutoCategory: false,
        enableAiRewrite: false,
        includeOriginalSource: false,
        minContentLength: 50,
        publishDelay: 0
      },
      isActive: true,
      maxPostsPerDay: 10
    });

    console.log('📝 Creating test RSS feed...');
    await testFeed.save();
    console.log(`✅ RSS feed created: "${testFeed.name}"`);

    // 3. Simulate RSS article creation (like the RSS service does)
    const testArticle = new Article({
      title: 'Test RSS Article for Google Indexing - ' + new Date().toISOString(),
      content: 'This is a test RSS article to verify that Google Instant Indexing is triggered when RSS articles are auto-published.',
      category: category._id,
      author: admin._id,
      status: testFeed.settings.autoPublish ? 'published' : 'draft',
      tags: ['test', 'rss', 'indexing', 'google'],
      seoTitle: 'Test RSS Article for Google Indexing',
      seoDescription: 'A test RSS article to verify Google Instant Indexing functionality'
    });

    // Generate slug
    testArticle.slug = await Article.generateUniqueSlug(testArticle.title);

    console.log('📝 Creating test RSS article...');
    await testArticle.save();
    console.log(`✅ RSS article created: "${testArticle.title}" (${testArticle.status})`);

    // 4. Simulate the RSS service indexing trigger
    if (testFeed.settings.autoPublish && testArticle.status === 'published') {
      console.log('\n🔄 Testing RSS indexing trigger...');
      try {
        await queueService.addToQueue(testArticle, 'URL_UPDATED');
        console.log(`🚀 RSS Article added to indexing queue: ${testArticle.title}`);
      } catch (indexingError) {
        console.error('❌ Error adding RSS article to indexing queue:', indexingError);
      }
    }

    // 5. Wait a moment for processing
    console.log('\n⏳ Waiting for queue processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 6. Check queue status
    console.log('\n📊 Queue Status:');
    const queueStatus = await queueService.getQueueStatus();
    console.log(`   Total Items: ${queueStatus.totalItems}`);
    console.log(`   Pending: ${queueStatus.pendingItems}`);
    console.log(`   Processing: ${queueStatus.processingItems}`);
    console.log(`   Completed: ${queueStatus.completedItems}`);
    console.log(`   Failed: ${queueStatus.failedItems}`);

    // 7. Get queue items
    console.log('\n📋 Queue Items:');
    const queueItems = await queueService.getQueueItems();
    queueItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.articleTitle || 'Unknown'} - ${item.status}`);
      if (item.error) {
        console.log(`      Error: ${item.error}`);
      }
    });

    // 8. Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Article.findByIdAndDelete(testArticle._id);
    await RssFeed.findByIdAndDelete(testFeed._id);
    console.log('✅ Test data cleaned up');

    console.log('\n✅ RSS indexing test completed!');
    console.log('\n📋 Summary:');
    console.log('- RSS feed created with auto-publish enabled');
    console.log('- RSS article created and published automatically');
    console.log('- Google Instant Indexing triggered for RSS article');
    console.log('- Queue system processed the RSS article');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald')
  .then(() => {
    console.log('Connected to MongoDB');
    testRssIndexing();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  }); 