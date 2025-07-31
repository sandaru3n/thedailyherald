const mongoose = require('mongoose');
const Settings = require('./models/Settings');
const googleInstantIndexingService = require('./services/googleInstantIndexingService');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testGoogleIndexing() {
  try {
    console.log('Testing Google Instant Indexing Service...\n');

    // Test 1: Get current settings
    console.log('1. Getting current settings...');
    const settings = await Settings.getSettings();
    console.log('Settings loaded:', {
      enabled: settings.googleInstantIndexing?.enabled,
      hasJson: !!settings.googleInstantIndexing?.serviceAccountJson,
      projectId: settings.googleInstantIndexing?.projectId
    });

    // Test 2: Test configuration
    console.log('\n2. Testing configuration...');
    const testResult = await googleInstantIndexingService.testConfiguration();
    console.log('Configuration test result:', testResult);

    // Test 3: Get statistics
    console.log('\n3. Getting statistics...');
    const stats = await googleInstantIndexingService.getStats();
    console.log('Statistics:', stats);

    // Test 4: Test URL submission (if enabled)
    if (settings.googleInstantIndexing?.enabled) {
      console.log('\n4. Testing URL submission...');
      const testUrl = `${settings.siteUrl}/test-article`;
      const submitResult = await googleInstantIndexingService.submitUrl(testUrl);
      console.log('URL submission result:', submitResult);
    } else {
      console.log('\n4. Skipping URL submission test (feature not enabled)');
    }

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testGoogleIndexing(); 