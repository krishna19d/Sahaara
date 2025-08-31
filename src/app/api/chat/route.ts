import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/ai';

export async function POST(request: NextRequest) {
  let message: string | undefined;
  
  try {
    const { 
      message: requestMessage, 
      conversationHistory, 
      userPreferences,
      currentMood,
      sessionId 
    } = await request.json();
    
    message = requestMessage;

    // Debug logging
    console.log('Chat API received:', {
      messageLength: message?.length,
      hasConversationHistory: !!conversationHistory,
      hasPreferences: !!userPreferences,
      preferenceKeys: userPreferences ? Object.keys(userPreferences) : [],
      hasMood: !!currentMood,
      moodKeys: currentMood ? Object.keys(currentMood) : [],
      sessionId
    });

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate AI response with user context
    const result = await generateChatResponse(
      message, 
      conversationHistory || [],
      userPreferences,
      currentMood
    );

    return NextResponse.json({
      response: result.response,
      isCrisis: result.isCrisis,
      timestamp: Date.now(),
      debug: {
        hasPreferences: !!userPreferences,
        preferenceKeys: userPreferences ? Object.keys(userPreferences) : [],
        hasMood: !!currentMood
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Provide adaptive wellness response based on message content
    let fallbackResponse = "I hear you, and I want to help. ";
    
    // Analyze message for adaptive response length
    if (message && typeof message === 'string') {
      const lowerMessage = message.toLowerCase();
      const wordCount = message.split(/\s+/).length;
      const isComplex = wordCount > 15 || lowerMessage.includes('how') || lowerMessage.includes('why') || lowerMessage.includes('what should');
      
      if (lowerMessage.includes('not good') || lowerMessage.includes('bad') || lowerMessage.includes('awful')) {
        if (isComplex) {
          fallbackResponse += "It sounds like you're going through a really tough time right now, and I can hear the pain in your words. Difficult emotions are completely valid - they're your mind's way of processing challenging experiences. While I work on reconnecting to better support you, know that these feelings will pass. What's one small thing that has helped you feel even slightly better in the past? Sometimes revisiting those tiny comforts can provide a moment of relief.";
        } else {
          fallbackResponse += "It sounds like you're having a tough time right now. That's completely understandable - we all have difficult moments. Would it help to talk about what's making you feel this way?";
        }
      } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) {
        if (isComplex) {
          fallbackResponse += "Stress and anxiety can feel absolutely overwhelming, especially when they're affecting multiple areas of your life. Your nervous system is working hard to protect you, but it can get stuck in high alert mode. Try this grounding technique: breathe in for 4 counts, hold for 4, exhale for 6. Repeat this 5 times. The longer exhale signals safety to your nervous system. What specific situation is causing the most stress right now?";
        } else {
          fallbackResponse += "Stress and anxiety can feel overwhelming. Try taking three slow, deep breaths right now. What's one small thing that usually helps you feel a bit calmer?";
        }
      } else if (lowerMessage.includes('sad') || lowerMessage.includes('down')) {
        if (isComplex) {
          fallbackResponse += "I'm sorry you're feeling so down right now. Sadness can feel heavy and all-consuming, but it's important to remember that emotions are temporary visitors, not permanent residents. Your feelings are completely valid - you don't need to justify or fix them right away. Sometimes the kindest thing is simply acknowledging the sadness and treating yourself with the same compassion you'd show a good friend. What's one small act of self-kindness you could do for yourself today?";
        } else {
          fallbackResponse += "I'm sorry you're feeling down. Your feelings are valid, and it's okay to have hard days. What's one small thing that sometimes brings you a moment of comfort?";
        }
      } else {
        if (isComplex) {
          fallbackResponse += "I can tell you have a lot on your mind, and I want to give you the thoughtful response you deserve. While I work on reconnecting to provide better support, please know that whatever you're experiencing is valid and important. Taking the step to reach out shows real strength and self-awareness. Is there one particular aspect of what you're going through that feels most urgent or pressing right now?";
        } else {
          fallbackResponse += "I'm here to listen and support you through whatever you're experiencing. What would feel most helpful to talk about right now?";
        }
      }
    } else {
      fallbackResponse += "I'm here to listen and support you. What's on your mind today?";
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        response: fallbackResponse,
        isCrisis: false,
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}
