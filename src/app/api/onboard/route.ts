import { NextRequest, NextResponse } from 'next/server';
import { createUserSession } from '@/lib/session';
import { UserPreferences, ConsentFlags } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { preferences, consent } = body;

    // Validate required fields
    if (!preferences || !consent) {
      return NextResponse.json(
        { error: 'Missing preferences or consent data' },
        { status: 400 }
      );
    }

    // Create user session
    const sessionId = await createUserSession(preferences as UserPreferences, consent as ConsentFlags);

    // Calculate initial state vector (simplified for MVP)
    const initialStateVector = {
      stress: mapMoodToStress(preferences.mood),
      activation: 0.5,
      isolation: preferences.problems?.includes('loneliness') ? 0.7 : 0.3,
      identity_conflict: 0.2,
      clarity: 0.3
    };

    return NextResponse.json({
      session_id: sessionId,
      initial_state_vector: initialStateVector
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function mapMoodToStress(mood: string): number {
  const moodMap: Record<string, number> = {
    'Calm': 0.1,
    'Uneasy': 0.4,
    'Stressed': 0.7,
    'Panicked': 0.9,
    'Numb': 0.6
  };
  return moodMap[mood] || 0.5;
}
