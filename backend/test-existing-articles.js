const { testExistingArticles, applyToExistingArticles } = require('./utils/updateExistingArticles');

// Test the existing articles functionality
async function testExistingArticlesFeature() {
  console.log('🧪 Testing Existing Articles Text Replacement Feature\n');

  try {
    // First, test without saving (dry run)
    console.log('📋 Step 1: Testing with dry run (no changes saved)');
    const testResult = await testExistingArticles();
    
    if (testResult.success) {
      console.log(`✅ Test completed successfully!`);
      console.log(`   Processed: ${testResult.processed} articles`);
      console.log(`   Would update: ${testResult.updated} articles`);
      console.log(`   Errors: ${testResult.errors.length}`);
      
      if (testResult.errors.length > 0) {
        console.log('\n❌ Errors found:');
        testResult.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }
    } else {
      console.log(`❌ Test failed: ${testResult.message}`);
      return;
    }

    // Ask user if they want to apply changes
    console.log('\n🤔 Would you like to apply these changes to existing articles?');
    console.log('   (This will actually update the database)');
    console.log('   Run: node test-existing-articles.js --apply');
    
  } catch (error) {
    console.error('❌ Error testing existing articles:', error);
  }
}

// Apply changes to existing articles
async function applyToExistingArticlesFeature() {
  console.log('💾 Applying Text Replacements to Existing Articles\n');

  try {
    const result = await applyToExistingArticles();
    
    if (result.success) {
      console.log(`✅ Update completed successfully!`);
      console.log(`   Processed: ${result.processed} articles`);
      console.log(`   Updated: ${result.updated} articles`);
      console.log(`   Errors: ${result.errors.length}`);
      
      if (result.errors.length > 0) {
        console.log('\n❌ Errors found:');
        result.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }
    } else {
      console.log(`❌ Update failed: ${result.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error updating existing articles:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');

if (shouldApply) {
  applyToExistingArticlesFeature();
} else {
  testExistingArticlesFeature();
} 