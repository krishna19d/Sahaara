import { NextRequest, NextResponse } from 'next/server';
import { saveArtifact, getUserSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, text, user_action, ritual_type } = body;

    if (!session_id || !text) {
      return NextResponse.json(
        { error: 'Session ID and text are required' },
        { status: 400 }
      );
    }

    // Verify session exists
    const userSession = await getUserSession(session_id);
    if (!userSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Save artifact
    const artifactId = await saveArtifact({
      session_id,
      text: text + (user_action ? `\n\nUser action: ${user_action}` : ''),
      timestamp: new Date(),
      context_state_vector: userSession.state_vector
    });

    return NextResponse.json({
      artifact_id: artifactId,
      message: 'Artifact saved successfully'
    });

  } catch (error) {
    console.error('Save artifact error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
