// Simple test to check if servers are running
console.log('Testing server connectivity...\n');

// Test backend server
fetch('http://localhost:5000/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend server is running on port 5000');
    console.log('   Status:', data.status);
    console.log('   Message:', data.message);
  })
  .catch(error => {
    console.log('❌ Backend server is not running on port 5000');
    console.log('   Error:', error.message);
  });

// Test frontend server
fetch('http://localhost:3000')
  .then(response => {
    if (response.ok) {
      console.log('✅ Frontend server is running on port 3000');
    } else {
      console.log('❌ Frontend server responded with status:', response.status);
    }
  })
  .catch(error => {
    console.log('❌ Frontend server is not running on port 3000');
    console.log('   Error:', error.message);
  });

console.log('\nTo fix the 404 error:');
console.log('1. Make sure both servers are running');
console.log('2. Backend should be on http://localhost:5000');
console.log('3. Frontend should be on http://localhost:3000');
console.log('4. The profile picture upload should go to http://localhost:5000/api/auth/profile-picture');
