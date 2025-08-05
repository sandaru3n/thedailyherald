const mongoose = require('mongoose');
const Settings = require('./models/Settings');
const databaseIndexingQueue = require('./services/databaseIndexingQueue');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testQueueMonitor() {
  try {
    console.log('🧪 Testing Queue Monitor API Endpoints...\n');

    // Test 1: Add some test articles to queue
    console.log('1. Adding test articles to queue...');
    const testArticles = [
      {
        _id: new mongoose.Types.ObjectId(),
        slug: 'monitor-test-1',
        title: 'Monitor Test Article 1'
      },
      {
        _id: new mongoose.Types.ObjectId(),
        slug: 'monitor-test-2',
        title: 'Monitor Test Article 2'
      }
    ];

    for (const article of testArticles) {
      await databaseIndexingQueue.addToQueue(article, 'URL_UPDATED');
      console.log(`Added to queue: ${article.title}`);
    }

    // Test 2: Check queue status
    console.log('\n2. Checking queue status...');
    const queueStatus = await databaseIndexingQueue.getQueueStatus();
    console.log('Queue Status:', queueStatus);

    // Test 3: Get queue items
    console.log('\n3. Getting queue items...');
    const queueItems = await databaseIndexingQueue.getQueueItems();
    console.log('Queue Items:', queueItems);

    // Test 4: Simulate API response format
    console.log('\n4. Simulating API response format...');
    const apiResponse = {
      success: true,
      queueStatus,
      queueItems
    };
    console.log('API Response:', JSON.stringify(apiResponse, null, 2));

    console.log('\n✅ Queue monitor tests completed!');
    console.log('\n📋 Summary:');
    console.log(`- Total items: ${queueStatus.totalItems}`);
    console.log(`- Pending: ${queueStatus.pendingItems}`);
    console.log(`- Processing: ${queueStatus.processingItems}`);
    console.log(`- Completed: ${queueStatus.completedItems}`);
    console.log(`- Failed: ${queueStatus.failedItems}`);
    console.log(`- Is processing: ${queueStatus.isProcessing}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testQueueMonitor(); 