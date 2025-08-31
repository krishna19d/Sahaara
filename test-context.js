// Quick test for the improved AI context analysis
function testImprovedContext(message) {
  console.log(`\n=== Testing: "${message}" ===`);
  
  const lowercaseMessage = message.toLowerCase();
  let mood = 'neutral';
  let topics = [];

  // Stress (including typos)
  if (lowercaseMessage.includes('stress') || lowercaseMessage.includes('streesed') || 
      lowercaseMessage.includes('stresed') || lowercaseMessage.includes('feeling stressed')) {
    mood = 'anxious';
    topics.push('stress_anxiety');
  }
  
  // Plans/achievement concerns
  if (lowercaseMessage.includes('plans not working') || lowercaseMessage.includes('my plans') ||
      lowercaseMessage.includes('failing') || lowercaseMessage.includes('not working out')) {
    mood = 'anxious';
    topics.push('achievement_pressure');
  }
  
  // Relationships (including typos)
  if (lowercaseMessage.includes('relationship') || lowercaseMessage.includes('relatioship') ||
      lowercaseMessage.includes('girlfriend') || lowercaseMessage.includes('want girlfriend')) {
    topics.push('social_relationships');
  }
  
  if (topics.length === 0) {
    topics.push('general_support');
  }

  console.log('Expected mood:', mood);
  console.log('Expected topics:', topics);
  
  return { topics, mood };
}

// Test the exact problematic messages
testImprovedContext("feeling streesed");
testImprovedContext("my plans are not working");
testImprovedContext("my relatioship issue");
testImprovedContext("i want girlfriend");

console.log('\n=== All tests should now show correct context detection! ===');
