import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyDEWMlpYgDJXT8E_zW7peu5Dpho6TdGf20'
);

export async function POST(request: NextRequest) {
  try {
    const { 
      archetype, 
      preferences, 
      currentMood, 
      customPrompt 
    } = await request.json();

    if (!archetype && !customPrompt) {
      return NextResponse.json(
        { error: 'Archetype or custom prompt required' },
        { status: 400 }
      );
    }

    // Enhanced system prompt for dynamic ritual generation
    const systemPrompt = `You are Sahaara, an AI wellness companion specifically designed for Indian youth (15-30). You create personalized 60-90 second micro-rituals using evidence-based psychology techniques (CBT, ACT, DBT).

IMPORTANT GUIDELINES:
- Keep responses to exactly 60-90 seconds when spoken aloud
- Use warm, supportive, non-judgmental tone
- Include specific breathing techniques or grounding exercises
- Reference the user's personal preferences naturally
- End with a concrete micro-action (10-15 words max)
- Never give medical advice or diagnoses
- Use "you" language and present tense
- Include gentle physical movements when appropriate
- Cultural context: Indian youth facing academic pressure, family expectations, social challenges

CRISIS DETECTION: If user mentions self-harm, suicide, or severe distress, respond with concern and suggest professional help resources.

FORMAT RESPONSE AS JSON:
{
  "audio_text": "The guided ritual text (60-90 seconds spoken)",
  "visual_artifact": "A short memorable phrase or affirmation",
  "micro_action": "One specific small action to take",
  "tags": ["relevant", "tags"],
  "escalation": false,
  "confidence_score": 0.85
}`;

    let userPrompt = '';
    
    if (customPrompt) {
      // Direct custom request
      userPrompt = `Create a personalized micro-ritual for: "${customPrompt}"`;
      
      if (preferences) {
        userPrompt += `\n\nUser context:
        - Safe place: ${preferences.safe_place || 'unknown'}
        - Favorite hobby: ${preferences.hobbies?.[0] || 'unknown'}
        - Personal dream: ${preferences.dream || 'unknown'}
        - Current challenges: ${preferences.problems?.join(', ') || 'unknown'}`;
      }
    } else {
      // Archetype-based generation
      const archetypePrompts = {
        'performance_anxiety': `Create a ritual for someone experiencing performance anxiety before an important event (exam, presentation, interview). 
        Focus on: confidence building, grounding techniques, visualization of success.`,
        
        'activation_deficit': `Create a ritual for someone feeling low energy, unmotivated, or stuck. 
        Focus on: gentle movement, purpose reconnection, small achievable actions.`,
        
        'interpersonal_distress': `Create a ritual for someone struggling with relationships, feeling lonely, or dealing with social conflict. 
        Focus on: self-compassion, boundary setting, connection with support systems.`
      };

      userPrompt = archetypePrompts[archetype as keyof typeof archetypePrompts] || archetypePrompts['performance_anxiety'];
      
      if (preferences) {
        userPrompt += `\n\nPersonalize using these details:
        - Safe place: ${preferences.safe_place || 'a peaceful place'}
        - Favorite hobby: ${preferences.hobbies?.[0] || 'their interests'}
        - Personal dream: ${preferences.dream || 'their goals'}
        - Movie they love: ${preferences.movie?.title || 'unknown'} (reason: ${preferences.movie?.reason || 'unknown'})
        - Song that moves them: ${preferences.song?.title || 'unknown'}
        - Current challenges: ${preferences.problems?.join(', ') || 'general stress'}`;
      }

      if (currentMood) {
        userPrompt += `\n\nCurrent mood state:
        - Stress level: ${Math.round(currentMood.stress * 10)}/10
        - Energy level: ${Math.round(currentMood.activation * 10)}/10
        - Connection level: ${Math.round((1 - currentMood.isolation) * 10)}/10`;
      }
    }

    // Try Gemini AI first
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userPrompt }
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      // Try to parse as JSON
      try {
        const parsedResponse = JSON.parse(text);
        
        // Validate required fields
        if (parsedResponse.audio_text && parsedResponse.micro_action) {
          return NextResponse.json({
            ...parsedResponse,
            generated_by: 'gemini-ai',
            timestamp: Date.now()
          });
        }
      } catch (parseError) {
        console.warn('Failed to parse Gemini response as JSON, using fallback');
      }
    } catch (geminiError) {
      console.warn('Gemini AI failed, using local fallback:', geminiError);
    }

    // Fallback to local generation
    const fallbackRitual = generateLocalRitual(archetype, preferences, currentMood);
    
    return NextResponse.json({
      ...fallbackRitual,
      generated_by: 'local-fallback',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Dynamic ritual generation error:', error);
    
    // Emergency fallback
    return NextResponse.json({
      audio_text: "Take a moment to find your breath. Breathe in for four counts, hold for four, and exhale for six. You are exactly where you need to be in this moment. Place your hand on your heart and feel its steady rhythm - this is your strength. You have overcome challenges before, and you will again.",
      visual_artifact: "I am resilient and capable",
      micro_action: "Take three deep breaths",
      tags: ['grounding', 'emergency'],
      escalation: false,
      confidence_score: 0.7,
      generated_by: 'emergency-fallback',
      timestamp: Date.now()
    });
  }
}

function generateLocalRitual(
  archetype: string, 
  preferences: any = {}, 
  currentMood: any = {}
): any {
  const safePlace = preferences.safe_place || 'a peaceful place';
  const hobby = preferences.hobbies?.[0] || 'something you enjoy';
  const dream = preferences.dream || 'your goals';
  
  const templates = {
    'performance_anxiety': {
      audio_text: `Close your eyes and imagine yourself in ${safePlace}. Feel your feet firmly connected to the ground. You are prepared for this moment. Take three deep breaths and repeat: "I trust in my abilities. I am ready to shine." Picture yourself succeeding and feeling proud. Remember ${dream} - this challenge is one step toward making it real. You've got this.`,
      visual_artifact: "I trust in my abilities and am ready to shine",
      micro_action: "Write down one thing you're prepared for",
      tags: ['confidence', 'grounding', 'visualization']
    },
    
    'activation_deficit': {
      audio_text: `Start by gently rolling your shoulders and releasing any tension. Think about ${hobby} and how it makes you feel alive. That energy is still within you, even when it feels dim. Take energizing breaths and imagine vitality flowing back into your body. Sometimes the smallest step forward is the most powerful. You don't need to move mountains today.`,
      visual_artifact: "Small steps lead to big changes",
      micro_action: "Do one small thing related to your hobby",
      tags: ['energy', 'movement', 'motivation']
    },
    
    'interpersonal_distress': {
      audio_text: `Place your hand on your heart and offer yourself the same kindness you'd give a good friend. Relationships can be challenging, but you deserve love and understanding. Breathe compassion into your heart space. Remember: you can't control others, but you can choose how to respond with love. You are worthy of healthy connections.`,
      visual_artifact: "I deserve love and healthy relationships",
      micro_action: "Send a kind message to someone you care about",
      tags: ['self-compassion', 'relationships', 'boundaries']
    }
  };

  const template = templates[archetype as keyof typeof templates] || templates['performance_anxiety'];
  
  return {
    ...template,
    escalation: false,
    confidence_score: 0.8
  };
}
