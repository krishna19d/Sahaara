import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/session';
import { classifyArchetype, getRitualByArchetype, personalizeRitual } from '@/lib/rituals';
import { advancedCrisisDetection, createEscalationResponse } from '@/lib/crisis';
import { RitualOutput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, state_vector, preferences, delivery } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get user session
    const userSession = await getUserSession(session_id);
    if (!userSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Crisis detection
    const userText = userSession.preferences.why + ' ' + userSession.preferences.problems.join(' ');
    if (advancedCrisisDetection(userText)) {
      const escalationResponse = createEscalationResponse(userText);
      return NextResponse.json(escalationResponse);
    }

    // Classify archetype
    const archetype = classifyArchetype(
      state_vector || userSession.state_vector,
      userSession.preferences
    );

    // Get pre-generated ritual
    const baseRitual = getRitualByArchetype(archetype);
    if (!baseRitual) {
      return NextResponse.json(
        { error: 'No ritual found for archetype' },
        { status: 404 }
      );
    }

    // Personalize ritual
    const personalizedRitual = personalizeRitual(baseRitual, userSession.preferences);

    // Prepare response
    const ritualOutput: RitualOutput = {
      escalation: false,
      audio_text: personalizedRitual.script,
      visual_artifact: personalizedRitual.artifact,
      micro_action_instruction: getMicroActionInstruction(archetype),
      tags: [archetype, 'personalized'],
      estimated_duration_seconds: personalizedRitual.estimated_duration,
      confidence_score: 0.85, // High confidence for pre-gen rituals
      audio_url: personalizedRitual.audio_url
    };

    return NextResponse.json(ritualOutput);

  } catch (error) {
    console.error('Generate ritual error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getMicroActionInstruction(archetype: string): string {
  const instructions = {
    'performance_anxiety': 'Write down one specific question you want to tackle in the next 10 minutes.',
    'activation_deficit': 'Set a 5-minute timer and start one small task related to your hobby.',
    'interpersonal_distress': 'Write one line about what you wish you could say to someone important.'
  };
  
  return instructions[archetype as keyof typeof instructions] || 'Take one small action towards your goal.';
}
