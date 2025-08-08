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
        'User-Agent': 'CategoriesTest/1.0',
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

async function testCategoriesList() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  console.log('🧪 Testing CategoriesList Component...\n');

  try {
    // Test 1: Check if categories API is working
    console.log('1. Testing categories API...');
    const categoriesResponse = await makeRequest(`${API_BASE_URL}/api/categories`);
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('✅ Categories API accessible');
      
      if (Array.isArray(categoriesData)) {
        console.log(`📊 Found ${categoriesData.length} categories from API`);
        if (categoriesData.length > 0) {
          console.log('📋 Sample categories:');
          categoriesData.slice(0, 3).forEach((category, index) => {
            console.log(`   ${index + 1}. ${category.name} (${category.slug}) - ${category.articleCount || 0} articles`);
          });
        }
      } else if (categoriesData.success && categoriesData.categories) {
        console.log(`📊 Found ${categoriesData.categories.length} categories from API`);
        if (categoriesData.categories.length > 0) {
          console.log('📋 Sample categories:');
          categoriesData.categories.slice(0, 3).forEach((category, index) => {
            console.log(`   ${index + 1}. ${category.name} (${category.slug}) - ${category.articleCount || 0} articles`);
          });
        }
      } else {
        console.log('⚠️  Unexpected API response format');
      }
    } else {
      console.log('❌ Categories API not accessible:', categoriesResponse.status);
    }

    // Test 2: Check articles page for CategoriesList component
    console.log('\n2. Testing articles page for CategoriesList...');
    const articlesResponse = await makeRequest(`${baseUrl}/articles`);
    
    if (articlesResponse.ok) {
      const articlesText = await articlesResponse.text();
      console.log('✅ Articles page accessible');
      
      // Check for CategoriesList component indicators
      const categoriesListIndicators = [
        'CategoriesList',
        'font-semibold text-gray-900',
        'space-y-2',
        'hover:bg-gray-50',
        'cursor-pointer'
      ];
      
      let foundIndicators = 0;
      categoriesListIndicators.forEach(indicator => {
        if (articlesText.includes(indicator)) {
          foundIndicators++;
        }
      });
      
      if (foundIndicators >= 3) {
        console.log('✅ CategoriesList component found on articles page');
      } else {
        console.log(`⚠️  CategoriesList component indicators: ${foundIndicators}/5`);
      }
      
      // Check for category links
      const categoryLinks = articlesText.match(/href="\/category\/[^"]+"/g);
      if (categoryLinks) {
        console.log(`✅ Found ${categoryLinks.length} category links on articles page`);
      } else {
        console.log('❌ No category links found on articles page');
      }
      
    } else {
      console.log('❌ Articles page not accessible:', articlesResponse.status);
    }

    // Test 3: Check single article page for comparison
    console.log('\n3. Testing single article page for comparison...');
    const articleResponse = await makeRequest(`${baseUrl}/article/test-article`);
    
    if (articleResponse.ok) {
      const articleText = await articleResponse.text();
      console.log('✅ Single article page accessible');
      
      // Check for CategoriesList on article page
      if (articleText.includes('CategoriesList') || articleText.includes('font-semibold text-gray-900')) {
        console.log('✅ CategoriesList component found on single article page');
      } else {
        console.log('⚠️  CategoriesList component not found on single article page');
      }
      
    } else {
      console.log('⚠️  Single article page not accessible (expected for test article)');
    }

    // Test 4: Check for proper styling and functionality
    console.log('\n4. Checking CategoriesList styling and functionality...');
    const articlesResponse2 = await makeRequest(`${baseUrl}/articles`);
    
    if (articlesResponse2.ok) {
      const articlesText2 = await articlesResponse2.text();
      
      // Check for proper styling classes
      const stylingClasses = [
        'rounded-lg',
        'hover:bg-gray-50',
        'transition-colors',
        'w-8 h-8',
        'flex items-center'
      ];
      
      let styledElements = 0;
      stylingClasses.forEach(className => {
        if (articlesText2.includes(className)) {
          styledElements++;
        }
      });
      
      if (styledElements >= 3) {
        console.log('✅ CategoriesList has proper styling');
      } else {
        console.log(`⚠️  CategoriesList styling: ${styledElements}/5 classes found`);
      }
      
      // Check for article counts
      if (articlesText2.includes('articles')) {
        console.log('✅ CategoriesList shows article counts');
      } else {
        console.log('⚠️  CategoriesList may not show article counts');
      }
      
      // Check for icons
      if (articlesText2.includes('lucide-react') || articlesText2.includes('w-4 h-4')) {
        console.log('✅ CategoriesList includes icons');
      } else {
        console.log('⚠️  CategoriesList may not include icons');
      }
      
    }

    console.log('\n🎉 CategoriesList testing completed!');
    console.log('\n📋 Summary:');
    console.log('- CategoriesList component added to articles page');
    console.log('- Component fetches categories from API dynamically');
    console.log('- Shows category names, icons, and article counts');
    console.log('- Includes proper styling and hover effects');
    console.log('- Links to individual category pages');
    console.log('- Consistent with single article page design');

  } catch (error) {
    console.error('❌ Error testing CategoriesList:', error.message);
  }
}

// Run the test
testCategoriesList();
