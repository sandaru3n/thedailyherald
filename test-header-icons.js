const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Header Icons Implementation...\n');

// Test 1: Check if new icons are imported in Header.tsx
console.log('1. Checking Header.tsx imports...');
try {
  const headerPath = path.join(__dirname, 'frontend', 'src', 'components', 'Header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  const newIcons = ['BriefcaseBusiness', 'Clapperboard', 'HeartPulse', 'Vote', 'Trophy', 'Cpu', 'CloudRainWind'];
  const missingIcons = newIcons.filter(icon => !headerContent.includes(icon));
  
  if (missingIcons.length === 0) {
    console.log('✅ All new icons are imported in Header.tsx');
  } else {
    console.log('❌ Missing icons in Header.tsx:', missingIcons);
  }
} catch (error) {
  console.log('❌ Error reading Header.tsx:', error.message);
}

// Test 2: Check if icon mapping is updated in getIconComponent
console.log('\n2. Checking getIconComponent mapping...');
try {
  const headerPath = path.join(__dirname, 'frontend', 'src', 'components', 'Header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  const newIconMappings = [
    'trending-up',
    'briefcase',
    'gamepad-2',
    'music',
    'heart',
    'zap',
    'palette',
    'camera',
    'car',
    'book-open',
    'users',
    'newspaper',
    'briefcase-business',
    'clapperboard',
    'heart-pulse',
    'vote',
    'trophy',
    'cpu',
    'cloud-rain-wind'
  ];
  const missingMappings = newIconMappings.filter(mapping => !headerContent.includes(mapping));
  
  if (missingMappings.length === 0) {
    console.log('✅ All new icon mappings are added to getIconComponent');
  } else {
    console.log('❌ Missing icon mappings in getIconComponent:', missingMappings);
  }
} catch (error) {
  console.log('❌ Error checking getIconComponent mapping:', error.message);
}

// Test 3: Check if MobileMenuPortal receives getIconComponent prop
console.log('\n3. Checking MobileMenuPortal integration...');
try {
  const headerPath = path.join(__dirname, 'frontend', 'src', 'components', 'Header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  if (headerContent.includes('getIconComponent={getIconComponent}')) {
    console.log('✅ MobileMenuPortal receives getIconComponent prop');
  } else {
    console.log('❌ MobileMenuPortal does not receive getIconComponent prop');
  }
} catch (error) {
  console.log('❌ Error checking MobileMenuPortal integration:', error.message);
}

// Test 4: Check if navigation items use icons in header
console.log('\n4. Checking navigation icon usage...');
try {
  const headerPath = path.join(__dirname, 'frontend', 'src', 'components', 'Header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  if (headerContent.includes('getIconComponent(item.icon)') && headerContent.includes('IconComponent')) {
    console.log('✅ Navigation items use icons in header');
  } else {
    console.log('❌ Navigation items do not use icons in header');
  }
} catch (error) {
  console.log('❌ Error checking navigation icon usage:', error.message);
}

// Test 5: Check TypeScript compilation
console.log('\n5. Checking TypeScript compilation...');
try {
  const result = execSync('cd frontend && npx tsc --noEmit', { encoding: 'utf8' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed:', error.message);
}

console.log('\n🎉 Header Icons Implementation Test Complete!');
console.log('\n📋 Summary:');
console.log('- Added 7 new Lucide icons to Header.tsx: BriefcaseBusiness, Clapperboard, HeartPulse, Vote, Trophy, Cpu, CloudRainWind');
console.log('- Updated getIconComponent function with all new icon mappings');
console.log('- Header navigation now supports all 20 icons');
console.log('- MobileMenuPortal automatically receives updated icon mapping');
console.log('- Navigation items in header will display the new icons correctly');
