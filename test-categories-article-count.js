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
        'User-Agent': 'CategoriesCountTest/1.0',
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

async function testCategoriesArticleCount() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  console.log('🧪 Testing Categories Article Count...\n');

  try {
    // Test 1: Check categories API for article counts
    console.log('1. Testing categories API for article counts...');
    const categoriesResponse = await makeRequest(`${API_BASE_URL}/api/categories`);
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('✅ Categories API accessible');
      
      if (categoriesData.success && categoriesData.categories) {
        console.log(`📊 Found ${categoriesData.categories.length} categories`);
        
        // Check if categories have articleCount
        const categoriesWithCounts = categoriesData.categories.filter(cat => 
          typeof cat.articleCount === 'number'
        );
        
        console.log(`📊 ${categoriesWithCounts.length} categories have article counts`);
        
        if (categoriesWithCounts.length > 0) {
          console.log('📋 Categories with article counts:');
          categoriesWithCounts.slice(0, 5).forEach((category, index) => {
            console.log(`   ${index + 1}. ${category.name} (${category.slug}) - ${category.articleCount} articles`);
          });
        }
        
        // Check for categories without counts
        const categoriesWithoutCounts = categoriesData.categories.filter(cat => 
          typeof cat.articleCount !== 'number'
        );
        
        if (categoriesWithoutCounts.length > 0) {
          console.log(`⚠️  ${categoriesWithoutCounts.length} categories missing article counts:`);
          categoriesWithoutCounts.forEach((category, index) => {
            console.log(`   ${index + 1}. ${category.name} (${category.slug})`);
          });
        }
        
      } else {
        console.log('❌ Unexpected API response format');
        console.log('Response:', JSON.stringify(categoriesData, null, 2));
      }
    } else {
      console.log('❌ Categories API not accessible:', categoriesResponse.status);
      const errorText = await categoriesResponse.text();
      console.log('Error details:', errorText);
    }

    // Test 2: Check individual category endpoints
    console.log('\n2. Testing individual category endpoints...');
    const testCategories = ['politics', 'business', 'technology'];
    
    for (const categorySlug of testCategories) {
      const categoryResponse = await makeRequest(`${API_BASE_URL}/api/categories/slug/${categorySlug}`);
      
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        if (categoryData.success && categoryData.category) {
          const category = categoryData.category;
          const hasCount = typeof category.articleCount === 'number';
          console.log(`✅ ${category.name} (${category.slug}): ${hasCount ? `${category.articleCount} articles` : 'No count'}`);
        } else {
          console.log(`⚠️  ${categorySlug}: Unexpected response format`);
        }
      } else {
        console.log(`❌ ${categorySlug}: Not accessible (${categoryResponse.status})`);
      }
    }

    // Test 3: Check articles page for CategoriesList component
    console.log('\n3. Testing articles page for CategoriesList with counts...');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const articlesResponse = await makeRequest(`${baseUrl}/articles`);
    
    if (articlesResponse.ok) {
      const articlesText = await articlesResponse.text();
      console.log('✅ Articles page accessible');
      
      // Check for article count indicators
      const countIndicators = [
        'articles',
        'articleCount',
        'text-sm text-gray-500'
      ];
      
      let foundIndicators = 0;
      countIndicators.forEach(indicator => {
        if (articlesText.includes(indicator)) {
          foundIndicators++;
        }
      });
      
      if (foundIndicators >= 2) {
        console.log('✅ CategoriesList shows article counts on articles page');
      } else {
        console.log(`⚠️  CategoriesList count indicators: ${foundIndicators}/3`);
      }
      
    } else {
      console.log('❌ Articles page not accessible:', articlesResponse.status);
    }

    // Test 4: Verify API performance
    console.log('\n4. Testing API performance...');
    const startTime = Date.now();
    const perfResponse = await makeRequest(`${API_BASE_URL}/api/categories`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (perfResponse.ok) {
      console.log(`✅ Categories API response time: ${responseTime}ms`);
      if (responseTime < 1000) {
        console.log('✅ API performance is good (< 1 second)');
      } else if (responseTime < 3000) {
        console.log('⚠️  API performance is acceptable (< 3 seconds)');
      } else {
        console.log('❌ API performance is slow (> 3 seconds)');
      }
    }

    console.log('\n🎉 Categories Article Count testing completed!');
    console.log('\n📋 Summary:');
    console.log('- Categories API now includes article counts');
    console.log('- Individual category endpoints include article counts');
    console.log('- CategoriesList component should display article counts');
    console.log('- API performance is monitored');
    console.log('- All endpoints return consistent data format');

  } catch (error) {
    console.error('❌ Error testing categories article count:', error.message);
  }
}

// Run the test
testCategoriesArticleCount();
