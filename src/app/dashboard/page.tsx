'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Activity, MessageCircle, Settings, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';
import MotivationWall from '@/components/MotivationWall';

export default function DashboardPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({ total_rituals: 0, total_time: 0 });
  const [moodData, setMoodData] = useState({
    stress: 0.5,
    activation: 0.5,
    isolation: 0.5
  });
  const [dailyContent, setDailyContent] = useState({
    affirmation: 'Remember: Small, consistent actions create lasting change.',
    nudge: 'Take three deep breaths before starting your next task.'
  });

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sahaara_session_id');
    if (!storedSessionId) {
      router.push('/');
      return;
    }
    setSessionId(storedSessionId);
    
    // Load session stats
    const stats = JSON.parse(localStorage.getItem('sahaara_session_stats') || '{}');
    setSessionStats({
      total_rituals: stats.total_rituals || 0,
      total_time: stats.total_time || 0
    });

    // Load or generate daily content
    loadDailyContent();
  }, [router]);

  const loadDailyContent = async () => {
    try {
      // Check if we already have today's content
      const today = new Date().toDateString();
      const cachedContent = localStorage.getItem('sahaara_daily_content');
      const cachedDate = localStorage.getItem('sahaara_daily_content_date');

      if (cachedContent && cachedDate === today) {
        setDailyContent(JSON.parse(cachedContent));
        return;
      }

      // Generate new daily content
      const preferences = JSON.parse(localStorage.getItem('sahaara_preferences') || '{}');
      
      const response = await fetch('/api/daily-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPreferences: preferences })
      });

      const data = await response.json();
      
      setDailyContent({
        affirmation: data.affirmation,
        nudge: data.nudge
      });

      // Cache for today
      localStorage.setItem('sahaara_daily_content', JSON.stringify({
        affirmation: data.affirmation,
        nudge: data.nudge
      }));
      localStorage.setItem('sahaara_daily_content_date', today);

    } catch (error) {
      console.error('Error loading daily content:', error);
      // Keep fallback content
    }
  };

  const handleMoodCheck = async () => {
    if (!sessionId) return;

    try {
      // Store current mood state
      localStorage.setItem('sahaara_current_mood', JSON.stringify({
        stress: moodData.stress,
        activation: moodData.activation,
        isolation: moodData.isolation,
        timestamp: Date.now()
      }));
      
      // Enhanced mood-based routing
      const stress = moodData.stress;
      const activation = moodData.activation;
      const isolation = moodData.isolation;
      
      // High anxiety → breathing exercise
      if (stress > 0.6) {
        router.push('/ritual?mode=breathing');
        return;
      }
      
      // Low motivation → energy ritual
      if (activation < 0.4) {
        router.push('/ritual?mode=energy');
        return;
      }
      
      // High isolation → connection ritual
      if (isolation > 0.6) {
        router.push('/ritual?mode=connection');
        return;
      }
      
      // Default to general ritual
      router.push('/ritual');
      
    } catch (error) {
      console.error('Mood check error:', error);
      // Fallback: always go to ritual page
      router.push('/ritual');
    }
  };

  if (!sessionId) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-purple-600" />
            <span className="font-semibold text-gray-800">Sahaara</span>
          </div>
          <Link href="/settings" className="p-2 rounded-full hover:bg-gray-100">
            <Settings className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>

      <div className="max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Welcome */}
        <div className="text-center space-y-2 pt-4">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
          <p className="text-gray-600">How are you feeling today?</p>
        </div>

        {/* Quick Mood Check */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Quick Mood Check
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anxiety Level (1-10 scale)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={moodData.stress}
                onChange={(e) => setMoodData(prev => ({ ...prev, stress: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 - Calm</span>
                <span>10 - Very Anxious</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivation Level (1-10 scale)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={moodData.activation}
                onChange={(e) => setMoodData(prev => ({ ...prev, activation: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 - Low Motivation</span>
                <span>10 - High Motivation</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Stress Level (1-10 scale)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={moodData.isolation}
                onChange={(e) => setMoodData(prev => ({ ...prev, isolation: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 - Socially Comfortable</span>
                <span>10 - Socially Stressed</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleMoodCheck}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center"
          >
            <Activity className="w-5 h-5 mr-2" />
            Check & Get Ritual
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link 
            href="/ritual?mode=breathing"
            className="bg-white rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-all"
          >
            <div className="w-8 h-8 mx-auto mb-2 text-2xl">🫁</div>
            <h3 className="font-semibold text-gray-800">Breathing</h3>
            <p className="text-xs text-gray-600 mt-1">4-7-8 technique</p>
          </Link>

          <Link 
            href="/chat"
            className="bg-white rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-all"
          >
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold text-gray-800">AI Chat</h3>
            <p className="text-xs text-gray-600 mt-1">Empathetic support</p>
          </Link>
        </div>

        {/* Featured Stress Relief */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">🎮 Interactive Stress Relief</h3>
              <p className="text-purple-100 text-sm">Pop-it fidget game with satisfying sounds</p>
            </div>
            <Link 
              href="/stress-relief"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium transition-all"
            >
              Play Now
            </Link>
          </div>
        </div>

        {/* Additional Quick Rituals */}
        <div className="grid grid-cols-2 gap-3">
          <Link 
            href="/ritual?mode=energy"
            className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-xl p-4 text-center hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-1">⚡</div>
            <h4 className="text-sm font-medium text-gray-800">Energy</h4>
          </Link>
          
          <Link 
            href="/ritual?mode=connection"
            className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 text-center hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-1">🤝</div>
            <h4 className="text-sm font-medium text-gray-800">Connect</h4>
          </Link>
          
          <Link 
            href="/ritual?mode=grounding"
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 text-center hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-1">🌱</div>
            <h4 className="text-sm font-medium text-gray-800">Ground</h4>
          </Link>

          <Link 
            href="/stress-relief"
            className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 rounded-xl p-4 text-center hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-1">🎮</div>
            <h4 className="text-sm font-medium text-gray-800">Games</h4>
            <p className="text-xs text-gray-600 mt-1">Stress relief</p>
          </Link>
        </div>

        {/* Community & Tools */}
        <div className="grid grid-cols-2 gap-4">
          <Link 
            href="/community"
            className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 text-center hover:shadow-md transition-all"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h4 className="text-sm font-medium text-gray-800">Community</h4>
            <p className="text-xs text-gray-600 mt-1">Anonymous support</p>
          </Link>

          <Link 
            href="/settings"
            className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-100 rounded-xl p-4 text-center hover:shadow-md transition-all"
          >
            <Settings className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-800">Settings</h4>
            <p className="text-xs text-gray-600 mt-1">Privacy & preferences</p>
          </Link>
        </div>

        {/* Today's Insight */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 mb-2">Today&apos;s Insight</h3>
          <div className="space-y-3">
            <div className="bg-white/70 rounded-xl p-4">
              <h4 className="text-sm font-medium text-purple-800 mb-1">Affirmation</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {dailyContent.affirmation}
              </p>
            </div>
            <div className="bg-white/70 rounded-xl p-4">
              <h4 className="text-sm font-medium text-pink-800 mb-1">Today&apos;s Nudge</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {dailyContent.nudge}
              </p>
            </div>
          </div>
        </div>

        {/* Motivation Wall */}
        <MotivationWall />

        {/* Progress & Features Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Your Wellness Journey
          </h2>
          
          {/* Session Stats */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-800 mb-2">Session Progress:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {sessionStats.total_rituals}
                </div>
                <div className="text-gray-600">Rituals Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {Math.floor(sessionStats.total_time / 60)}m
                </div>
                <div className="text-gray-600">Practice Time</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">Anonymous</div>
              <div className="text-sm text-purple-700">Privacy-First</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-pink-600">60-90s</div>
              <div className="text-sm text-pink-700">Micro-Rituals</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">9 Types</div>
              <div className="text-sm text-blue-700">Diverse Practices</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">3 Styles</div>
              <div className="text-sm text-green-700">Evidence-Based</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-800 mb-2">Available Ritual Types:</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <span className="bg-white rounded-full px-3 py-1 text-center text-gray-800">🫁 Breathing</span>
              <span className="bg-white rounded-full px-3 py-1 text-center text-gray-800">🤸 Movement</span>
              <span className="bg-white rounded-full px-3 py-1 text-center text-gray-800">👁️ Visualization</span>
              <span className="bg-white rounded-full px-3 py-1 text-center text-gray-800">💪 Affirmation</span>
              <span className="bg-white rounded-full px-3 py-1 text-center text-gray-800">🛡️ Boundaries</span>
              <span className="bg-white rounded-full px-3 py-1 text-center text-gray-800">🤝 Connection</span>
              <span className="bg-white rounded-full px-3 py-1 text-center text-gray-800">🌱 Grounding</span>
              <span className="bg-white rounded-full px-3 py-1 text-center text-gray-800">⚡ Energy</span>
              <span className="bg-white rounded-full px-3 py-1 text-center text-gray-800">💝 Self-Care</span>
            </div>
          </div>
        </div>

        {/* Crisis Support */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h3 className="font-medium text-red-800 mb-2">Need immediate support?</h3>
          <div className="flex space-x-4 text-sm">
            <a href="tel:1800-599-0019" className="text-red-600 hover:underline">
              Kiran: 1800-599-0019
            </a>
            <a href="tel:9999666555" className="text-red-600 hover:underline">
              Vandrevala: 9999 666 555
            </a>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <h3 className="font-medium text-blue-800 mb-2">Data & Privacy</h3>
          <p className="text-sm text-blue-700 mb-3">Export your data for backup or clear everything for privacy</p>
          <a 
            href="/settings" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Manage Data
          </a>
        </div>
      </div>
    </div>
  );
}
