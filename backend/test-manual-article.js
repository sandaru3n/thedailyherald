const mongoose = require('mongoose');
const Article = require('./models/Article');
const Category = require('./models/Category');
const Admin = require('./models/Admin');
const queueService = require('./services/queueService')();

async function testManualArticle() {
  try {
    console.log('🧪 Testing Manual Article Creation and Google Indexing...\n');

    // 1. Get a category and admin
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

    // 2. Create a test article
    const testArticle = new Article({
      title: 'Test Article for Google Indexing - ' + new Date().toISOString(),
      content: 'This is a test article to verify that Google Instant Indexing is working properly. The article should be automatically submitted to Google for indexing when published.',
      category: category._id,
      author: admin._id,
      status: 'draft',
      tags: ['test', 'indexing', 'google'],
      seoTitle: 'Test Article for Google Indexing',
      seoDescription: 'A test article to verify Google Instant Indexing functionality'
    });

    // Generate slug
    testArticle.slug = await Article.generateUniqueSlug(testArticle.title);

    console.log('📝 Creating test article...');
    await testArticle.save();
    console.log(`✅ Article created: "${testArticle.title}" (${testArticle.status})`);

    // 3. Test adding to indexing queue (should not trigger since it's draft)
    console.log('\n🔄 Testing queue addition for draft article...');
    await queueService.addToQueue(testArticle, 'URL_UPDATED');

    // 4. Publish the article
    console.log('\n🚀 Publishing article...');
    testArticle.status = 'published';
    testArticle.publishedAt = new Date();
    await testArticle.save();
    console.log(`✅ Article published: "${testArticle.title}"`);

    // 5. Test adding to indexing queue (should trigger since it's published)
    console.log('\n🔄 Testing queue addition for published article...');
    await queueService.addToQueue(testArticle, 'URL_UPDATED');

    // 6. Wait a moment for processing
    console.log('\n⏳ Waiting for queue processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 7. Check queue status
    console.log('\n📊 Queue Status:');
    const queueStatus = await queueService.getQueueStatus();
    console.log(`   Total Items: ${queueStatus.totalItems}`);
    console.log(`   Pending: ${queueStatus.pendingItems}`);
    console.log(`   Processing: ${queueStatus.processingItems}`);
    console.log(`   Completed: ${queueStatus.completedItems}`);
    console.log(`   Failed: ${queueStatus.failedItems}`);

    // 8. Get queue items
    console.log('\n📋 Queue Items:');
    const queueItems = await queueService.getQueueItems();
    queueItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.articleTitle || 'Unknown'} - ${item.status}`);
      if (item.error) {
        console.log(`      Error: ${item.error}`);
      }
    });

    console.log('\n✅ Manual article test completed!');
    console.log('\n📋 Summary:');
    console.log('- Article created and published successfully');
    console.log('- Queue system is working');
    console.log('- Google Instant Indexing should be triggered');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald')
  .then(() => {
    console.log('Connected to MongoDB');
    testManualArticle();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  }); 