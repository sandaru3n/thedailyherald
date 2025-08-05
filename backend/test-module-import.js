const path = require('path');
const fs = require('fs');

console.log('🧪 Testing Module Import...\n');

// Test 1: Check if file exists
const filePath = path.join(__dirname, 'services', 'databaseIndexingQueue.js');
console.log('1. Checking if file exists:');
console.log('File path:', filePath);
console.log('File exists:', fs.existsSync(filePath));

// Test 2: Try to require the module
console.log('\n2. Testing module import:');
try {
  const databaseIndexingQueue = require('./services/databaseIndexingQueue');
  console.log('✅ Module imported successfully');
  console.log('Module type:', typeof databaseIndexingQueue);
  console.log('Has getQueueStatus method:', typeof databaseIndexingQueue.getQueueStatus === 'function');
  console.log('Has getQueueItems method:', typeof databaseIndexingQueue.getQueueItems === 'function');
  console.log('Has clearQueue method:', typeof databaseIndexingQueue.clearQueue === 'function');
} catch (error) {
  console.error('❌ Module import failed:', error.message);
  console.error('Error details:', error);
}

// Test 3: Check directory structure
console.log('\n3. Checking directory structure:');
const servicesDir = path.join(__dirname, 'services');
console.log('Services directory:', servicesDir);
console.log('Services directory exists:', fs.existsSync(servicesDir));

if (fs.existsSync(servicesDir)) {
  const files = fs.readdirSync(servicesDir);
  console.log('Files in services directory:', files);
}

console.log('\n✅ Module import test completed!'); 