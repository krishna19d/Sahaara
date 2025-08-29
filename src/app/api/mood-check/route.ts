import { NextRequest, NextResponse } from 'next/server';
import { getUserSession, updateStateVector, calculateTriggerRitual } from '@/lib/session';
import { StateVector } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, stress, activation, isolation, note } = body;

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

    // Update state vector
    const newStateVector: StateVector = {
      stress: stress ?? userSession.state_vector.stress,
      activation: activation ?? userSession.state_vector.activation,
      isolation: isolation ?? userSession.state_vector.isolation,
      identity_conflict: userSession.state_vector.identity_conflict,
      clarity: userSession.state_vector.clarity
    };

    // Save updated state
    await updateStateVector(session_id, newStateVector);

    // Calculate if ritual should be triggered
    const { trigger, confidence } = calculateTriggerRitual(newStateVector);

    return NextResponse.json({
      trigger_ritual: trigger,
      ritual_id: trigger ? `ritual_${Date.now()}` : null,
      confidence: confidence
    });

  } catch (error) {
    console.error('Mood check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
