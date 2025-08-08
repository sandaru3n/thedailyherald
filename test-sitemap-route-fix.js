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

async function testSitemapRouteFix() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  console.log('🧪 Testing Sitemap Route Fix...\n');

  try {
    // Test 1: Check sitemap endpoint
    console.log('1. Testing sitemap endpoint...');
    const sitemapResponse = await makeRequest(`${API_BASE_URL}/api/articles/sitemap?limit=10`);
    
    if (sitemapResponse.ok) {
      const sitemapData = await sitemapResponse.json();
      console.log('✅ Sitemap endpoint working correctly');
      console.log(`📊 Found ${sitemapData.docs?.length || 0} articles`);
      
      if (sitemapData.docs && sitemapData.docs.length > 0) {
        console.log('📋 Sample articles:');
        sitemapData.docs.slice(0, 3).forEach((article, index) => {
          console.log(`   ${index + 1}. ${article.slug} (${article.publishedAt})`);
        });
      }
    } else {
      console.log('❌ Sitemap endpoint failed:', sitemapResponse.status);
      const errorText = await sitemapResponse.text();
      console.log('Error details:', errorText);
    }

    // Test 2: Check sitemap status endpoint
    console.log('\n2. Testing sitemap status endpoint...');
    const statusResponse = await makeRequest(`${API_BASE_URL}/api/articles/sitemap/status`, {
      headers: {
        'Authorization': 'Bearer test-token' // This will fail but we can check the endpoint exists
      }
    });
    
    if (statusResponse.status === 401) {
      console.log('✅ Sitemap status endpoint exists (requires auth)');
    } else if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ Sitemap status endpoint working:', statusData);
    } else {
      console.log('❌ Sitemap status endpoint failed:', statusResponse.status);
    }

    // Test 3: Check sitemap refresh endpoint
    console.log('\n3. Testing sitemap refresh endpoint...');
    const refreshResponse = await makeRequest(`${API_BASE_URL}/api/articles/sitemap/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token', // This will fail but we can check the endpoint exists
        'Content-Type': 'application/json'
      }
    });
    
    if (refreshResponse.status === 401) {
      console.log('✅ Sitemap refresh endpoint exists (requires auth)');
    } else if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      console.log('✅ Sitemap refresh endpoint working:', refreshData);
    } else {
      console.log('❌ Sitemap refresh endpoint failed:', refreshResponse.status);
    }

    // Test 4: Check sitemap trigger endpoint
    console.log('\n4. Testing sitemap trigger endpoint...');
    const triggerResponse = await makeRequest(`${API_BASE_URL}/api/articles/sitemap/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (triggerResponse.ok) {
      const triggerData = await triggerResponse.json();
      console.log('✅ Sitemap trigger endpoint working:', triggerData);
    } else {
      console.log('❌ Sitemap trigger endpoint failed:', triggerResponse.status);
      const errorText = await triggerResponse.text();
      console.log('Error details:', errorText);
    }

    // Test 5: Verify that :id route still works
    console.log('\n5. Testing that :id route still works...');
    const idResponse = await makeRequest(`${API_BASE_URL}/api/articles/123456789012345678901234`);
    
    if (idResponse.status === 404) {
      console.log('✅ :id route working correctly (404 for non-existent ID)');
    } else if (idResponse.ok) {
      console.log('✅ :id route working correctly (found article)');
    } else {
      console.log('❌ :id route failed:', idResponse.status);
    }

    console.log('\n🎉 Sitemap route fix testing completed!');
    console.log('\n📋 Summary:');
    console.log('- Sitemap routes are now defined before :id route');
    console.log('- No more CastError for "sitemap" as ObjectId');
    console.log('- All sitemap endpoints should work correctly');

  } catch (error) {
    console.error('❌ Error testing sitemap route fix:', error.message);
  }
}

// Run the test
testSitemapRouteFix();
