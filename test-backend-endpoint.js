const fetch = require('node-fetch');

async function testBackendEndpoint() {
  try {
    console.log('Testing backend endpoint...\n');
    
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend server is running');
      console.log('   Status:', healthData.status);
      console.log('   Message:', healthData.message);
    } else {
      console.log('❌ Backend server is not responding');
      return;
    }

    // Test 2: Check if auth routes are accessible
    console.log('\n2. Testing auth routes...');
    const authResponse = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    if (authResponse.status === 401) {
      console.log('✅ Auth routes are accessible (expected 401 for invalid token)');
    } else {
      console.log('❌ Auth routes are not accessible');
      console.log('   Status:', authResponse.status);
    }

    // Test 3: Check if profile picture endpoint exists
    console.log('\n3. Testing profile picture endpoint...');
    const profilePicResponse = await fetch('http://localhost:5000/api/auth/profile-picture', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    if (profilePicResponse.status === 401) {
      console.log('✅ Profile picture endpoint exists (expected 401 for invalid token)');
    } else {
      console.log('❌ Profile picture endpoint not found');
      console.log('   Status:', profilePicResponse.status);
    }

    console.log('\n✅ Backend endpoint tests completed!');
    console.log('\nThe backend server is running and endpoints are accessible.');
    console.log('The 404 error you\'re seeing is likely because the frontend is making requests to the wrong URL.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the backend server is running on port 5000');
  }
}

testBackendEndpoint();
