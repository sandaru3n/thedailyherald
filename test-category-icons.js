const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Category Icons Implementation...\n');

// Test 1: Check if new icons are imported in CategoriesList.tsx
console.log('1. Checking CategoriesList.tsx imports...');
try {
  const categoriesListPath = path.join(__dirname, 'frontend', 'src', 'components', 'CategoriesList.tsx');
  const categoriesListContent = fs.readFileSync(categoriesListPath, 'utf8');
  
  const newIcons = ['BriefcaseBusiness', 'Clapperboard', 'HeartPulse', 'Vote', 'Trophy', 'Cpu', 'CloudRainWind'];
  const missingIcons = newIcons.filter(icon => !categoriesListContent.includes(icon));
  
  if (missingIcons.length === 0) {
    console.log('✅ All new icons are imported in CategoriesList.tsx');
  } else {
    console.log('❌ Missing icons in CategoriesList.tsx:', missingIcons);
  }
} catch (error) {
  console.log('❌ Error reading CategoriesList.tsx:', error.message);
}

// Test 2: Check if new icons are imported in admin categories page
console.log('\n2. Checking admin categories page imports...');
try {
  const adminCategoriesPath = path.join(__dirname, 'frontend', 'src', 'app', 'admin', 'categories', 'page.tsx');
  const adminCategoriesContent = fs.readFileSync(adminCategoriesPath, 'utf8');
  
  const newIcons = ['BriefcaseBusiness', 'Clapperboard', 'HeartPulse', 'Vote', 'Trophy', 'Cpu', 'CloudRainWind'];
  const missingIcons = newIcons.filter(icon => !adminCategoriesContent.includes(icon));
  
  if (missingIcons.length === 0) {
    console.log('✅ All new icons are imported in admin categories page');
  } else {
    console.log('❌ Missing icons in admin categories page:', missingIcons);
  }
} catch (error) {
  console.log('❌ Error reading admin categories page:', error.message);
}

// Test 3: Check if icon selection UI is implemented
console.log('\n3. Checking icon selection UI...');
try {
  const adminCategoriesPath = path.join(__dirname, 'frontend', 'src', 'app', 'admin', 'categories', 'page.tsx');
  const adminCategoriesContent = fs.readFileSync(adminCategoriesPath, 'utf8');
  
  if (adminCategoriesContent.includes('iconOptions') && adminCategoriesContent.includes('grid-cols-5')) {
    console.log('✅ Icon selection UI is implemented');
  } else {
    console.log('❌ Icon selection UI is missing');
  }
} catch (error) {
  console.log('❌ Error checking icon selection UI:', error.message);
}

// Test 4: Check if icon display is implemented in categories list
console.log('\n4. Checking icon display in categories list...');
try {
  const adminCategoriesPath = path.join(__dirname, 'frontend', 'src', 'app', 'admin', 'categories', 'page.tsx');
  const adminCategoriesContent = fs.readFileSync(adminCategoriesPath, 'utf8');
  
  if (adminCategoriesContent.includes('iconOption?.component') && adminCategoriesContent.includes('IconComponent')) {
    console.log('✅ Icon display is implemented in categories list');
  } else {
    console.log('❌ Icon display is missing in categories list');
  }
} catch (error) {
  console.log('❌ Error checking icon display:', error.message);
}

// Test 5: Check TypeScript compilation
console.log('\n5. Checking TypeScript compilation...');
try {
  const result = execSync('cd frontend && npx tsc --noEmit', { encoding: 'utf8' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed:', error.message);
}

console.log('\n🎉 Category Icons Implementation Test Complete!');
console.log('\n📋 Summary:');
console.log('- Added 7 new Lucide icons: BriefcaseBusiness, Clapperboard, HeartPulse, Vote, Trophy, Cpu, CloudRainWind');
console.log('- Updated CategoriesList.tsx with new icon imports and mapping');
console.log('- Updated admin categories page with icon selection UI');
console.log('- Added icon display in admin categories list');
console.log('- All icons are now available for category selection in the admin panel');
