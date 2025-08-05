const mongoose = require('mongoose');
const Settings = require('./models/Settings');
const googleInstantIndexingService = require('./services/googleInstantIndexingService');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testEnvironmentUrls() {
  try {
    console.log('Testing Environment Variable URL Construction...\n');

    // Test 1: Check current environment variables
    console.log('1. Current Environment Variables:');
    console.log('SITE_URL:', process.env.SITE_URL || 'NOT SET');
    console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET');

    // Test 2: Get settings
    console.log('\n2. Settings from Database:');
    const settings = await Settings.getSettings();
    console.log('settings.siteUrl:', settings.siteUrl);

    // Test 3: Test URL construction logic
    console.log('\n3. URL Construction Logic:');
    const siteUrl = process.env.SITE_URL || settings.siteUrl || 'http://localhost:3000';
    console.log('Final siteUrl used:', siteUrl);

    // Test 4: Test article URL construction
    console.log('\n4. Article URL Construction:');
    const testArticle = {
      slug: 'test-article-slug'
    };
    const articleUrl = `${siteUrl}/article/${testArticle.slug}`;
    console.log('Article URL:', articleUrl);

    // Test 5: Test with different environment scenarios
    console.log('\n5. Testing different environment scenarios:');

    // Scenario A: No environment variables
    const scenarioA = process.env.SITE_URL || settings.siteUrl || 'http://localhost:3000';
    console.log('Scenario A (no env vars):', scenarioA);

    // Scenario B: With SITE_URL set
    process.env.SITE_URL = 'https://testdomain.com';
    const scenarioB = process.env.SITE_URL || settings.siteUrl || 'http://localhost:3000';
    console.log('Scenario B (with SITE_URL):', scenarioB);

    // Scenario C: Reset and test with settings only
    delete process.env.SITE_URL;
    const scenarioC = process.env.SITE_URL || settings.siteUrl || 'http://localhost:3000';
    console.log('Scenario C (settings only):', scenarioC);

    console.log('\n✅ Environment URL tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testEnvironmentUrls(); 