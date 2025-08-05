const mongoose = require('mongoose');
const Settings = require('./models/Settings');
const articleIndexingQueue = require('./services/articleIndexingQueue');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testQueueSystem() {
  try {
    console.log('🧪 Testing Article Indexing Queue System...\n');

    // Test 1: Check queue status
    console.log('1. Initial Queue Status:');
    const initialStatus = articleIndexingQueue.getQueueStatus();
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
        _id: 'test-article-1',
        slug: 'test-article-1',
        title: 'Test Article 1'
      },
      {
        _id: 'test-article-2',
        slug: 'test-article-2',
        title: 'Test Article 2'
      },
      {
        _id: 'test-article-3',
        slug: 'test-article-3',
        title: 'Test Article 3'
      }
    ];

    for (const article of testArticles) {
      await articleIndexingQueue.addToQueue(article, 'URL_UPDATED');
      console.log(`Added to queue: ${article.title}`);
    }

    // Test 4: Check queue status after adding items
    console.log('\n4. Queue Status After Adding Items:');
    const statusAfterAdd = articleIndexingQueue.getQueueStatus();
    console.log(statusAfterAdd);

    // Test 5: Get queue items
    console.log('\n5. Queue Items:');
    const queueItems = articleIndexingQueue.getQueueItems();
    console.log(queueItems);

    // Test 6: Wait for processing (simulate)
    console.log('\n6. Simulating queue processing...');
    console.log('Queue will process automatically in background...');
    
    // Wait a bit to see processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const statusAfterProcessing = articleIndexingQueue.getQueueStatus();
    console.log('Status after processing:', statusAfterProcessing);

    // Test 7: Test queue clearing
    console.log('\n7. Testing queue clearing...');
    articleIndexingQueue.clearQueue();
    const statusAfterClear = articleIndexingQueue.getQueueStatus();
    console.log('Status after clearing:', statusAfterClear);

    console.log('\n✅ Queue system tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testQueueSystem(); 