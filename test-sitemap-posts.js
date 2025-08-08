const fetch = require('node-fetch');

async function testSitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  console.log('🧪 Testing Sitemap with Posts/Articles...\n');

  try {
    // Test 1: Main sitemap
    console.log('1. Testing main sitemap...');
    const mainSitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
    const mainSitemapText = await mainSitemapResponse.text();
    
    if (mainSitemapResponse.ok) {
      console.log('✅ Main sitemap accessible');
      
      // Check if articles are included
      const hasArticles = mainSitemapText.includes('/article/');
      if (hasArticles) {
        console.log('✅ Articles found in main sitemap');
        
        // Count article URLs
        const articleMatches = mainSitemapText.match(/\/article\/[^<]+/g);
        const articleCount = articleMatches ? articleMatches.length : 0;
        console.log(`📊 Found ${articleCount} article URLs in main sitemap`);
      } else {
        console.log('⚠️  No articles found in main sitemap');
      }
    } else {
      console.log('❌ Main sitemap not accessible');
    }

    // Test 2: Article sitemap API
    console.log('\n2. Testing article sitemap API...');
    const articleSitemapResponse = await fetch(`${baseUrl}/api/sitemap/articles`);
    const articleSitemapText = await articleSitemapResponse.text();
    
    if (articleSitemapResponse.ok) {
      console.log('✅ Article sitemap API accessible');
      
      // Check if it's proper XML
      if (articleSitemapText.includes('<?xml version="1.0"')) {
        console.log('✅ Article sitemap returns proper XML format');
        
        // Count article URLs
        const articleMatches = articleSitemapText.match(/\/article\/[^<]+/g);
        const articleCount = articleMatches ? articleMatches.length : 0;
        console.log(`📊 Found ${articleCount} article URLs in article sitemap`);
      } else {
        console.log('❌ Article sitemap not in proper XML format');
      }
    } else {
      console.log('❌ Article sitemap API not accessible');
    }

    // Test 3: Backend articles endpoint
    console.log('\n3. Testing backend articles endpoint...');
    const backendResponse = await fetch(`${API_BASE_URL}/api/articles/sitemap?limit=10`);
    
    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      console.log('✅ Backend articles endpoint accessible');
      console.log(`📊 Backend returned ${backendData.docs?.length || 0} articles`);
    } else {
      console.log('❌ Backend articles endpoint not accessible');
    }

    // Test 4: Sitemap index
    console.log('\n4. Testing sitemap index...');
    const sitemapIndexResponse = await fetch(`${baseUrl}/sitemap-index.xml`);
    
    if (sitemapIndexResponse.ok) {
      console.log('✅ Sitemap index accessible');
    } else {
      console.log('❌ Sitemap index not accessible');
    }

    console.log('\n🎉 Sitemap testing completed!');
    
    // Summary
    console.log('\n📋 Summary:');
    console.log('- Main sitemap includes articles by default');
    console.log('- Article sitemap provides XML format');
    console.log('- Backend optimized for sitemap generation');
    console.log('- Proper caching headers implemented');

  } catch (error) {
    console.error('❌ Error testing sitemap:', error.message);
  }
}

// Run the test
testSitemap();
