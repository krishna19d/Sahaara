import { GoogleGenerativeAI } from '@google/generative-ai';
import { ErrorHandler } from './errorHandler';

// Initialize Gemini AI (with mobile browser compatibility)
let genAI: GoogleGenerativeAI | null = null;

// Initialize Gemini AI safely for mobile browsers
function initializeGeminiAI() {
  if (typeof window === 'undefined') return null;
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyDEWMlpYgDJXT8E_zW7peu5Dpho6TdGf20';
    
    // Validate API key
    if (!apiKey || apiKey === 'AIzaSyDEWMlpYgDJXT8E_zW7peu5Dpho6TdGf20') {
      console.log('Using local AI system (no valid Gemini API key)');
      return null;
    }
    
    genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
  } catch (error) {
    console.log('Failed to initialize Gemini AI:', error);
    return null;
  }
}

// Check if we're on mobile device
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  const mobileKeywords = ['Mobile', 'Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone'];
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
         window.innerWidth <= 768 || 
         'ontouchstart' in window;
}

// Crisis keywords for harm detection
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'hurt myself', 'self harm', 'self-harm',
  'cut myself', 'overdose', 'jump off', 'die', 'death', 'harm myself',
  'want to die', 'better off dead', 'not worth living', 'hopeless',
  'can\'t go on', 'give up', 'end it all'
];

// Advanced local conversational AI system
interface ConversationContext {
  topics: string[];
  mood: 'stressed' | 'sad' | 'anxious' | 'neutral' | 'positive';
  previousResponses: string[];
}

// Analyze question complexity and determine appropriate response length
function analyzeQuestionDepth(message: string, context: ConversationContext): {
  depth: 'simple' | 'moderate' | 'complex';
  targetWords: number;
  responseType: string;
} {
  const lowercaseMessage = message.toLowerCase().trim();
  const wordCount = message.split(/\s+/).length;
  const sentenceCount = message.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  // Complex questions that need detailed responses (60-80 words)
  const complexIndicators = [
    'how do I', 'what should I do', 'help me understand', 'explain', 'why does',
    'relationship problem', 'family issue', 'career advice', 'life direction',
    'depression', 'anxiety disorder', 'panic attack', 'mental health',
    'suicidal', 'self harm', 'eating disorder', 'trauma', 'abuse',
    'multiple problems', 'complicated situation', 'don\'t know what to do'
  ];
  
  // Moderate questions that need structured responses (40-60 words)
  const moderateIndicators = [
    'stressed about', 'worried about', 'having trouble', 'struggling with',
    'exam stress', 'work pressure', 'family expectations', 'financial problems',
    'relationship', 'friendship', 'breakup', 'lonely', 'social anxiety',
    'sleep problems', 'concentration', 'motivation', 'self confidence'
  ];
  
  // Check for crisis situations (need longer, careful responses)
  const isCrisis = CRISIS_KEYWORDS.some(keyword => lowercaseMessage.includes(keyword));
  
  // Check for complex patterns
  const hasComplexPattern = complexIndicators.some(indicator => lowercaseMessage.includes(indicator));
  const hasModeratePattern = moderateIndicators.some(indicator => lowercaseMessage.includes(indicator));
  
  // Multi-sentence questions usually need more detailed responses
  const isMultiSentence = sentenceCount > 1;
  const isLongMessage = wordCount > 15;
  
  // Question words that indicate need for explanation
  const questionWords = ['how', 'why', 'what', 'when', 'where', 'which'];
  const hasQuestionWord = questionWords.some(word => lowercaseMessage.includes(word));
  
  if (isCrisis) {
    return { depth: 'complex', targetWords: 80, responseType: 'crisis' };
  } else if (hasComplexPattern || (isMultiSentence && isLongMessage && hasQuestionWord)) {
    return { depth: 'complex', targetWords: 70, responseType: 'detailed' };
  } else if (hasModeratePattern || (hasQuestionWord && isLongMessage) || isMultiSentence) {
    return { depth: 'moderate', targetWords: 50, responseType: 'structured' };
  } else {
    return { depth: 'simple', targetWords: 30, responseType: 'brief' };
  }
}

// Core AI system prompt for Sahaara - ADAPTIVE VERSION
const SYSTEM_PROMPT = `You are Sahaara, a supportive AI companion for Indian youth mental wellness.

RESPONSE REQUIREMENTS:
- Analyze the question depth and respond appropriately
- Simple questions: 20-30 words, brief and supportive
- Moderate questions: 40-50 words, structured with one technique
- Complex questions: 60-80 words, detailed with multiple suggestions
- Crisis situations: Comprehensive support with resources

STYLE: Warm, empathetic, practical - like a caring friend who adapts their response to what you need.`;

// Enhanced response templates with evidence-based techniques and practical coping strategies
const responseTemplates = {
  stress_anxiety: {
    responses: [
      "I hear you're feeling stressed. Let's try a quick grounding technique: name 5 things you see, 4 you can touch, 3 you can hear. This helps bring you to the present moment.",
      "Stress can feel overwhelming. Try the 4-7-8 breathing: breathe in for 4, hold for 7, exhale for 8. This activates your calm response.",
      "When stress builds up, a routine helps. Try 10 minutes of deep breathing or a short walk daily. Small, consistent actions make a big difference."
    ],
    followUps: [
      "Have you tried breathing exercises before?",
      "What usually triggers your stress most?",
      "Would you like a quick mindfulness exercise?"
    ]
  },

  financial_stress: {
    responses: [
      "Financial stress touches so many areas of life. Focus on what you can control today - make a simple list of income, expenses, and one small step for this week.",
      "Money worries make clear thinking harder. Take 5 deep breaths, then write down your main concern and one practical action you could take.",
      "Financial setbacks are tough when building your future. Try 10 minutes daily planning next steps and practicing gratitude for what you have."
    ],
    followUps: [
      "What's one small financial goal for this week?",
      "Have you tried budgeting apps or expense tracking?",
      "Would it help to talk about practical steps?"
    ]
  },

  achievement_pressure: {
    responses: [
      "I understand achievement pressure - it comes from caring about your future. Instead of 'I must achieve big things,' ask 'What small step can I take today?'",
      "Achievement pressure can paralyze because we focus on end results. Each evening, write three small things you accomplished. This builds momentum.",
      "When plans don't work out, it's valuable data, not failure. Ask: What did this teach me? How can I adjust my approach?"
    ],
    followUps: [
      "What does 'success' mean to you personally?",
      "Have you tried breaking goals into daily actions?",
      "What's one small step toward your goals this week?"
    ]
  },
  
  sadness_depression: {
    responses: [
      "I hear you're going through something difficult. Try this: focus on breathing for 2 minutes, then do one small comforting thing like a favorite song.",
      "When emotions feel heavy, try setting one tiny daily goal - like making your bed. Small accomplishments help rebuild your sense of capability.",
      "Low moods make everything harder. Focus on basics first: enough sleep, regular meals, a few minutes outdoors daily. These support emotional resilience."
    ],
    followUps: [
      "What small activities usually bring you comfort?",
      "Have you been maintaining sleep and meal routines?",
      "Would you like to create a simple daily routine together?"
    ]
  },
  
  academic_pressure: {
    responses: [
      "Academic pressure in India can feel overwhelming with family and society expectations. Your worth isn't determined by grades, even when it feels that way.",
      "I understand the intense academic environment and family expectations. You are more than your academic performance, and feeling overwhelmed is normal.",
      "The education system creates intense stress. You've likely prepared as much as you can - that effort has value. Your mental health matters too."
    ],
    followUps: [
      "How are you taking care of yourself during this time?",
      "What would you tell a friend feeling this pressure?",
      "Can you be kinder to yourself about expectations?"
    ]
  },
  
  family_relationships: {
    responses: [
      "Family relationships are complex, especially with different expectations. Balancing being true to yourself while managing family dynamics is challenging.",
      "I hear the tension between honoring family wishes and protecting your wellbeing. You can love your family and still need boundaries for mental health.",
      "Family expectations can feel defining, especially with intergenerational love and pressure combined. You're allowed to forge your own path while respecting family."
    ],
    followUps: [
      "What feels most challenging about these family dynamics?",
      "Are there family members who feel more supportive?",
      "How do you usually handle conflicts between what you want and what's expected?"
    ]
  },
  
  social_relationships: {
    responses: [
      "Wanting connection is natural - relationships fulfill our need to feel understood. Start by being genuinely interested in others and practicing active listening.",
      "Building relationships starts with understanding yourself. Make a list of your positive qualities and interests. When you're comfortable with who you are, authentic connection becomes easier.",
      "Social connections can feel challenging when lonely. Consider joining activities that align with your interests - clubs, sports, volunteering. Shared experiences create natural connection opportunities."
    ],
    followUps: [
      "What activities might help you meet new people?",
      "Have you tried active listening techniques?",
      "What qualities do you value most in relationships?"
    ]
  },
  
  future_uncertainty: {
    responses: [
      "Future uncertainty creates anxiety, especially when everyone expects you to have life figured out. Truth is, most people are making it up as they go.",
      "Not knowing what's next can feel terrifying with pressure to choose the 'right' path. There isn't just one right path - there are many ways to build a meaningful future.",
      "Future anxiety is common when big decisions feel permanent. Most life paths are more flexible than they appear - you can adjust course as you learn."
    ],
    followUps: [
      "What aspects of the future feel most uncertain?",
      "Are there parts of your future you feel excited about?",
      "What small positive step could you take today?"
    ]
  },
  
  general_support: {
    responses: [
      "I'm glad you're here. Whatever you're experiencing, your feelings are valid and you have the strength to work through this. What would feel most helpful today?",
      "Thank you for reaching out - that takes courage. I'm here with practical tools and support. What's been on your mind lately?",
      "You're not alone in whatever you're facing. Seeking help shows self-awareness and strength. Let's focus on what you need right now."
    ],
    followUps: [
      "What's most important for you today?",
      "Have you tried any stress management techniques before?",
      "What does 'feeling better' look like to you right now?"
    ]
  },

  greeting: {
    responses: [
      "Hello! I'm Sahaara, your wellness companion. I'm here with practical tools for stress, habits, and life's challenges. How are you feeling today?",
      "Hi there! Welcome to this safe space. I help with mental wellness through supportive conversation and evidence-based techniques. What's on your mind?",
      "Hey! Thanks for reaching out. I'm here to help you build resilience and healthy coping strategies. Every conversation is confidential and judgment-free."
    ],
    followUps: [
      "What brings you here today?",
      "Looking for stress management or just want to talk?",
      "How has your day been treating you?"
    ]
  }
};

// Advanced context analysis
function analyzeMessageContext(message: string, history: Array<{ role: string; content: string }> = []): ConversationContext {
  const lowercaseMessage = message.toLowerCase();
  let mood: ConversationContext['mood'] = 'neutral';
  let topics: string[] = [];

  // Specific stress/anxiety keywords (including common typos)
  if (lowercaseMessage.includes('stress') || lowercaseMessage.includes('anxiety') || lowercaseMessage.includes('anxious') || 
      lowercaseMessage.includes('worried') || lowercaseMessage.includes('panic') || lowercaseMessage.includes('overwhelmed') ||
      lowercaseMessage.includes('nervous') || lowercaseMessage.includes('tense') || lowercaseMessage.includes('feel stressed') ||
      lowercaseMessage.includes('feeling stressed') || lowercaseMessage.includes('so stressed') ||
      lowercaseMessage.includes('streesed') || lowercaseMessage.includes('stresed') || lowercaseMessage.includes('stressd')) {
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
      lowercaseMessage.includes('want to be successful') || lowercaseMessage.includes('big achievement') ||
      lowercaseMessage.includes('plans not working') || lowercaseMessage.includes('plans are not working') ||
      lowercaseMessage.includes('my plans') || lowercaseMessage.includes('failing') || 
      lowercaseMessage.includes('not working out') || lowercaseMessage.includes('things not working')) {
    mood = 'anxious';
    topics.push('achievement_pressure');
  }
  
  // Sadness/depression indicators
  if (lowercaseMessage.includes('sad') || lowercaseMessage.includes('depressed') || lowercaseMessage.includes('down') || 
      lowercaseMessage.includes('hopeless') || lowercaseMessage.includes('empty') || lowercaseMessage.includes('crying') ||
      lowercaseMessage.includes('worthless') || lowercaseMessage.includes('give up')) {
    mood = 'sad';
    topics.push('sadness_depression');
  }
  
  // Academic pressure
  if (lowercaseMessage.includes('exam') || lowercaseMessage.includes('study') || lowercaseMessage.includes('test') || 
      lowercaseMessage.includes('grade') || lowercaseMessage.includes('academic') || lowercaseMessage.includes('college') || 
      lowercaseMessage.includes('school') || lowercaseMessage.includes('assignment')) {
    topics.push('academic_pressure');
  }
  
  // Family relationships
  if (lowercaseMessage.includes('family') || lowercaseMessage.includes('parents') || lowercaseMessage.includes('mom') || 
      lowercaseMessage.includes('dad') || lowercaseMessage.includes('home') || lowercaseMessage.includes('expectations')) {
    topics.push('family_relationships');
  }
  
  // Social relationships (including typos)
  if (lowercaseMessage.includes('friend') || lowercaseMessage.includes('relationship') || lowercaseMessage.includes('social') || 
      lowercaseMessage.includes('lonely') || lowercaseMessage.includes('people') || lowercaseMessage.includes('dating') ||
      lowercaseMessage.includes('relatioship') || lowercaseMessage.includes('relationshp') || 
      lowercaseMessage.includes('girlfriend') || lowercaseMessage.includes('boyfriend') ||
      lowercaseMessage.includes('want girlfriend') || lowercaseMessage.includes('want boyfriend') ||
      lowercaseMessage.includes('crush') || lowercaseMessage.includes('love life') ||
      lowercaseMessage.includes('romantic') || lowercaseMessage.includes('partner')) {
    topics.push('social_relationships');
  }
  
  // Future uncertainty
  if (lowercaseMessage.includes('future') || lowercaseMessage.includes('career') || lowercaseMessage.includes('job') || 
      lowercaseMessage.includes('uncertain') || lowercaseMessage.includes('confused') || lowercaseMessage.includes('direction')) {
    topics.push('future_uncertainty');
  }
  
  // Greeting detection (only for very short messages that are clearly greetings)
  if ((lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || lowercaseMessage.includes('hey')) && 
      message.trim().length < 15 && !lowercaseMessage.includes('relationship') && !lowercaseMessage.includes('stressed')) {
    topics.push('greeting');
  }
  
  // If no specific topics detected, use general support
  if (topics.length === 0) {
    topics.push('general_support');
  }

  return {
    topics,
    mood,
    previousResponses: history.filter(h => h.role === 'assistant').map(h => h.content)
  };
}

// Generate contextual response
function generateContextualResponse(context: ConversationContext): { response: string; followUp?: string } {
  const primaryTopic = context.topics[0];
  const templates = responseTemplates[primaryTopic as keyof typeof responseTemplates] || responseTemplates.general_support;
  
  // Avoid repeating responses
  const availableResponses = templates.responses.filter(response => 
    !context.previousResponses.some(prev => prev.includes(response.substring(0, 50)))
  );
  
  const responses = availableResponses.length > 0 ? availableResponses : templates.responses;
  const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Add a follow-up question occasionally
  const shouldAddFollowUp = Math.random() > 0.4; // 60% chance
  const followUp = shouldAddFollowUp && templates.followUps ? 
    templates.followUps[Math.floor(Math.random() * templates.followUps.length)] : undefined;
  
  return {
    response: selectedResponse + (followUp ? `\n\n${followUp}` : ''),
    followUp
  };
}

// Enhanced crisis detection with contextual analysis
export async function detectCrisis(message: string): Promise<boolean> {
  const lowercaseMessage = message.toLowerCase().trim();
  
  // Immediate crisis keywords (high confidence)
  const immediateCrisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
    'hurt myself', 'self harm', 'self-harm', 'cut myself', 'overdose',
    'jump off', 'hang myself', 'end it all', 'give up on life'
  ];
  
  // Check for immediate crisis indicators
  if (immediateCrisisKeywords.some(keyword => lowercaseMessage.includes(keyword))) {
    return true;
  }
  
  // Contextual crisis patterns (require multiple indicators)
  const emotionalDistressWords = ['hopeless', 'worthless', 'useless', 'burden', 'trapped', 'alone', 'empty'];
  const negativeThoughtWords = ['no point', 'nothing matters', 'can\'t go on', 'no way out', 'no future'];
  const selfHarmHints = ['pain', 'suffering', 'escape', 'relief', 'permanent solution'];
  
  let riskScore = 0;
  
  // Score emotional distress
  emotionalDistressWords.forEach(word => {
    if (lowercaseMessage.includes(word)) riskScore += 1;
  });
  
  // Score negative thought patterns
  negativeThoughtWords.forEach(phrase => {
    if (lowercaseMessage.includes(phrase)) riskScore += 2;
  });
  
  // Score self-harm hints in context
  if (selfHarmHints.some(word => lowercaseMessage.includes(word))) {
    // Only increase score if combined with distress indicators
    if (riskScore > 0) riskScore += 1;
  }
  
  // Additional context checks
  if (lowercaseMessage.includes('everyone would be better') || 
      lowercaseMessage.includes('tired of living') ||
      lowercaseMessage.includes('can\'t take it anymore')) {
    riskScore += 3;
  }
  
  // Reduce false positives for common phrases
  const commonFalsePositives = [
    'kill time', 'kill it', 'dying to', 'dead tired', 'kill the mood',
    'hurt my feelings', 'hurt my back', 'cut myself shaving', 'cut my finger'
  ];
  
  if (commonFalsePositives.some(phrase => lowercaseMessage.includes(phrase))) {
    riskScore = Math.max(0, riskScore - 2);
  }
  
  // Crisis threshold (requires significant risk indicators)
  return riskScore >= 4;
}

// Simple crisis detection fallback
function detectCrisisSimple(message: string): boolean {
  const lowercaseMessage = message.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowercaseMessage.includes(keyword));
}

// Helper functions to get user data from localStorage (browser-safe)
function getUserPreferences() {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem('sahaara_preferences');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function getUserConsent() {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem('sahaara_consent');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function getCurrentMood() {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem('sahaara_current_mood');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Build comprehensive user context string for AI
function buildUserContextString(preferences: any, currentMood: any): string {
  const parts = [];
  
  if (preferences.age_group) {
    parts.push(`Age group: ${preferences.age_group}`);
  }
  
  if (preferences.stress_source) {
    parts.push(`Main stress source: ${preferences.stress_source}`);
  }
  
  if (preferences.coping_style) {
    parts.push(`Preferred coping style: ${preferences.coping_style}`);
  }
  
  if (preferences.personality) {
    parts.push(`Personality: ${preferences.personality}`);
  }
  
  if (preferences.goal) {
    parts.push(`Main wellness goal: ${preferences.goal}`);
  }
  
  if (preferences.why) {
    parts.push(`Reason for using Sahaara: ${preferences.why}`);
  }
  
  if (preferences.mood) {
    parts.push(`Recent mood state: ${preferences.mood}`);
  }
  
  if (preferences.problems && preferences.problems.length > 0) {
    parts.push(`Current challenges: ${preferences.problems.filter((p: string) => p.trim()).join(', ')}`);
  }
  
  if (preferences.hobbies && preferences.hobbies.length > 0) {
    const hobbiesArray = Array.isArray(preferences.hobbies) ? preferences.hobbies : [preferences.hobbies];
    parts.push(`Hobbies/interests: ${hobbiesArray.join(', ')}`);
  }
  
  if (preferences.safe_place) {
    parts.push(`Safe place: ${preferences.safe_place}`);
  }
  
  if (preferences.dream) {
    parts.push(`Personal dream/goal: ${preferences.dream}`);
  }
  
  if (preferences.delivery?.language) {
    parts.push(`Preferred language: ${preferences.delivery.language}`);
  }
  
  if (currentMood.stress !== undefined) {
    parts.push(`Current stress level: ${Math.round(currentMood.stress * 10)}/10`);
  }
  
  if (currentMood.activation !== undefined) {
    parts.push(`Current motivation level: ${Math.round(currentMood.activation * 10)}/10`);
  }
  
  if (currentMood.isolation !== undefined) {
    parts.push(`Current social stress level: ${Math.round(currentMood.isolation * 10)}/10`);
  }
  
  return parts.length > 0 ? parts.join('\n') : 'No specific user context available';
}

// Generate personalized local response when API fails - MOBILE ENHANCED VERSION
function generatePersonalizedLocalResponse(
  message: string, 
  context: ConversationContext, 
  userPreferences: any, 
  currentMood: any
): string {
  const depthAnalysis = analyzeQuestionDepth(message, context);
  const isMobile = isMobileDevice();
  
  // Special handling for preference questions
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('preferences') || lowerMessage.includes('my app preferences')) {
    if (userPreferences && Object.keys(userPreferences).length > 0) {
      const prefDetails = [];
      if (userPreferences.age_group) prefDetails.push(`age group: ${userPreferences.age_group}`);
      if (userPreferences.stress_source) prefDetails.push(`stress source: ${userPreferences.stress_source}`);
      if (userPreferences.goal) prefDetails.push(`goal: ${userPreferences.goal}`);
      
      return `Yes, I have access to your preferences! I can see your ${prefDetails.slice(0, 2).join(', ')}${prefDetails.length > 2 ? ', and more' : ''}. ${isMobile ? 'I\'m optimized for mobile support and ' : ''}This helps me provide personalized guidance for your situation.`;
    } else {
      return `I don't currently have access to your preferences. Try completing the onboarding process to share your preferences with me. ${isMobile ? 'The mobile interface makes this quick and easy!' : ''}`;
    }
  }
  
  const baseResponse = generateContextualResponse(context);
  
  // Start with base response
  let personalizedResponse = baseResponse.response;
  
  // Add mobile-specific enhancements
  if (isMobile) {
    // Make responses more mobile-friendly and actionable
    personalizedResponse = personalizedResponse.replace(/Try this:/g, 'Quick tip:');
    personalizedResponse = personalizedResponse.replace(/Let's try/g, 'Try');
  }
  
  // Adjust response based on depth analysis
  if (depthAnalysis.depth === 'complex') {
    // Add more detailed guidance for complex questions
    if (context.topics.includes('stress_anxiety') && userPreferences.coping_style) {
      personalizedResponse += ` Since you prefer ${userPreferences.coping_style.toLowerCase()}, try combining that with progressive muscle relaxation. ${isMobile ? 'Use your phone\'s timer for 2-minute sessions.' : 'Also consider setting small daily boundaries to protect your energy.'}`;
    } else if (context.topics.includes('achievement_pressure') && userPreferences.goal) {
      personalizedResponse += ` Your goal to ${userPreferences.goal.toLowerCase()} is meaningful. Break it into weekly milestones, celebrate small wins, and remember that setbacks are learning opportunities, not failures.`;
    } else if (context.topics.includes('family_relationships')) {
      personalizedResponse += ` Family dynamics are complex. Consider having a calm conversation about your feelings, setting gentle boundaries, and finding trusted friends or mentors for additional support.`;
    }
  } else if (depthAnalysis.depth === 'moderate') {
    // Add one personalization element for moderate questions
    if (userPreferences.safe_place && (context.topics.includes('stress_anxiety') || context.topics.includes('sadness_depression'))) {
      personalizedResponse = personalizedResponse.replace(
        /comfortable place|safe place|peaceful place/gi,
        userPreferences.safe_place
      );
    } else if (userPreferences.hobbies && userPreferences.hobbies.length > 0) {
      const favoriteHobby = userPreferences.hobbies[0];
      personalizedResponse += ` Try spending 15 minutes on ${favoriteHobby} today.`;
    }
  }
  
  // Add mood-aware follow-up only for simple responses to keep them brief
  if (depthAnalysis.depth === 'simple') {
    if (currentMood.stress > 0.8) {
      personalizedResponse += isMobile ? ' Want a quick breathing exercise?' : ' Would you like a quick breathing exercise?';
    } else if (currentMood.activation < 0.2) {
      personalizedResponse += ' What\'s one tiny thing that might help today?';
    }
  }
  
  return personalizedResponse;
}

export async function generateChatResponse(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  userPreferences?: any,
  currentMood?: any
): Promise<{ response: string; isCrisis: boolean }> {
  try {
    // Validate and limit input message length
    if (!message || typeof message !== 'string') {
      return {
        response: "I didn't receive your message properly. Could you try sending it again?",
        isCrisis: false
      };
    }

    // Limit message length to prevent overly verbose responses
    const trimmedMessage = message.length > 300 ? message.substring(0, 300) + '...' : message;

    // Check for crisis indicators first
    const isCrisis = await detectCrisis(trimmedMessage);

    if (isCrisis) {
      return {
        response: `I hear that you're going through a really difficult time right now, and I'm genuinely concerned about you. Your feelings are valid, but I want you to know that there are people who can provide immediate professional support:

**Crisis Helplines (Free & Confidential):**
• **Kiran:** 1800-599-0019 (24/7, free from any phone)
• **Vandrevala Foundation:** 9999 666 555 (24/7)
• **iCall:** 9152987821 (Mon-Sat, 8am-10pm)

Please reach out to them right now. You deserve support, and there are people trained to help you through this. I'm here to talk too, but professional support is what you need most right now.`,
        isCrisis: true
      };
    }

    // Use passed parameters or fallback to empty objects
    const effectivePreferences = userPreferences || {};
    const effectiveMood = currentMood || {};

    // Debug preferences access
    console.log('Preferences Debug:', {
      hasPreferences: !!userPreferences,
      preferenceKeys: userPreferences ? Object.keys(userPreferences) : [],
      samplePreferences: userPreferences ? {
        age_group: userPreferences.age_group,
        stress_source: userPreferences.stress_source,
        goal: userPreferences.goal
      } : 'none'
    });

    // Try Gemini API first with mobile browser compatibility
    try {
      // Initialize Gemini AI for mobile browsers
      const geminiAI = genAI || initializeGeminiAI();
      
      // Check if we should use local AI for mobile devices
      const shouldUseLocalAI = isMobileDevice() && (!geminiAI || !process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      
      if (!geminiAI || shouldUseLocalAI) {
        console.log('Using enhanced local AI system for mobile browser');
        throw new Error('Using local AI for mobile compatibility');
      }

      const model = geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Build comprehensive user context
      const userContext = buildUserContextString(effectivePreferences, effectiveMood);
      
      // Analyze question depth for adaptive response length
      const context = analyzeMessageContext(trimmedMessage, conversationHistory);
      const depthAnalysis = analyzeQuestionDepth(trimmedMessage, context);
      
      // Debug logging
      console.log('AI Debug:', {
        hasUserPreferences: !!userPreferences,
        questionDepth: depthAnalysis.depth,
        targetWords: depthAnalysis.targetWords,
        responseType: depthAnalysis.responseType,
        messageLength: trimmedMessage.length,
        userContextLength: userContext.length,
        isMobile: isMobileDevice()
      });
      
      // Build conversation context for Gemini (limit to prevent context overload)
      const conversationContext = conversationHistory
        .slice(-4) // Keep only last 4 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${SYSTEM_PROMPT}

User Context: ${userContext}

Recent conversation:
${conversationContext}

User: ${trimmedMessage}

RESPONSE GUIDANCE:
- Question Depth: ${depthAnalysis.depth}
- Target Length: ${depthAnalysis.targetWords} words
- Response Type: ${depthAnalysis.responseType}
- User has shared preferences: ${Object.keys(effectivePreferences).length > 0 ? 'YES' : 'NO'}

SPECIAL INSTRUCTIONS:
${trimmedMessage.toLowerCase().includes('preferences') || trimmedMessage.toLowerCase().includes('my app preferences') ? 
  `The user is asking about their app preferences. ${Object.keys(effectivePreferences).length > 0 ? 
    'You DO have access to their preferences. Acknowledge this and mention some key details like their age group, stress sources, or goals to prove you have them.' : 
    'You do NOT have access to their preferences currently. Explain they may need to complete onboarding or check their settings.'}` : 
  ''}

${depthAnalysis.depth === 'simple' 
  ? 'Provide a brief, supportive response (20-30 words).' 
  : depthAnalysis.depth === 'moderate' 
  ? 'Provide a structured response with one practical technique (40-50 words).'
  : 'Provide a detailed response with multiple suggestions and resources (60-80 words).'}

${Object.keys(effectivePreferences).length > 0 ? 'Reference their preferences when relevant (age group, stress sources, goals, coping style, etc.).' : ''}

Sahaara:`;

      const result = await model.generateContent(fullPrompt);
      let response = result.response.text().trim();

      // Adaptive length enforcement based on question depth
      const wordCount = response.split(/\s+/).length;
      const targetWords = depthAnalysis.targetWords;
      const maxWords = targetWords + 10; // Allow 10 word buffer
      
      if (wordCount > maxWords) {
        // Intelligently truncate while preserving meaning
        const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
        let truncatedResponse = '';
        let currentWords = 0;
        
        for (const sentence of sentences) {
          const sentenceWords = sentence.trim().split(/\s+/).length;
          if (currentWords + sentenceWords <= maxWords) {
            truncatedResponse += (truncatedResponse ? '. ' : '') + sentence.trim();
            currentWords += sentenceWords;
          } else {
            break;
          }
        }
        
        response = truncatedResponse + (truncatedResponse.endsWith('.') ? '' : '.');
      }

      return {
        response,
        isCrisis: false
      };
    } catch (apiError) {
      // Enhanced error handling with mobile browser detection
      const isMobile = isMobileDevice();
      console.log(`${isMobile ? 'Mobile browser detected - ' : ''}Using enhanced local AI system`);
      console.error('API Error details:', apiError);
      
      const context = analyzeMessageContext(trimmedMessage, conversationHistory);
      const personalizedResponse = generatePersonalizedLocalResponse(trimmedMessage, context, effectivePreferences, effectiveMood);
      
      return {
        response: personalizedResponse,
        isCrisis: false
      };
    }

  } catch (error) {
    console.error('Error generating chat response:', error);
    
    // Get user context for personalized fallback
    const effectivePreferences = userPreferences || {};
    const effectiveMood = currentMood || {};
    const trimmedMessage = message.length > 300 ? message.substring(0, 300) + '...' : message;
    const context = analyzeMessageContext(trimmedMessage);
    const response = generatePersonalizedLocalResponse(trimmedMessage, context, effectivePreferences, effectiveMood);
    
    return {
      response: response,
      isCrisis: false
    };
  }
}

// Generate personalized daily affirmations and nudges
export async function generateDailyContent(
  userPreferences: any = {}
): Promise<{ affirmation: string; nudge: string }> {
  // Use provided preferences or get from storage as fallback
  let effectivePreferences = userPreferences;
  if (Object.keys(effectivePreferences).length === 0) {
    // Only try localStorage if running on client side
    if (typeof window !== 'undefined') {
      effectivePreferences = getUserPreferences();
    }
  }
  
  try {
    const effectiveMood = typeof window !== 'undefined' ? getCurrentMood() : {};
    const userContext = buildUserContextString(effectivePreferences, effectiveMood);
    
    const prompt = `Generate a highly personalized daily affirmation and micro-nudge for this specific user. Use their personal context to make it relevant and meaningful.

User Profile:
${userContext}

Requirements:
- Affirmation: 15-25 words, positive, specific to their goals/challenges
- Nudge: 10-20 words, actionable, relates to their interests/coping style
- Make it feel personal and relevant to their current situation

Format:
Affirmation: [personalized positive message referencing their context]
Nudge: [specific micro-action based on their preferences/hobbies/goals]`;

    // Try to use Gemini API for enhanced content generation
    const geminiAI = genAI || initializeGeminiAI();
    
    const model = geminiAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    if (!model) {
      return generatePersonalizedDailyFallback(effectivePreferences);
    }
    
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // Parse the response
    const lines = content.split('\n');
    const affirmation = lines.find((line: string) => line.startsWith('Affirmation:'))?.replace('Affirmation:', '').trim() || 
      'You have the strength to handle whatever today brings your way.';
    const nudge = lines.find((line: string) => line.startsWith('Nudge:'))?.replace('Nudge:', '').trim() || 
      'Take three deep breaths before starting your next task.';

    return { affirmation, nudge };

  } catch (error) {
    console.error('Error generating daily content:', error);
    // Generate personalized fallback content using the effective preferences
    return generatePersonalizedDailyFallback(effectivePreferences);
  }
}

// Generate personalized fallback daily content
function generatePersonalizedDailyFallback(userPreferences: any): { affirmation: string; nudge: string } {
  // Enhanced fallback content with variety
  const affirmations = [
    'You have the strength to handle whatever today brings your way.',
    'Your progress matters, no matter how small the steps.',
    'It\'s okay to feel uncertain - you\'re exactly where you need to be.',
    'You are worthy of love, respect, and kindness.',
    'Every challenge you face is helping you grow stronger.',
    'Your mental health matters just as much as your physical health.',
    'You don\'t have to be perfect to be valuable.',
    'Taking care of yourself isn\'t selfish - it\'s necessary.',
    'You have survived 100% of your difficult days so far.',
    'Your feelings are valid, and it\'s okay to feel them.'
  ];

  const nudges = [
    'Take three deep breaths before starting your next task.',
    'Write down one thing you\'re grateful for today.',
    'Step outside for 2 minutes and notice something beautiful.',
    'Send a kind message to someone you care about.',
    'Do one small thing that brings you joy.',
    'Practice saying "no" to something that drains your energy.',
    'Set aside 5 minutes to do something you love.',
    'Drink a glass of water and notice how it tastes.',
    'Stretch your body gently for 30 seconds.',
    'Name three things you can see, hear, or feel right now.'
  ];

  // Personalize based on user preferences
  let selectedAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
  let selectedNudge = nudges[Math.floor(Math.random() * nudges.length)];

  // Customize based on user data
  if (userPreferences.goal) {
    if (userPreferences.goal.includes('confident')) {
      selectedAffirmation = 'You have unique strengths and abilities that make you valuable.';
    } else if (userPreferences.goal.includes('calmer')) {
      selectedAffirmation = 'Peace is possible, even in small moments throughout your day.';
    } else if (userPreferences.goal.includes('focus')) {
      selectedAffirmation = 'Your mind is capable of clarity and focus when you treat it with care.';
    }
  }

  if (userPreferences.hobbies && userPreferences.hobbies.length > 0) {
    const hobby = userPreferences.hobbies[0];
    selectedNudge = `Spend 5 minutes doing something related to ${hobby} that brings you joy.`;
  }

  if (userPreferences.coping_style) {
    if (userPreferences.coping_style.includes('Breathing')) {
      selectedNudge = 'Take three conscious, slow breaths and notice how your body feels.';
    } else if (userPreferences.coping_style.includes('movement')) {
      selectedNudge = 'Do some gentle movement - stretch, walk, or dance for 2 minutes.';
    } else if (userPreferences.coping_style.includes('Writing')) {
      selectedNudge = 'Write down one thought or feeling you\'d like to let go of today.';
    }
  }

  return {
    affirmation: selectedAffirmation,
    nudge: selectedNudge
  };
}
