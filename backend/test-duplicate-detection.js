const mongoose = require('mongoose');
const Article = require('./models/Article');

async function testDuplicateDetection() {
  try {
    console.log('🧪 Testing RSS Duplicate Detection...\n');

    const testTitles = [
      'Here are the best streaming service deals available right now',
      'Google Gemini can now create AI-generated bedtime stories',
      'OpenAI releases a free GPT model that can run on your laptop',
      'Sony\'s noise-canceling WH-1000XM6 are discounted to their Prime Day low',
      'This retro camcorder upgrades Super 8 film cameras with modern conveniences',
      'Grok\'s \'spicy\' video setting instantly made me Taylor Swift nude deepfakes',
      'Google\'s Pixel 9A is cheaper than ever right now',
      'WhatsApp will show a \'safety overview\' before you join unknown group chats',
      'Roku\'s new ad-free video service only costs $2.99 per month',
      'Fox One will cost $19.99 per month when it arrives before NFL kickoff'
    ];

    console.log('🔍 Checking for existing articles with these titles:\n');

    for (const title of testTitles) {
      const existing = await Article.findOne({ title: title });
      if (existing) {
        console.log(`✅ Found existing article: "${title}" (ID: ${existing._id}, Status: ${existing.status})`);
      } else {
        console.log(`❌ No existing article found: "${title}"`);
      }
    }

    console.log('\n📊 Summary:');
    const totalArticles = await Article.countDocuments();
    console.log(`Total articles in database: ${totalArticles}`);

    const publishedArticles = await Article.countDocuments({ status: 'published' });
    console.log(`Published articles: ${publishedArticles}`);

    const draftArticles = await Article.countDocuments({ status: 'draft' });
    console.log(`Draft articles: ${draftArticles}`);

    console.log('\n📰 Recent articles:');
    const recent = await Article.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt');

    recent.forEach((article, index) => {
      console.log(`${index + 1}. "${article.title}" (${article.status}) - ${article.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald')
  .then(() => {
    console.log('Connected to MongoDB');
    testDuplicateDetection();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  }); 