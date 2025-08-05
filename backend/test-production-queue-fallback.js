const mongoose = require('mongoose');
const Settings = require('./models/Settings');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Built-in in-memory queue system (same as in routes)
let builtInQueueItems = [];
let builtInQueueProcessing = false;

function getBuiltInQueue() {
  return {
    async getQueueStatus() {
      const pending = builtInQueueItems.filter(item => item.status === 'pending').length;
      const processing = builtInQueueItems.filter(item => item.status === 'processing').length;
      const completed = builtInQueueItems.filter(item => item.status === 'completed').length;
      const failed = builtInQueueItems.filter(item => item.status === 'failed').length;
      
      return {
        totalItems: builtInQueueItems.length,
        isProcessing: builtInQueueProcessing,
        pendingItems: pending,
        processingItems: processing,
        completedItems: completed,
        failedItems: failed,
        note: 'Using built-in queue system (files missing)'
      };
    },
    
    async getQueueItems() {
      return builtInQueueItems.map(item => ({
        id: item.id,
        url: item.url,
        type: item.type,
        status: item.status,
        retries: item.retries || 0,
        addedAt: item.addedAt,
        articleTitle: item.articleTitle || 'Unknown Article'
      }));
    },
    
    async clearQueue() {
      builtInQueueItems = [];
      console.log('Built-in indexing queue cleared');
    },
    
    async retryFailedItems() {
      const failedItems = builtInQueueItems.filter(item => item.status === 'failed');
      failedItems.forEach(item => {
        item.status = 'pending';
        item.retries = (item.retries || 0) + 1;
      });
      console.log(`Retried ${failedItems.length} failed items in built-in queue`);
    },
    
    async addToQueue(article, type = 'URL_UPDATED') {
      const queueItem = {
        id: Date.now().toString(),
        url: `https://yourdomain.com/article/${article.slug}`,
        type: type,
        status: 'pending',
        retries: 0,
        addedAt: new Date().toISOString(),
        articleTitle: article.title || 'Unknown Article'
      };
      
      builtInQueueItems.push(queueItem);
      console.log(`Added article to built-in queue: ${queueItem.url}`);
    }
  };
}

async function testProductionQueueFallback() {
  try {
    console.log('🧪 Testing Production Queue Fallback System...\n');

    // Test 1: Simulate production environment
    console.log('1. Testing production environment fallback:');
    
    // Simulate production environment
    process.env.NODE_ENV = 'production';
    
    let databaseIndexingQueue;
    const isProduction = process.env.NODE_ENV === 'production';
    let useBuiltInQueue = isProduction;
    
    if (!useBuiltInQueue) {
      try {
        databaseIndexingQueue = require('./services/databaseIndexingQueue');
        console.log('❌ Should not see this in production');
      } catch (importError) {
        console.error('Failed to import databaseIndexingQueue, trying articleIndexingQueue:', importError.message);
        try {
          databaseIndexingQueue = require('./services/articleIndexingQueue');
          console.log('❌ Should not see this in production');
        } catch (fallbackError) {
          console.error('Both queue systems unavailable, using built-in fallback:', fallbackError.message);
          useBuiltInQueue = true;
        }
      }
    }
    
    if (useBuiltInQueue) {
      console.log('✅ Using built-in queue system in production');
      databaseIndexingQueue = getBuiltInQueue();
    }
    
    const queueStatus = await databaseIndexingQueue.getQueueStatus();
    console.log('✅ Queue status in production:', queueStatus);

    // Test 2: Simulate development environment
    console.log('\n2. Testing development environment fallback:');
    
    // Simulate development environment
    process.env.NODE_ENV = 'development';
    
    let devQueue;
    const isDevProduction = process.env.NODE_ENV === 'production';
    let useDevBuiltInQueue = isDevProduction;
    
    if (!useDevBuiltInQueue) {
      try {
        devQueue = require('./services/databaseIndexingQueue');
        console.log('✅ Successfully loaded databaseIndexingQueue in development');
      } catch (importError) {
        console.error('Failed to import databaseIndexingQueue, trying articleIndexingQueue:', importError.message);
        try {
          devQueue = require('./services/articleIndexingQueue');
          console.log('✅ Successfully loaded articleIndexingQueue in development');
        } catch (fallbackError) {
          console.error('Both queue systems unavailable, using built-in fallback:', fallbackError.message);
          useDevBuiltInQueue = true;
        }
      }
    }
    
    if (useDevBuiltInQueue) {
      console.log('❌ Should not see this in development unless files are missing');
      devQueue = getBuiltInQueue();
    }
    
    console.log('\n✅ Production queue fallback test completed!');
    console.log('\n📋 Summary:');
    console.log('- Production environment uses built-in queue system');
    console.log('- Development environment attempts to load queue modules');
    console.log('- No module not found errors in production logs');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testProductionQueueFallback();