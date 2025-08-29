'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Activity, MessageCircle, Settings, Play, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [moodData, setMoodData] = useState({
    stress: 0.5,
    activation: 0.5,
    isolation: 0.5
  });

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sahaara_session_id');
    if (!storedSessionId) {
      router.push('/');
      return;
    }
    setSessionId(storedSessionId);
  }, [router]);

  const handleMoodCheck = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/mood-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          stress: moodData.stress,
          activation: moodData.activation,
          isolation: moodData.isolation
        })
      });

      const data = await response.json();
      
      if (data.trigger_ritual) {
        router.push(`/ritual?ritual_id=${data.ritual_id}`);
      } else {
        // Show feedback that no ritual needed right now
        alert('You seem to be doing well right now! Feel free to try again later or explore other features.');
      }
    } catch (error) {
      console.error('Mood check error:', error);
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
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-purple-600" />
            <span className="font-semibold text-gray-800">Sahaara</span>
          </div>
          <Link href="/settings" className="p-2 rounded-full hover:bg-gray-100">
            <Settings className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
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
                Stress Level
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
                <span>Calm</span>
                <span>Very Stressed</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Energy Level
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
                <span>Low Energy</span>
                <span>High Energy</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection to Others
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={1 - moodData.isolation}
                onChange={(e) => setMoodData(prev => ({ ...prev, isolation: 1 - parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Isolated</span>
                <span>Connected</span>
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
            href="/ritual?mode=quick"
            className="bg-white rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-all"
          >
            <Play className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold text-gray-800">Quick Ritual</h3>
            <p className="text-xs text-gray-600 mt-1">60-90 second session</p>
          </Link>

          <Link 
            href="/chat"
            className="bg-white rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-all"
          >
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Chat</h3>
            <p className="text-xs text-gray-600 mt-1">Free conversation</p>
          </Link>
        </div>

        {/* Today's Insight */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Today's Insight</h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            Remember: Small, consistent actions create lasting change. 
            Every moment of mindfulness is a step towards greater clarity.
          </p>
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
      </div>
    </div>
  );
}
