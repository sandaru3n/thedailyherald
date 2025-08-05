const mongoose = require('mongoose');
const Settings = require('./models/Settings');
const googleInstantIndexingService = require('./services/googleInstantIndexingService');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testJsonValidation() {
  try {
    console.log('Testing JSON Validation for Google Instant Indexing...\n');

    // Test 1: Invalid JSON
    console.log('1. Testing with invalid JSON...');
    const settings = await Settings.getSettings();
    settings.googleInstantIndexing = {
      enabled: true,
      serviceAccountJson: '{"invalid": "json"',
      projectId: 'test-project'
    };
    await settings.save();

    const result1 = await googleInstantIndexingService.testConfiguration();
    console.log('Result with invalid JSON:', result1);

    // Test 2: Valid JSON but missing required fields
    console.log('\n2. Testing with valid JSON but missing fields...');
    settings.googleInstantIndexing.serviceAccountJson = JSON.stringify({
      project_id: 'test-project',
      // Missing private_key and client_email
    });
    await settings.save();

    const result2 = await googleInstantIndexingService.testConfiguration();
    console.log('Result with missing fields:', result2);

    // Test 3: Valid JSON with all required fields
    console.log('\n3. Testing with valid JSON and all fields...');
    settings.googleInstantIndexing.serviceAccountJson = JSON.stringify({
      project_id: 'test-project',
      private_key: '-----BEGIN PRIVATE KEY-----\nMOCK_KEY\n-----END PRIVATE KEY-----',
      client_email: 'test@test-project.iam.gserviceaccount.com'
    });
    await settings.save();

    const result3 = await googleInstantIndexingService.testConfiguration();
    console.log('Result with valid JSON:', result3);

    // Test 4: Disabled feature
    console.log('\n4. Testing with disabled feature...');
    settings.googleInstantIndexing.enabled = false;
    await settings.save();

    const result4 = await googleInstantIndexingService.testConfiguration();
    console.log('Result with disabled feature:', result4);

    console.log('\n✅ All JSON validation tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testJsonValidation(); 