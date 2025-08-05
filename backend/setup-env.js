const fs = require('fs');
const path = require('path');

console.log('🔧 Google Instant Indexing Environment Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file found');
  
  // Read current .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if SITE_URL is already set
  if (envContent.includes('SITE_URL=')) {
    console.log('✅ SITE_URL is already configured');
    const match = envContent.match(/SITE_URL=(.+)/);
    if (match) {
      console.log(`   Current value: ${match[1]}`);
    }
  } else {
    console.log('❌ SITE_URL is not configured');
    console.log('\n📝 Add this line to your .env file:');
    console.log('SITE_URL=https://yourdomain.com');
  }
} else {
  console.log('❌ .env file not found');
  console.log('\n📝 Create a .env file in the backend directory with:');
  console.log('SITE_URL=https://yourdomain.com');
  console.log('MONGODB_URI=mongodb://localhost:27017/thedailyherald');
  console.log('JWT_SECRET=your-jwt-secret');
  console.log('PORT=5000');
}

console.log('\n🔍 Frontend Environment Variables:');
console.log('Create a .env.local file in the frontend directory with:');
console.log('NEXT_PUBLIC_SITE_URL=https://yourdomain.com');

console.log('\n📋 Environment Variable Checklist:');
console.log('Backend (.env):');
console.log('  ✅ SITE_URL=https://yourdomain.com');
console.log('  ✅ MONGODB_URI=mongodb://localhost:27017/thedailyherald');
console.log('  ✅ JWT_SECRET=your-jwt-secret');
console.log('  ✅ PORT=5000');

console.log('\nFrontend (.env.local):');
console.log('  ✅ NEXT_PUBLIC_SITE_URL=https://yourdomain.com');

console.log('\n🧪 Test your configuration:');
console.log('1. Set your environment variables');
console.log('2. Restart your servers');
console.log('3. Run: node test-environment-urls.js');
console.log('4. Check that the output shows your domain, not localhost');

console.log('\n💡 Tips:');
console.log('- Replace "yourdomain.com" with your actual domain');
console.log('- Use https:// for production, http:// for local development');
console.log('- Restart servers after changing environment variables');
console.log('- Test with manual URL submission first'); 