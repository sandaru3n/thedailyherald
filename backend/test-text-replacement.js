const { applyTextReplacements } = require('./utils/textReplacement');

// Test the text replacement functionality
async function testTextReplacement() {
  console.log('🧪 Testing Text Replacement Functionality\n');

  // Test rules
  const rules = [
    {
      find: '&#8217;',
      replace: "'",
      description: 'Convert HTML apostrophe to regular apostrophe',
      isActive: true
    },
    {
      find: '&#8216;',
      replace: "'",
      description: 'Convert HTML left single quotation mark',
      isActive: true
    },
    {
      find: '&quot;',
      replace: '"',
      description: 'Convert HTML quote to regular quote',
      isActive: true
    },
    {
      find: '&amp;',
      replace: '&',
      description: 'Convert HTML ampersand to regular ampersand',
      isActive: true
    }
  ];

  // Test cases
  const testCases = [
    "Democrats ask how Trump&#8217;s government will regulate Trump Mobile",
    "The company&#8217;s new policy &quot;changes everything&quot;",
    "This &amp; that with &#8216;quotes&#8217; and &quot;more quotes&quot;",
    "Normal text without any HTML entities",
    "Mixed content: Trump&#8217;s &quot;policy&quot; &amp; Biden&#8217;s &quot;response&quot;"
  ];

  console.log('📋 Test Rules:');
  rules.forEach((rule, index) => {
    console.log(`  ${index + 1}. "${rule.find}" → "${rule.replace}" (${rule.description})`);
  });

  console.log('\n📝 Test Cases:');
  testCases.forEach((testCase, index) => {
    const result = applyTextReplacements(testCase, rules);
    console.log(`\n  Test ${index + 1}:`);
    console.log(`    Original: "${testCase}"`);
    console.log(`    Result:   "${result}"`);
    console.log(`    Changed:  ${testCase !== result ? '✅ Yes' : '❌ No'}`);
  });

  console.log('\n✅ Text replacement test completed!');
}

// Run the test
testTextReplacement().catch(console.error); 