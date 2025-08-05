const mongoose = require('mongoose');
const Settings = require('./models/Settings');
const databaseIndexingQueue = require('./services/databaseIndexingQueue');
const IndexingQueue = require('./models/IndexingQueue');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testDatabaseQueue() {
  try {
    console.log('🧪 Testing Database-Based Indexing Queue System...\n');

    // Test 1: Check initial queue status
    console.log('1. Initial Queue Status:');
    const initialStatus = await databaseIndexingQueue.getQueueStatus();
    console.log(initialStatus);

    // Test 2: Configure settings for testing
    console.log('\n2. Configuring settings for testing...');
    const settings = await Settings.getSettings();
    settings.googleInstantIndexing = {
      enabled: true,
      serviceAccountJson: JSON.stringify({
        project_id: 'test-project',
        private_key: '-----BEGIN PRIVATE KEY-----\nMOCK_KEY\n-----END PRIVATE KEY-----',
        client_email: 'test@test-project.iam.gserviceaccount.com'
      }),
      projectId: 'test-project',
      totalIndexed: 0
    };
    await settings.save();

    // Test 3: Add test articles to queue
    console.log('\n3. Adding test articles to queue...');
    const testArticles = [
      {
        _id: new mongoose.Types.ObjectId(),
        slug: 'test-article-1',
        title: 'Test Article 1'
      },
      {
        _id: new mongoose.Types.ObjectId(),
        slug: 'test-article-2',
        title: 'Test Article 2'
      },
      {
        _id: new mongoose.Types.ObjectId(),
        slug: 'test-article-3',
        title: 'Test Article 3'
      }
    ];

    for (const article of testArticles) {
      await databaseIndexingQueue.addToQueue(article, 'URL_UPDATED');
      console.log(`Added to queue: ${article.title}`);
    }

    // Test 4: Check queue status after adding items
    console.log('\n4. Queue Status After Adding Items:');
    const statusAfterAdd = await databaseIndexingQueue.getQueueStatus();
    console.log(statusAfterAdd);

    // Test 5: Get queue items
    console.log('\n5. Queue Items:');
    const queueItems = await databaseIndexingQueue.getQueueItems();
    console.log(queueItems);

    // Test 6: Check database directly
    console.log('\n6. Database Queue Items:');
    const dbItems = await IndexingQueue.find().populate('articleId', 'title slug');
    console.log(dbItems.map(item => ({
      id: item._id,
      url: item.url,
      status: item.status,
      articleTitle: item.articleId?.title,
      addedAt: item.addedAt
    })));

    // Test 7: Wait for processing (simulate)
    console.log('\n7. Simulating queue processing...');
    console.log('Queue will process automatically in background...');
    
    // Wait a bit to see processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const statusAfterProcessing = await databaseIndexingQueue.getQueueStatus();
    console.log('Status after processing:', statusAfterProcessing);

    // Test 8: Test queue clearing
    console.log('\n8. Testing queue clearing...');
    await databaseIndexingQueue.clearQueue();
    const statusAfterClear = await databaseIndexingQueue.getQueueStatus();
    console.log('Status after clearing:', statusAfterClear);

    console.log('\n✅ Database queue system tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testDatabaseQueue(); 