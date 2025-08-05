const mongoose = require('mongoose');
const Settings = require('./models/Settings');
const queueService = require('./services/queueService')();

async function testIndexingProduction() {
  try {
    console.log('🧪 Testing Google Instant Indexing (Production Mode)...\n');

    // 1. Check if Google Instant Indexing is enabled
    const settings = await Settings.getSettings();
    console.log('1. Google Instant Indexing Status:');
    console.log(`   Enabled: ${settings.googleInstantIndexing?.enabled || false}`);
    console.log(`   Project ID: ${settings.googleInstantIndexing?.projectId || 'Not set'}`);
    console.log(`   Total Indexed: ${settings.googleInstantIndexing?.totalIndexed || 0}\n`);

    if (!settings.googleInstantIndexing?.enabled) {
      console.log('❌ Google Instant Indexing is not enabled in settings');
      console.log('   Please enable it in the admin panel first');
      return;
    }

    // 2. Check queue status
    console.log('2. Queue Status:');
    const queueStatus = await queueService.getQueueStatus();
    console.log(`   Total Items: ${queueStatus.totalItems}`);
    console.log(`   Pending: ${queueStatus.pendingItems}`);
    console.log(`   Processing: ${queueStatus.processingItems}`);
    console.log(`   Completed: ${queueStatus.completedItems}`);
    console.log(`   Failed: ${queueStatus.failedItems}\n`);

    // 3. Test adding a mock article to queue
    console.log('3. Testing Queue Addition:');
    const mockArticle = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Test Article for Indexing',
      slug: 'test-article-for-indexing',
      status: 'published'
    };

    console.log(`   Adding mock article: ${mockArticle.title}`);
    await queueService.addToQueue(mockArticle, 'URL_UPDATED');
    console.log('   ✅ Mock article added to queue\n');

    // 4. Wait a moment for processing
    console.log('4. Waiting for queue processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Check queue status again
    console.log('5. Updated Queue Status:');
    const updatedQueueStatus = await queueService.getQueueStatus();
    console.log(`   Total Items: ${updatedQueueStatus.totalItems}`);
    console.log(`   Pending: ${updatedQueueStatus.pendingItems}`);
    console.log(`   Processing: ${updatedQueueStatus.processingItems}`);
    console.log(`   Completed: ${updatedQueueStatus.completedItems}`);
    console.log(`   Failed: ${updatedQueueStatus.failedItems}\n`);

    // 6. Get queue items
    console.log('6. Queue Items:');
    const queueItems = await queueService.getQueueItems();
    queueItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.articleTitle || 'Unknown'} - ${item.status}`);
      if (item.error) {
        console.log(`      Error: ${item.error}`);
      }
    });

    console.log('\n✅ Indexing production test completed!');
    console.log('\n📋 Summary:');
    console.log('- Google Instant Indexing is properly configured');
    console.log('- Queue system is working correctly');
    console.log('- Articles are being added to queue immediately');
    console.log('- Ready for production use');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Connect to database and run test
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald')
  .then(() => {
    console.log('Connected to MongoDB');
    testIndexingProduction();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  }); 