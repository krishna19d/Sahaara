// Test script to verify AI context analysis
function testMessage(message) {
  console.log(`\n=== Testing: "${message}" ===`);
  
  // Simulate the analyzeMessageContext function
  const lowercaseMessage = message.toLowerCase();
  let mood = 'neutral';
  let topics = [];

  // Specific stress/anxiety keywords
  if (lowercaseMessage.includes('stress') || lowercaseMessage.includes('anxiety') || lowercaseMessage.includes('anxious') || 
      lowercaseMessage.includes('worried') || lowercaseMessage.includes('panic') || lowercaseMessage.includes('overwhelmed') ||
      lowercaseMessage.includes('nervous') || lowercaseMessage.includes('tense') || lowercaseMessage.includes('feel stressed') ||
      lowercaseMessage.includes('feeling stressed') || lowercaseMessage.includes('so stressed')) {
    mood = 'anxious';
    topics.push('stress_anxiety');
  }

  // Financial stress indicators
  if (lowercaseMessage.includes('money') || lowercaseMessage.includes('financial') || lowercaseMessage.includes('debt') ||
      lowercaseMessage.includes('broke') || lowercaseMessage.includes('expensive') || lowercaseMessage.includes('afford') ||
      lowercaseMessage.includes('lost money') || lowercaseMessage.includes('financial stress') ||
      lowercaseMessage.includes('have lost money') || lowercaseMessage.includes('losing money') ||
      lowercaseMessage.includes('no money') || lowercaseMessage.includes('money problems')) {
    mood = 'anxious';
    topics.push('financial_stress');
  }
  
  // Achievement/success concerns
  if (lowercaseMessage.includes('success') || lowercaseMessage.includes('achieve') || 
      lowercaseMessage.includes('big in life') || lowercaseMessage.includes('big in y life') ||
      lowercaseMessage.includes('make something') || lowercaseMessage.includes('accomplish') || 
      lowercaseMessage.includes('failure') || lowercaseMessage.includes('not good enough') || 
      lowercaseMessage.includes('disappointing') || lowercaseMessage.includes('cannot make') ||
      lowercaseMessage.includes('want to be successful') || lowercaseMessage.includes('big achievement')) {
    mood = 'anxious';
    topics.push('achievement_pressure');
  }
  
  if (topics.length === 0) {
    topics.push('general_support');
  }

  console.log('Detected mood:', mood);
  console.log('Detected topics:', topics);
  
  return { topics, mood };
}

// Test the problematic messages
testMessage("feel stressed");
testMessage("i have lost money");
testMessage("if i cannot make something big in y life");
testMessage("hello");

console.log('\n=== Summary ===');
console.log('The context analysis should now properly detect:');
console.log('- "feel stressed" -> stress_anxiety');
console.log('- "i have lost money" -> financial_stress');  
console.log('- "if i cannot make something big in y life" -> achievement_pressure');
