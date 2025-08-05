const mongoose = require('mongoose');
const Settings = require('./models/Settings');
const googleInstantIndexingService = require('./services/googleInstantIndexingService');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testUrlSubmission() {
  try {
    console.log('Testing URL Submission for Google Instant Indexing...\n');

    // Test 1: Invalid URL
    console.log('1. Testing with invalid URL...');
    const result1 = await googleInstantIndexingService.submitUrl('invalid-url', 'URL_UPDATED');
    console.log('Result with invalid URL:', result1);

    // Test 2: Valid URL but service not configured
    console.log('\n2. Testing with valid URL but service not configured...');
    const result2 = await googleInstantIndexingService.submitUrl('https://example.com/test', 'URL_UPDATED');
    console.log('Result with valid URL but no config:', result2);

    // Test 3: Configure service with mock credentials
    console.log('\n3. Configuring service with mock credentials...');
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

    // Test 4: Valid URL with configured service
    console.log('\n4. Testing with valid URL and configured service...');
    const result4 = await googleInstantIndexingService.submitUrl('https://example.com/test-article', 'URL_UPDATED');
    console.log('Result with valid URL and config:', result4);

    // Test 5: URL deletion
    console.log('\n5. Testing URL deletion...');
    const result5 = await googleInstantIndexingService.submitUrl('https://example.com/deleted-article', 'URL_DELETED');
    console.log('Result with URL deletion:', result5);

    // Test 6: Get updated stats
    console.log('\n6. Getting updated statistics...');
    const stats = await googleInstantIndexingService.getStats();
    console.log('Updated stats:', stats);

    console.log('\n✅ All URL submission tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testUrlSubmission(); 