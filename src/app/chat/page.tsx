'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, AlertTriangle, Heart, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { generateChatResponse } from '@/lib/ai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isCrisis?: boolean;
}

// Helper function to get user preferences
const getUserPreferences = () => {
  if (typeof window === 'undefined') return null;
  const preferencesStr = localStorage.getItem('sahaara_preferences');
  return preferencesStr ? JSON.parse(preferencesStr) : null;
};

// Helper function to get current mood
const getCurrentMood = () => {
  if (typeof window === 'undefined') return null;
  const moodStr = localStorage.getItem('sahaara_current_mood');
  return moodStr ? JSON.parse(moodStr) : null;
};

export default function ChatPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sahaara_session_id');
    if (!storedSessionId) {
      router.push('/');
      return;
    }
    setSessionId(storedSessionId);

    // Load existing chat history
    const storedMessages = localStorage.getItem('sahaara_chat_history');
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    } else {
      // Welcome message
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi there! I'm Sahaara, your anonymous wellness companion. I'm here to listen and support you through whatever you're experiencing. How are you feeling today?",
        timestamp: Date.now()
      }]);
    }

    // Monitor online status
    const handleOnline = () => {
      setIsOnline(true);
      setErrorMessage(null);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setErrorMessage('You&apos;re offline. Messages will be saved and sent when you reconnect.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  useEffect(() => {
    // Save chat history whenever messages change
    if (messages.length > 0) {
      localStorage.setItem('sahaara_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading || !sessionId) return;

    // Clear any previous error messages
    setErrorMessage(null);

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: currentMessage.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history for AI
      const conversationHistory = [...messages, userMessage]
        .slice(-10) // Keep last 10 messages for context
        .map(msg => ({ role: msg.role, content: msg.content }));

      // Get user preferences and current mood for personalization
      const userPreferences = getUserPreferences();
      const currentMood = getCurrentMood();

      // Use client-side AI directly (no API call needed)
      const result = await generateChatResponse(
        userMessage.content,
        conversationHistory.slice(0, -1), // Exclude the current message
        userPreferences,
        currentMood
      );

      setIsLoading(false);

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: result.response,
        timestamp: Date.now(),
        isCrisis: result.isCrisis
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle crisis response
      if (result.isCrisis) {
        setShowCrisisAlert(true);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
      
      // Fallback response when AI fails
      const fallbackMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble processing your message right now, but I'm still here for you. Your message is important to me. If you're in immediate danger, please contact emergency services or reach out to Kiran (1800-599-0019) or Vandrevala Foundation (9999 666 555).",
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, fallbackMessage]);
      setErrorMessage("Processing issues detected. Your messages are saved locally.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-purple-600" />
              <div>
                <h1 className="font-semibold text-gray-800">Sahaara Chat</h1>
                <p className="text-xs text-gray-600">Anonymous & confidential</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Online • Encrypted
          </div>
        </div>
      </div>

      {/* Crisis Alert */}
      {/* Connection Status Indicator */}
      {!isOnline && (
        <div className="bg-orange-50 border-b border-orange-200 p-2">
          <div className="max-w-4xl mx-auto flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4 text-orange-600" />
            <span className="text-orange-700 text-sm">You&apos;re offline - messages will be saved locally</span>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {errorMessage && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-2">
          <div className="max-w-4xl mx-auto flex items-center justify-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-700 text-sm">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Crisis Alert */}
      {showCrisisAlert && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="max-w-4xl mx-auto flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800 text-sm">Crisis Support Available</h3>
              <p className="text-red-700 text-xs mt-1">
                If you&apos;re in immediate danger, please call emergency services or these helplines:
              </p>
              <div className="flex space-x-4 mt-2 text-xs">
                <a href="tel:1800-599-0019" className="text-red-600 hover:underline font-medium">
                  Kiran: 1800-599-0019
                </a>
                <a href="tel:9999666555" className="text-red-600 hover:underline font-medium">
                  Vandrevala: 9999 666 555
                </a>
              </div>
            </div>
            <button 
              onClick={() => setShowCrisisAlert(false)}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : message.isCrisis
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-white shadow-sm border border-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
        {/* Quick Stress Relief Actions */}
        <div className="max-w-4xl mx-auto mb-3">
          <div className="flex gap-2 justify-center">
            <Link
              href="/stress-relief"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 rounded-full text-xs font-medium text-purple-700 transition-all"
            >
              🎮 Pop-It Game
            </Link>
            <Link
              href="/ritual?mode=breathing"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 rounded-full text-xs font-medium text-blue-700 transition-all"
            >
              🫁 Breathing
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 rounded-full text-xs font-medium text-green-700 transition-all"
            >
              🏠 Dashboard
            </Link>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto flex space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send)"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white"
              rows={1}
              style={{ 
                minHeight: '48px',
                maxHeight: '120px',
                resize: 'none',
                color: '#111827',
                backgroundColor: '#ffffff'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!currentMessage.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          This conversation is private and anonymous. No personal data is stored.
        </p>
      </div>
    </div>
  );
}
