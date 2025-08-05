const mongoose = require('mongoose');
const Settings = require('./models/Settings');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thedailyherald', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function setupDomainUrl() {
  try {
    console.log('🔧 Setting up Domain URL for Automatic Indexing...\n');

    const settings = await Settings.getSettings();
    
    console.log('Current Settings:');
    console.log('siteUrl:', settings.siteUrl);
    console.log('publisherUrl:', settings.publisherUrl);
    console.log('Environment Variables:');
    console.log('SITE_URL:', process.env.SITE_URL || 'NOT SET');
    console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET');

    console.log('\n📝 To fix automatic indexing, you need to set your actual domain:');
    console.log('\nOption 1: Update Settings (Recommended)');
    console.log('1. Go to Admin Dashboard > Settings > Site Settings');
    console.log('2. Set "Site URL" to your actual domain (e.g., https://yourdomain.com)');
    console.log('3. Set "Publisher URL" to your actual domain (e.g., https://yourdomain.com)');
    console.log('4. Save the settings');

    console.log('\nOption 2: Set Environment Variables');
    console.log('1. In your backend .env file, add:');
    console.log('   SITE_URL=https://yourdomain.com');
    console.log('2. In your frontend .env.local file, add:');
    console.log('   NEXT_PUBLIC_SITE_URL=https://yourdomain.com');
    console.log('3. Restart your servers');

    console.log('\n🔍 Priority Order for URL Selection:');
    console.log('1. settings.siteUrl (from admin dashboard)');
    console.log('2. NEXT_PUBLIC_SITE_URL (environment variable)');
    console.log('3. SITE_URL (environment variable)');
    console.log('4. settings.publisherUrl (from admin dashboard)');
    console.log('5. localhost (fallback)');

    console.log('\n✅ After setting the correct domain:');
    console.log('- Automatic indexing will use your actual domain');
    console.log('- URLs will be like: https://yourdomain.com/article/article-slug');
    console.log('- Manual submission will continue to work as before');

    console.log('\n🧪 Test your setup:');
    console.log('1. Set your domain in settings or environment variables');
    console.log('2. Restart your servers');
    console.log('3. Publish a new article');
    console.log('4. Check the queue monitor - it should show your domain URLs');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the setup
setupDomainUrl(); 