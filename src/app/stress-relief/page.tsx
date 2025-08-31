'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Gamepad2, Brain, Heart } from 'lucide-react';
import PopItGame from '@/components/PopItGame';

export default function StressReliefPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    {
      id: 'popit',
      title: 'Pop-It Fidget',
      description: 'Pop bubbles with satisfying sounds to release stress and anxiety',
      icon: '🫧',
      component: PopItGame,
      benefits: ['Reduces anxiety', 'Improves focus', 'Tactile satisfaction'],
      duration: '2-5 minutes'
    }
  ];

  if (activeGame) {
    const game = games.find(g => g.id === activeGame);
    if (game) {
      const GameComponent = game.component;
      return (
        <div className="min-h-screen">
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => setActiveGame(null)}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Games</span>
            </button>
          </div>
          <GameComponent />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link 
            href="/dashboard"
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Stress Relief Games</h1>
            <p className="text-gray-600 text-sm">Interactive activities for mental wellness</p>
          </div>
        </div>

        {/* Benefits Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 mb-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5" />
            <h2 className="font-semibold">Why Gaming Helps</h2>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            Interactive games provide immediate stress relief through focused attention, 
            sensory satisfaction, and positive feedback loops that calm your nervous system.
          </p>
        </div>

        {/* Games Grid */}
        <div className="space-y-4">
          {games.map((game) => (
            <div key={game.id} className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{game.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{game.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{game.description}</p>
                  
                  {/* Benefits Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {game.benefits.map((benefit, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                  
                  {/* Duration */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      ⏱️ {game.duration}
                    </span>
                    
                    <button
                      onClick={() => setActiveGame(game.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      <Play className="w-4 h-4" />
                      Play Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <Gamepad2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-600 mb-1">More Games Coming Soon</h3>
            <p className="text-gray-500 text-sm">
              Breathing exercises, puzzle games, and mindfulness activities
            </p>
          </div>
        </div>

        {/* Mental Health Note */}
        <div className="mt-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-start gap-2">
            <Heart className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-1">Wellness Reminder</h4>
              <p className="text-green-700 text-sm leading-relaxed">
                These games are designed to provide momentary stress relief. For ongoing mental 
                health support, consider speaking with a counselor or therapist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
