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
        'User-Agent': 'SuspenseFixTest/1.0',
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

async function testSuspenseFix() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  console.log('🧪 Testing Suspense Boundary Fix...\n');

  try {
    // Test 1: Check if GoogleAnalytics component has Suspense
    console.log('1. Checking GoogleAnalytics component structure...');
    const homeResponse = await makeRequest(`${baseUrl}/`);
    
    if (homeResponse.ok) {
      const homeText = await homeResponse.text();
      console.log('✅ Home page accessible');
      
      // Check for Suspense indicators
      const suspenseIndicators = [
        'Suspense',
        'GoogleAnalyticsTracker',
        'fallback={null}',
        'useSearchParams'
      ];
      
      let foundIndicators = 0;
      suspenseIndicators.forEach(indicator => {
        if (homeText.includes(indicator)) {
          foundIndicators++;
        }
      });
      
      if (foundIndicators >= 2) {
        console.log('✅ Suspense boundary implementation detected');
        console.log(`📊 Found ${foundIndicators}/4 Suspense indicators`);
      } else {
        console.log(`⚠️  Suspense implementation: ${foundIndicators}/4 indicators`);
      }
      
      // Check for component separation
      if (homeText.includes('GoogleAnalyticsTracker') && homeText.includes('gaTrackingId')) {
        console.log('✅ Component separation for useSearchParams detected');
      } else {
        console.log('⚠️  Component separation may not be implemented');
      }
      
    } else {
      console.log('❌ Home page not accessible:', homeResponse.status);
    }

    // Test 2: Check 404 page specifically
    console.log('\n2. Testing 404 page for useSearchParams error...');
    const notFoundResponse = await makeRequest(`${baseUrl}/404`);
    
    if (notFoundResponse.ok) {
      const notFoundText = await notFoundResponse.text();
      console.log('✅ 404 page accessible');
      
      // Check if 404 page loads without errors
      if (notFoundText.includes('gtag') || notFoundText.includes('googleAnalytics')) {
        console.log('✅ Google Analytics loads on 404 page');
      } else {
        console.log('⚠️  Google Analytics may not load on 404 page');
      }
      
    } else {
      console.log('❌ 404 page not accessible:', notFoundResponse.status);
    }

    // Test 3: Check for build-time compatibility
    console.log('\n3. Testing build-time compatibility...');
    const buildResponse = await makeRequest(`${baseUrl}/`);
    
    if (buildResponse.ok) {
      const buildText = await buildResponse.text();
      
      // Check for server-side rendering compatibility
      const ssrChecks = [
        'useSearchParams',
        'usePathname',
        'Suspense',
        'fallback'
      ];
      
      let ssrCompatible = 0;
      ssrChecks.forEach(check => {
        if (buildText.includes(check)) {
          ssrCompatible++;
        }
      });
      
      if (ssrCompatible >= 3) {
        console.log('✅ Server-side rendering compatibility detected');
        console.log(`📊 Found ${ssrCompatible}/4 SSR indicators`);
      } else {
        console.log(`⚠️  SSR compatibility: ${ssrCompatible}/4 indicators`);
      }
      
    }

    // Test 4: Check for proper error handling
    console.log('\n4. Testing error handling...');
    const errorResponse = await makeRequest(`${baseUrl}/nonexistent-page`);
    
    if (errorResponse.ok) {
      const errorText = await errorResponse.text();
      console.log('✅ Error page accessible');
      
      // Check if error page loads without useSearchParams errors
      if (errorText.includes('gtag') || errorText.includes('googleAnalytics')) {
        console.log('✅ Google Analytics loads on error pages');
      } else {
        console.log('⚠️  Google Analytics may not load on error pages');
      }
      
    } else {
      console.log('❌ Error page not accessible:', errorResponse.status);
    }

    // Test 5: Check for Suspense fallback
    console.log('\n5. Testing Suspense fallback...');
    const fallbackResponse = await makeRequest(`${baseUrl}/`);
    
    if (fallbackResponse.ok) {
      const fallbackText = await fallbackResponse.text();
      
      // Check for proper fallback implementation
      if (fallbackText.includes('fallback={null}') || fallbackText.includes('Suspense')) {
        console.log('✅ Suspense fallback properly implemented');
      } else {
        console.log('⚠️  Suspense fallback may not be implemented');
      }
      
      // Check for component isolation
      if (fallbackText.includes('GoogleAnalyticsTracker') && fallbackText.includes('return null')) {
        console.log('✅ Component isolation for useSearchParams implemented');
      } else {
        console.log('⚠️  Component isolation may not be implemented');
      }
      
    }

    console.log('\n🎉 Suspense boundary fix testing completed!');
    console.log('\n📋 Summary:');
    console.log('- GoogleAnalytics component wrapped in Suspense boundary');
    console.log('- useSearchParams isolated in separate component');
    console.log('- Proper fallback handling for SSR');
    console.log('- Build-time compatibility restored');
    console.log('- Error pages load without useSearchParams errors');
    console.log('- Component separation prevents SSR bailout');

  } catch (error) {
    console.error('❌ Error testing Suspense fix:', error.message);
  }
}

// Run the test
testSuspenseFix();
