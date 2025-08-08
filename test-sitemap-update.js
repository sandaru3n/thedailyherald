const https = require('https');
const http = require('http');

/**
 * Make HTTP request using built-in modules
 */
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'SitemapTest/1.0',
        'Cache-Control': 'no-cache',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testSitemapUpdate() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  console.log('🧪 Testing Sitemap Update...\n');

  try {
    // Test 1: Check current sitemap status
    console.log('1. Checking current sitemap status...');
    const statusResponse = await makeRequest(`${baseUrl}/api/sitemap/refresh`);
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Sitemap status:', statusData);
    } else {
      console.log('❌ Could not get sitemap status');
    }

    // Test 2: Check main sitemap
    console.log('\n2. Checking main sitemap...');
    const sitemapResponse = await makeRequest(`${baseUrl}/sitemap.xml`);
    
    if (sitemapResponse.ok) {
      const sitemapText = await sitemapResponse.text();
      const articleCount = (sitemapText.match(/\/article\//g) || []).length;
      console.log(`✅ Main sitemap accessible with ${articleCount} articles`);
      
      // Show first few articles
      const articleMatches = sitemapText.match(/\/article\/[^<]+/g);
      if (articleMatches && articleMatches.length > 0) {
        console.log('📋 First 3 articles in sitemap:');
        articleMatches.slice(0, 3).forEach((article, index) => {
          console.log(`   ${index + 1}. ${article}`);
        });
      }
    } else {
      console.log('❌ Main sitemap not accessible');
    }

    // Test 3: Check backend articles
    console.log('\n3. Checking backend articles...');
    const backendResponse = await makeRequest(`${API_BASE_URL}/api/articles/sitemap?limit=10`);
    
    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      console.log(`✅ Backend has ${backendData.docs?.length || 0} articles`);
      
      if (backendData.docs && backendData.docs.length > 0) {
        console.log('📋 Recent articles from backend:');
        backendData.docs.slice(0, 3).forEach((article, index) => {
          console.log(`   ${index + 1}. ${article.slug} (${article.publishedAt})`);
        });
      }
    } else {
      console.log('❌ Backend articles not accessible');
    }

    // Test 4: Manual sitemap refresh
    console.log('\n4. Triggering manual sitemap refresh...');
    const refreshResponse = await makeRequest(`${baseUrl}/api/sitemap/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      console.log('✅ Manual refresh successful:', refreshData);
    } else {
      console.log('❌ Manual refresh failed:', refreshResponse.status);
    }

    // Test 5: Check sitemap again after refresh
    console.log('\n5. Checking sitemap after refresh...');
    const sitemapAfterResponse = await makeRequest(`${baseUrl}/sitemap.xml`);
    
    if (sitemapAfterResponse.ok) {
      const sitemapAfterText = await sitemapAfterResponse.text();
      const articleCountAfter = (sitemapAfterText.match(/\/article\//g) || []).length;
      console.log(`✅ Sitemap after refresh has ${articleCountAfter} articles`);
    } else {
      console.log('❌ Sitemap not accessible after refresh');
    }

    console.log('\n🎉 Sitemap update testing completed!');

  } catch (error) {
    console.error('❌ Error testing sitemap update:', error.message);
  }
}

// Run the test
testSitemapUpdate();
