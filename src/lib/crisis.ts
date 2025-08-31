import { EscalationResponse } from '@/types';

// Crisis detection and escalation system
export function createEscalationResponse(_userInput: string): EscalationResponse {
  return {
    escalation: true,
    message_text: "I'm really sorry you're feeling this way. This sounds serious — please consider contacting local emergency services or a 24/7 crisis helpline now. I can provide a helpline or help connect you to a counselor if you want.",
    helpline_list: [
      {
        country: "IN",
        name: "Kiran Mental Health Helpline",
        number: "1800-599-0019"
      },
      {
        country: "IN", 
        name: "Vandrevala Foundation Helpline",
        number: "9999 666 555"
      },
      {
        country: "IN",
        name: "AASRA Suicide Prevention",
        number: "91-9820466726"
      },
      {
        country: "IN",
        name: "Sneha Suicide Prevention",
        number: "044-24640050"
      }
    ],
    immediate_options: ["call_helpline", "text_helpline", "connect_counselor"]
  };
}

// Additional safety phrases to look for
export const EXTENDED_CRISIS_PATTERNS = [
  /\b(want to|going to|plan to) (die|kill|hurt|end)\b/i,
  /\b(suicide|suicidal) (thought|idea|plan)\b/i,
  /\bno (point|reason|hope)\b/i,
  /\bcan'?t (take|handle|deal|go on)\b/i,
  /\blife is(n'?t)? worth\b/i,
  /\bbetter off (dead|gone)\b/i,
  /\beveryone would be better\b/i,
  /\bdisappear forever\b/i
];

export function advancedCrisisDetection(text: string): boolean {
  const lowercaseText = text.toLowerCase();
  
  // Check for explicit crisis keywords first
  const hasExplicitKeywords = [
    'suicide', 'kill myself', 'end my life', 'hurt myself', 'self harm',
    'cut myself', 'worthless', 'hopeless', 'better off dead'
  ].some(keyword => lowercaseText.includes(keyword));
  
  if (hasExplicitKeywords) return true;
  
  // Check for pattern-based detection
  const hasRiskyPatterns = EXTENDED_CRISIS_PATTERNS.some(pattern => 
    pattern.test(lowercaseText)
  );
  
  return hasRiskyPatterns;
}

// Safe fallback messages when moderation flags content
export const SAFE_FALLBACK_MESSAGES = [
  {
    script: "Let's take a moment together. Breathe with me — in for 4, hold for 2, out for 6. You're here, and that's what matters right now. Sometimes the best thing we can do is just breathe and be present.",
    artifact: "I am here, I am breathing, I am enough.",
    estimated_duration: 30
  },
  {
    script: "Right now, let's focus on what's around you. Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. You're grounded here.",
    artifact: "I am present in this moment.",
    estimated_duration: 45
  }
];

export function getSafeFallback() {
  return SAFE_FALLBACK_MESSAGES[Math.floor(Math.random() * SAFE_FALLBACK_MESSAGES.length)];
}
