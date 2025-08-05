const mongoose = require('mongoose');
const Settings = require('./models/Settings');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testQueueMonitorFix() {
  try {
    console.log('🧪 Testing Queue Monitor Fix...\n');

    // Test 1: Test module import with fallback
    console.log('1. Testing module import with fallback:');
    
    let databaseIndexingQueue;
    try {
      databaseIndexingQueue = require('./services/databaseIndexingQueue');
      console.log('✅ Successfully imported databaseIndexingQueue');
    } catch (importError) {
      console.log('❌ Failed to import databaseIndexingQueue, trying fallback...');
      try {
        databaseIndexingQueue = require('./services/articleIndexingQueue');
        console.log('✅ Successfully imported articleIndexingQueue as fallback');
      } catch (fallbackError) {
        console.error('❌ Both imports failed:', fallbackError.message);
        return;
      }
    }

    // Test 2: Test queue status method
    console.log('\n2. Testing queue status method:');
    try {
      const queueStatus = await databaseIndexingQueue.getQueueStatus();
      console.log('✅ Queue status method works:', queueStatus);
    } catch (error) {
      console.error('❌ Queue status method failed:', error.message);
    }

    // Test 3: Test queue items method
    console.log('\n3. Testing queue items method:');
    try {
      const queueItems = await databaseIndexingQueue.getQueueItems();
      console.log('✅ Queue items method works:', queueItems.length, 'items');
    } catch (error) {
      console.error('❌ Queue items method failed:', error.message);
    }

    // Test 4: Test clear queue method
    console.log('\n4. Testing clear queue method:');
    try {
      await databaseIndexingQueue.clearQueue();
      console.log('✅ Clear queue method works');
    } catch (error) {
      console.error('❌ Clear queue method failed:', error.message);
    }

    // Test 5: Test retry method (if available)
    console.log('\n5. Testing retry method:');
    if (typeof databaseIndexingQueue.retryFailedItems === 'function') {
      try {
        await databaseIndexingQueue.retryFailedItems();
        console.log('✅ Retry failed items method works');
      } catch (error) {
        console.error('❌ Retry failed items method failed:', error.message);
      }
    } else {
      console.log('ℹ️ Retry failed items method not available (expected for fallback)');
    }

    console.log('\n✅ Queue monitor fix test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testQueueMonitorFix(); 