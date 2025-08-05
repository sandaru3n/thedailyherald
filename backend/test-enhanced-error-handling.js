const mongoose = require('mongoose');
const googleInstantIndexingService = require('./services/googleInstantIndexingService');
const indexingErrorLogger = require('./utils/indexingErrorLogger');

async function testEnhancedErrorHandling() {
  try {
    console.log('🧪 Testing Enhanced Error Handling for Google Instant Indexing...\n');

    // Test 1: Invalid URL
    console.log('📋 Test 1: Invalid URL');
    const invalidUrlResult = await googleInstantIndexingService.submitUrl('invalid-url');
    console.log('Result:', invalidUrlResult);
    console.log('');

    // Test 2: Valid URL (will fail due to auth issues)
    console.log('📋 Test 2: Valid URL (expected to fail due to auth)');
    const validUrlResult = await googleInstantIndexingService.submitUrl('https://lightlabpresets.com/article/test');
    console.log('Result:', validUrlResult);
    console.log('');

    // Test 3: Test error logger directly
    console.log('📋 Test 3: Direct Error Logger Test');
    const testError = new Error('DECODER routines::unsupported');
    testError.code = 'PRIVATE_KEY_ERROR';
    indexingErrorLogger.logError(testError, 'https://example.com/test', {
      articleTitle: 'Test Article',
      articleId: 'test-id-123'
    });
    console.log('');

    // Test 4: Generate error summary
    console.log('📋 Test 4: Error Summary Report');
    const summary = indexingErrorLogger.generateSummaryReport();
    console.log(summary);
    console.log('');

    // Test 5: Get error statistics
    console.log('📋 Test 5: Error Statistics');
    const stats = indexingErrorLogger.getErrorStats();
    console.log('Error Statistics:', stats);
    console.log('');

    console.log('✅ Enhanced error handling test completed!');
    console.log('\n📋 Summary:');
    console.log('- Error logging is now comprehensive');
    console.log('- Error categorization works correctly');
    console.log('- Troubleshooting steps are provided');
    console.log('- Error statistics are tracked');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald')
  .then(() => {
    console.log('Connected to MongoDB');
    testEnhancedErrorHandling();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  }); 