import { NextRequest, NextResponse } from 'next/server';
import { generateDailyContent } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { userPreferences } = await request.json();

    // Generate daily affirmation and nudge
    const dailyContent = await generateDailyContent(userPreferences || {});

    return NextResponse.json({
      affirmation: dailyContent.affirmation,
      nudge: dailyContent.nudge,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Daily content API error:', error);
    
    // Fallback content
    return NextResponse.json({
      affirmation: 'You have the strength to handle whatever today brings your way.',
      nudge: 'Take three deep breaths before starting your next task.',
      timestamp: Date.now()
    });
  }
}
