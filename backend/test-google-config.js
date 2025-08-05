const mongoose = require('mongoose');
const Settings = require('./models/Settings');

async function testGoogleConfig() {
  try {
    console.log('🔍 Testing Google Service Account Configuration...\n');

    // 1. Get settings
    const settings = await Settings.getSettings();
    
    if (!settings.googleInstantIndexing?.enabled) {
      console.log('❌ Google Instant Indexing is not enabled');
      return;
    }

    console.log('✅ Google Instant Indexing is enabled');
    console.log(`📋 Project ID: ${settings.googleInstantIndexing.projectId}`);

    // 2. Check service account JSON
    if (!settings.googleInstantIndexing.serviceAccountJson) {
      console.log('❌ Service Account JSON is not configured');
      return;
    }

    console.log('✅ Service Account JSON is configured');

    // 3. Parse and validate JSON
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(settings.googleInstantIndexing.serviceAccountJson);
      console.log('✅ Service Account JSON is valid');
    } catch (error) {
      console.log('❌ Service Account JSON is invalid:', error.message);
      return;
    }

    // 4. Check required fields
    const requiredFields = ['project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    
    if (missingFields.length > 0) {
      console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    console.log('✅ All required fields are present');
    console.log(`📧 Client Email: ${serviceAccount.client_email}`);
    console.log(`🔑 Private Key Length: ${serviceAccount.private_key.length} characters`);

    // 5. Check private key format
    const hasHeader = serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----');
    const hasFooter = serviceAccount.private_key.includes('-----END PRIVATE KEY-----');
    const hasNewlines = serviceAccount.private_key.includes('\n');

    console.log(`🔐 Private Key Format:`);
    console.log(`   Has header: ${hasHeader}`);
    console.log(`   Has footer: ${hasFooter}`);
    console.log(`   Has newlines: ${hasNewlines}`);

    if (!hasHeader || !hasFooter) {
      console.log('⚠️  Private key needs proper formatting');
    } else {
      console.log('✅ Private key format looks correct');
    }

    // 6. Test with a simple crypto operation
    try {
      const testKey = serviceAccount.private_key;
      console.log('\n🧪 Testing private key with crypto...');
      
      // This will help identify if it's a Node.js/OpenSSL version issue
      const testSign = crypto.createSign('RSA-SHA256');
      testSign.update('test');
      testSign.sign(testKey);
      
      console.log('✅ Private key works with crypto operations');
    } catch (cryptoError) {
      console.log('❌ Private key crypto test failed:', cryptoError.message);
      console.log('💡 This might be a Node.js version compatibility issue');
    }

    console.log('\n✅ Google configuration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Import crypto for testing
const crypto = require('crypto');

// Connect to database and run test
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald')
  .then(() => {
    console.log('Connected to MongoDB');
    testGoogleConfig();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  }); 