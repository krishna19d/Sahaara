import { PregenRitual, ArchetypeRule, StateVector, UserPreferences } from '@/types';

// Pre-generated ritual templates for demo
export const PREGEN_RITUALS: PregenRitual[] = [
  {
    archetype: 'performance_anxiety',
    script: `Hey — let's take ninety seconds. Sit upright. Breathe in 4, out 6. As you exhale, hum a short phrase of your calming song. Good. Now, pick one single study question — not the whole paper. Take 2 deep breaths and write that question down. Then do it for 10 minutes. Stand, stretch, come back. One small step.`,
    artifact: "One small question — one real step.",
    estimated_duration: 90,
    audio_url: "/audio/performance_anxiety_ritual.mp3"
  },
  {
    archetype: 'activation_deficit',
    script: `We'll do sixty seconds to get started. Stand up. Breathe in 3, out 3 and clap softly on the exhale. Do a one-minute quick burst: jog in place for 60s or slam your sketchbook for one confident line. After the minute, set a tiny 5-minute task related to your hobby. You've started — that matters.`,
    artifact: "Start small — momentum follows.",
    estimated_duration: 60,
    audio_url: "/audio/activation_deficit_ritual.mp3"
  },
  {
    archetype: 'interpersonal_distress',
    script: `Take 90 seconds. Sit in a comfortable place, close your eyes. Breathe in 4, hold 1, out 6. Picture your safe place for 20 seconds. Now, write a single non-sending line: what you wish you could tell the person (one sentence). If ready, frame one tiny message to send later, or keep it private. You've given voice to it.`,
    artifact: "One line to be heard — for you.",
    estimated_duration: 90,
    audio_url: "/audio/interpersonal_distress_ritual.mp3"
  }
];

// Archetype classification rules (rule-based for MVP)
export const ARCHETYPE_RULES: ArchetypeRule[] = [
  {
    name: 'performance_anxiety',
    conditions: {
      stress_threshold: 0.7,
      activation_threshold: 0.6,
      keywords: ['exam', 'test', 'performance', 'study', 'grade', 'fail', 'pressure']
    },
    weight: 1.0
  },
  {
    name: 'activation_deficit',
    conditions: {
      stress_threshold: 0.5,
      activation_threshold: 0.3, // Low activation
      keywords: ['tired', 'lazy', 'motivation', 'procrastinate', 'start', 'energy']
    },
    weight: 1.0
  },
  {
    name: 'interpersonal_distress',
    conditions: {
      isolation_threshold: 0.6,
      keywords: ['relationship', 'friend', 'family', 'alone', 'misunderstood', 'social', 'connect']
    },
    weight: 1.0
  }
];

// Crisis detection keywords
export const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'die', 'hurt myself', 'self harm',
  'cut myself', 'worthless', 'hopeless', 'no point', 'better off dead',
  'can\'t go on', 'end it all', 'nothing matters'
];

export function detectCrisis(text: string): boolean {
  const lowercaseText = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowercaseText.includes(keyword));
}

export function classifyArchetype(
  stateVector: StateVector, 
  preferences: UserPreferences
): 'performance_anxiety' | 'activation_deficit' | 'interpersonal_distress' {
  const scores: Record<string, number> = {};
  
  // Combine user problems and why text for keyword analysis
  const userText = (preferences.why + ' ' + preferences.problems.join(' ')).toLowerCase();
  
  ARCHETYPE_RULES.forEach(rule => {
    let score = 0;
    
    // Check stress threshold
    if (rule.conditions.stress_threshold && stateVector.stress >= rule.conditions.stress_threshold) {
      score += 0.3;
    }
    
    // Check activation threshold
    if (rule.conditions.activation_threshold) {
      if (rule.name === 'activation_deficit' && stateVector.activation <= rule.conditions.activation_threshold) {
        score += 0.3;
      } else if (rule.name !== 'activation_deficit' && stateVector.activation >= rule.conditions.activation_threshold) {
        score += 0.3;
      }
    }
    
    // Check isolation threshold
    if (rule.conditions.isolation_threshold && stateVector.isolation >= rule.conditions.isolation_threshold) {
      score += 0.3;
    }
    
    // Check keywords
    if (rule.conditions.keywords) {
      const keywordMatches = rule.conditions.keywords.filter(keyword => 
        userText.includes(keyword)
      ).length;
      score += (keywordMatches / rule.conditions.keywords.length) * 0.4;
    }
    
    scores[rule.name] = score * rule.weight;
  });
  
  // Return archetype with highest score, default to performance_anxiety if tie
  const maxScore = Math.max(...Object.values(scores));
  const topArchetype = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
  
  return (topArchetype as any) || 'performance_anxiety';
}

export function getRitualByArchetype(archetype: string): PregenRitual | null {
  return PREGEN_RITUALS.find(ritual => ritual.archetype === archetype) || null;
}

// Personalize ritual script based on user preferences
export function personalizeRitual(ritual: PregenRitual, preferences: UserPreferences): PregenRitual {
  let personalizedScript = ritual.script;
  
  // Replace placeholders with user preferences
  if (preferences.song.title) {
    personalizedScript = personalizedScript.replace(
      'your calming song', 
      `"${preferences.song.title}"`
    );
  }
  
  if (preferences.hobbies.length > 0) {
    personalizedScript = personalizedScript.replace(
      'your hobby',
      preferences.hobbies[0]
    );
    personalizedScript = personalizedScript.replace(
      'sketchbook',
      preferences.hobbies.includes('sketching') ? 'sketchbook' : `${preferences.hobbies[0]} tools`
    );
  }
  
  if (preferences.safe_place) {
    personalizedScript = personalizedScript.replace(
      'comfortable place',
      preferences.safe_place
    );
  }
  
  return {
    ...ritual,
    script: personalizedScript
  };
}
