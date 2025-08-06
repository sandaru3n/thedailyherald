const Article = require('../models/Article');
const Settings = require('../models/Settings');
const { applyTextReplacements } = require('./textReplacement');

/**
 * Update all existing articles with text replacement rules
 * @param {boolean} dryRun - If true, only show what would be changed without saving
 * @returns {Promise<Object>} - Summary of changes
 */
async function updateExistingArticles(dryRun = false) {
  try {
    console.log('🔄 Starting existing articles update...');
    
    // Get text replacement settings
    const settings = await Settings.getSettings();
    
    if (!settings.textReplacements || !settings.textReplacements.enabled) {
      console.log('❌ Text replacements are not enabled in settings');
      return {
        success: false,
        message: 'Text replacements are not enabled',
        processed: 0,
        updated: 0,
        errors: []
      };
    }

    const rules = settings.textReplacements.rules.filter(rule => rule.isActive);
    
    if (rules.length === 0) {
      console.log('❌ No active text replacement rules found');
      return {
        success: false,
        message: 'No active text replacement rules found',
        processed: 0,
        updated: 0,
        errors: []
      };
    }

    console.log(`📋 Found ${rules.length} active replacement rules`);
    rules.forEach((rule, index) => {
      console.log(`  ${index + 1}. "${rule.find}" → "${rule.replace}"`);
    });

    // Get all articles
    const articles = await Article.find({});
    console.log(`📚 Found ${articles.length} articles to process`);

    let processed = 0;
    let updated = 0;
    let errors = [];

    for (const article of articles) {
      try {
        processed++;
        
        // Track original values
        const originalTitle = article.title;
        const originalContent = article.content;
        const originalExcerpt = article.excerpt;
        
        // Apply text replacements
        const newTitle = applyTextReplacements(article.title, rules);
        const newContent = applyTextReplacements(article.content, rules);
        const newExcerpt = article.excerpt ? applyTextReplacements(article.excerpt, rules) : null;
        
        // Check if any changes were made
        const titleChanged = originalTitle !== newTitle;
        const contentChanged = originalContent !== newContent;
        const excerptChanged = originalExcerpt !== newExcerpt;
        
        if (titleChanged || contentChanged || excerptChanged) {
          if (!dryRun) {
            // Update the article
            article.title = newTitle;
            article.content = newContent;
            if (newExcerpt) {
              article.excerpt = newExcerpt;
            }
            await article.save();
          }
          
          updated++;
          
          console.log(`✅ Updated article: "${originalTitle}"`);
          if (titleChanged) {
            console.log(`   Title: "${originalTitle}" → "${newTitle}"`);
          }
          if (contentChanged) {
            console.log(`   Content: ${originalContent.length} → ${newContent.length} chars`);
          }
          if (excerptChanged) {
            console.log(`   Excerpt: "${originalExcerpt}" → "${newExcerpt}"`);
          }
        } else {
          console.log(`⏭️  No changes needed: "${originalTitle}"`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing article "${article.title}":`, error.message);
        errors.push({
          articleId: article._id,
          title: article.title,
          error: error.message
        });
      }
    }

    const summary = {
      success: true,
      processed,
      updated,
      errors,
      dryRun
    };

    console.log('\n📊 Update Summary:');
    console.log(`   Processed: ${processed} articles`);
    console.log(`   Updated: ${updated} articles`);
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Mode: ${dryRun ? 'Dry Run (no changes saved)' : 'Live Update'}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(error => {
        console.log(`   - "${error.title}": ${error.error}`);
      });
    }

    return summary;

  } catch (error) {
    console.error('❌ Error updating existing articles:', error);
    return {
      success: false,
      message: error.message,
      processed: 0,
      updated: 0,
      errors: [error.message]
    };
  }
}

/**
 * Test text replacements on existing articles without saving
 * @returns {Promise<Object>} - Test results
 */
async function testExistingArticles() {
  console.log('🧪 Testing text replacements on existing articles...');
  return await updateExistingArticles(true);
}

/**
 * Apply text replacements to existing articles and save changes
 * @returns {Promise<Object>} - Update results
 */
async function applyToExistingArticles() {
  console.log('💾 Applying text replacements to existing articles...');
  return await updateExistingArticles(false);
}

module.exports = {
  updateExistingArticles,
  testExistingArticles,
  applyToExistingArticles
}; 