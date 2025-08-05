const mongoose = require('mongoose');
const Article = require('./models/Article');

async function checkArticles() {
  try {
    console.log('🔍 Checking articles in database...\n');

    const count = await Article.countDocuments();
    console.log(`Total articles: ${count}`);

    const published = await Article.countDocuments({status: 'published'});
    console.log(`Published articles: ${published}`);

    const drafts = await Article.countDocuments({status: 'draft'});
    console.log(`Draft articles: ${drafts}`);

    console.log('\n📰 Recent articles:');
    const recent = await Article.find()
      .sort({createdAt: -1})
      .limit(10)
      .select('title status createdAt');

    recent.forEach((article, index) => {
      console.log(`${index + 1}. "${article.title}" (${article.status}) - ${article.createdAt}`);
    });

    console.log('\n🔍 Checking for specific titles that might be duplicates:');
    const duplicateTitles = [
      'Fox One will cost $19.99 per month when it arrives before NFL kickoff',
      'Democrats ask how Trump\'s government will regulate Trump Mobile',
      'Google Gemini can now create AI-generated bedtime stories'
    ];

    for (const title of duplicateTitles) {
      const existing = await Article.findOne({title: title});
      if (existing) {
        console.log(`✅ Found existing article: "${title}" (${existing.status})`);
      } else {
        console.log(`❌ No existing article found: "${title}"`);
      }
    }

  } catch (error) {
    console.error('Error checking articles:', error);
  } finally {
    await mongoose.disconnect();
  }
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald')
  .then(() => {
    console.log('Connected to MongoDB');
    checkArticles();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  }); 