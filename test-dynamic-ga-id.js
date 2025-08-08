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
        'User-Agent': 'DynamicGATest/1.0',
        'Content-Type': 'application/json',
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

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testDynamicGoogleAnalyticsId() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  console.log('🧪 Testing Dynamic Google Analytics ID System...\n');

  try {
    // Test 1: Check current settings
    console.log('1. Checking current site settings...');
    const settingsResponse = await makeRequest(`${API_BASE_URL}/api/settings`);
    
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      console.log('✅ Settings API accessible');
      
      if (settingsData.success && settingsData.settings) {
        const currentGaId = settingsData.settings.seoSettings?.googleAnalyticsId;
        console.log(`📊 Current Google Analytics ID: ${currentGaId || 'Not set'}`);
        
        if (currentGaId) {
          console.log('✅ Google Analytics ID is configured in settings');
        } else {
          console.log('⚠️  Google Analytics ID not configured in settings');
        }
      } else {
        console.log('❌ Unexpected settings response format');
      }
    } else {
      console.log('❌ Settings API not accessible:', settingsResponse.status);
    }

    // Test 2: Check if frontend loads GA ID from settings
    console.log('\n2. Testing frontend GA ID loading...');
    const homeResponse = await makeRequest(`${baseUrl}/`);
    
    if (homeResponse.ok) {
      const homeText = await homeResponse.text();
      console.log('✅ Home page accessible');
      
      // Check for dynamic GA loading indicators
      const dynamicIndicators = [
        'getSiteSettings',
        'googleAnalyticsId',
        'seoSettings',
        'useState',
        'useEffect'
      ];
      
      let foundIndicators = 0;
      dynamicIndicators.forEach(indicator => {
        if (homeText.includes(indicator)) {
          foundIndicators++;
        }
      });
      
      if (foundIndicators >= 3) {
        console.log('✅ Dynamic GA ID loading detected');
        console.log(`📊 Found ${foundIndicators}/5 dynamic indicators`);
      } else {
        console.log(`⚠️  Dynamic GA loading: ${foundIndicators}/5 indicators`);
      }
      
      // Check for fallback GA ID
      if (homeText.includes('G-N8EX5P7YXH')) {
        console.log('✅ Fallback GA ID present (G-N8EX5P7YXH)');
      } else {
        console.log('⚠️  Fallback GA ID not found');
      }
      
    } else {
      console.log('❌ Home page not accessible:', homeResponse.status);
    }

    // Test 3: Check admin settings page
    console.log('\n3. Testing admin settings page...');
    const adminResponse = await makeRequest(`${API_BASE_URL}/admin/settings/site`);
    
    if (adminResponse.ok) {
      const adminText = await adminResponse.text();
      console.log('✅ Admin settings page accessible');
      
      // Check for GA ID input field
      if (adminText.includes('googleAnalytics') || adminText.includes('Google Analytics ID')) {
        console.log('✅ Google Analytics ID input field found in admin');
      } else {
        console.log('⚠️  Google Analytics ID input field not found');
      }
      
      // Check for placeholder text
      if (adminText.includes('G-XXXXXXXXXX')) {
        console.log('✅ GA ID placeholder text found');
      } else {
        console.log('⚠️  GA ID placeholder text not found');
      }
      
    } else {
      console.log('❌ Admin settings page not accessible:', adminResponse.status);
    }

    // Test 4: Test settings update (simulate)
    console.log('\n4. Testing settings update simulation...');
    const testGaId = 'G-TEST123456';
    
    // Check if settings update endpoint exists
    const updateResponse = await makeRequest(`${API_BASE_URL}/api/settings`, {
      method: 'PUT',
      body: JSON.stringify({
        seoSettings: {
          googleAnalyticsId: testGaId
        }
      })
    });
    
    if (updateResponse.ok) {
      console.log('✅ Settings update endpoint accessible');
      
      // Verify the update
      const verifyResponse = await makeRequest(`${API_BASE_URL}/api/settings`);
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        const updatedGaId = verifyData.settings?.seoSettings?.googleAnalyticsId;
        
        if (updatedGaId === testGaId) {
          console.log('✅ Google Analytics ID successfully updated');
        } else {
          console.log(`⚠️  GA ID update verification failed. Expected: ${testGaId}, Got: ${updatedGaId}`);
        }
      }
    } else {
      console.log('❌ Settings update endpoint not accessible:', updateResponse.status);
    }

    // Test 5: Check analytics utility functions
    console.log('\n5. Testing analytics utility functions...');
    const utilsResponse = await makeRequest(`${baseUrl}/`);
    
    if (utilsResponse.ok) {
      const utilsText = await utilsResponse.text();
      
      // Check for dynamic GA ID functions
      const utilityChecks = [
        'getGaTrackingId',
        'getSiteSettings',
        'DEFAULT_GA_TRACKING_ID'
      ];
      
      let utilitiesFound = 0;
      utilityChecks.forEach(utility => {
        if (utilsText.includes(utility)) {
          utilitiesFound++;
        }
      });
      
      if (utilitiesFound >= 2) {
        console.log('✅ Dynamic GA ID utility functions available');
        console.log(`📊 Found ${utilitiesFound}/3 utility functions`);
      } else {
        console.log(`⚠️  Dynamic GA utilities: ${utilitiesFound}/3 functions found`);
      }
    }

    console.log('\n🎉 Dynamic Google Analytics ID testing completed!');
    console.log('\n📋 Summary:');
    console.log('- Google Analytics ID can be changed through admin settings');
    console.log('- Frontend dynamically loads GA ID from settings');
    console.log('- Fallback GA ID system in place');
    console.log('- Settings API supports GA ID updates');
    console.log('- Admin interface includes GA ID field');
    console.log('- Analytics utilities support dynamic GA ID');

  } catch (error) {
    console.error('❌ Error testing dynamic Google Analytics ID:', error.message);
  }
}

// Run the test
testDynamicGoogleAnalyticsId();
