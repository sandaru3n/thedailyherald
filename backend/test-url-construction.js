const mongoose = require('mongoose');
const Settings = require('./models/Settings');
const databaseIndexingQueue = require('./services/databaseIndexingQueue');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testUrlConstruction() {
  try {
    console.log('🧪 Testing URL Construction for Automatic Indexing...\n');

    // Test 1: Check current settings
    console.log('1. Current Settings:');
    const settings = await Settings.getSettings();
    console.log('settings.siteUrl:', settings.siteUrl);
    console.log('settings.publisherUrl:', settings.publisherUrl);
    console.log('process.env.SITE_URL:', process.env.SITE_URL);
    console.log('process.env.NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);

    // Test 2: Test URL construction method
    console.log('\n2. Testing URL Construction Method:');
    const siteUrl = await databaseIndexingQueue.getCorrectSiteUrl();
    console.log('Constructed site URL:', siteUrl);

    // Test 3: Test with different scenarios
    console.log('\n3. Testing different URL scenarios:');

    // Scenario A: With settings.siteUrl (your actual domain)
    console.log('\nScenario A - Using settings.siteUrl with actual domain:');
    settings.siteUrl = 'https://yourdomain.com';
    await settings.save();
    const urlA = await databaseIndexingQueue.getCorrectSiteUrl();
    console.log('Result:', urlA);

    // Scenario B: With NEXT_PUBLIC_SITE_URL
    console.log('\nScenario B - Using NEXT_PUBLIC_SITE_URL:');
    settings.siteUrl = 'http://localhost:3000'; // Reset to localhost
    await settings.save();
    process.env.NEXT_PUBLIC_SITE_URL = 'https://yourdomain.com';
    const urlB = await databaseIndexingQueue.getCorrectSiteUrl();
    console.log('Result:', urlB);

    // Scenario C: With SITE_URL
    console.log('\nScenario C - Using SITE_URL:');
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.SITE_URL = 'https://yourdomain.com';
    const urlC = await databaseIndexingQueue.getCorrectSiteUrl();
    console.log('Result:', urlC);

    // Scenario D: With publisherUrl
    console.log('\nScenario D - Using publisherUrl:');
    delete process.env.SITE_URL;
    settings.publisherUrl = 'https://yourdomain.com';
    await settings.save();
    const urlD = await databaseIndexingQueue.getCorrectSiteUrl();
    console.log('Result:', urlD);

    // Test 4: Test article URL construction
    console.log('\n4. Testing Article URL Construction:');
    const testArticle = {
      _id: new mongoose.Types.ObjectId(),
      slug: 'test-article-slug',
      title: 'Test Article'
    };

    const articleUrl = `${siteUrl}/article/${testArticle.slug}`;
    console.log('Article URL:', articleUrl);

    // Test 5: Test queue addition with correct URL
    console.log('\n5. Testing Queue Addition:');
    console.log('Adding article to queue...');
    await databaseIndexingQueue.addToQueue(testArticle, 'URL_UPDATED');

    // Test 6: Check queue items
    console.log('\n6. Checking Queue Items:');
    const queueItems = await databaseIndexingQueue.getQueueItems();
    console.log('Queue items:', queueItems);

    console.log('\n✅ URL construction tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testUrlConstruction(); 