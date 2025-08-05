const mongoose = require('mongoose');
const Settings = require('./models/Settings');
const googleInstantIndexingService = require('./services/googleInstantIndexingService');

async function testIndexingCounter() {
  try {
    console.log('🔍 Testing Indexing Counter...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('📦 Connected to MongoDB');
    
    // Get current stats
    const initialStats = await googleInstantIndexingService.getStats();
    console.log('📊 Initial stats:', initialStats);
    
    // Test the updateStats method directly
    console.log('\n🔄 Testing updateStats method...');
    await googleInstantIndexingService.updateStats(1);
    
    const updatedStats = await googleInstantIndexingService.getStats();
    console.log('📊 Updated stats:', updatedStats);
    
    // Verify the counter increased
    if (updatedStats.totalIndexed === initialStats.totalIndexed + 1) {
      console.log('✅ Counter incremented successfully!');
    } else {
      console.log('❌ Counter did not increment properly');
      console.log(`Expected: ${initialStats.totalIndexed + 1}, Got: ${updatedStats.totalIndexed}`);
    }
    
    // Test with a mock URL submission (this will fail but should still update stats)
    console.log('\n🧪 Testing URL submission...');
    const testResult = await googleInstantIndexingService.submitUrl('https://example.com/test-url');
    console.log('📋 Test result:', testResult);
    
    const finalStats = await googleInstantIndexingService.getStats();
    console.log('📊 Final stats:', finalStats);
    
    // Reset counter for testing (optional)
    console.log('\n🔄 Resetting counter for testing...');
    const settings = await Settings.getSettings();
    settings.googleInstantIndexing.totalIndexed = 0;
    await settings.save();
    
    const resetStats = await googleInstantIndexingService.getStats();
    console.log('📊 Reset stats:', resetStats);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Disconnected from MongoDB');
  }
}

// Run the test
testIndexingCounter(); 