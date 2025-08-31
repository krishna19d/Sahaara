'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface MotivationItem {
  id: string;
  content: string;
  type: 'affirmation' | 'micro-task' | 'quote';
  timestamp: number;
}

export default function MotivationWall() {
  const [motivationItems, setMotivationItems] = useState<MotivationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMotivationContent();
  }, []);

  const loadMotivationContent = async () => {
    try {
      // Check if we have cached content for today
      const today = new Date().toDateString();
      const cachedContent = localStorage.getItem('sahaara_motivation_wall');
      const cachedDate = localStorage.getItem('sahaara_motivation_wall_date');

      if (cachedContent && cachedDate === today) {
        setMotivationItems(JSON.parse(cachedContent));
        return;
      }

      // Generate new motivation content
      const preferences = JSON.parse(localStorage.getItem('sahaara_preferences') || '{}');
      
      const response = await fetch('/api/daily-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPreferences: preferences })
      });

      const data = await response.json();
      
      // Create motivation items
      const newItems: MotivationItem[] = [
        {
          id: `affirmation_${Date.now()}`,
          content: data.affirmation,
          type: 'affirmation',
          timestamp: Date.now()
        },
        {
          id: `task_${Date.now()}`,
          content: data.nudge,
          type: 'micro-task',
          timestamp: Date.now()
        },
        // Add some static inspiring content
        {
          id: `quote_${Date.now()}`,
          content: "Progress, not perfection. Every small step counts.",
          type: 'quote',
          timestamp: Date.now()
        }
      ];

      setMotivationItems(newItems);

      // Cache for today
      localStorage.setItem('sahaara_motivation_wall', JSON.stringify(newItems));
      localStorage.setItem('sahaara_motivation_wall_date', today);

    } catch (error) {
      console.error('Error loading motivation content:', error);
      
      // Fallback content
      const fallbackItems: MotivationItem[] = [
        {
          id: 'fallback1',
          content: 'You have the strength to handle whatever today brings.',
          type: 'affirmation',
          timestamp: Date.now()
        },
        {
          id: 'fallback2',
          content: 'Take three deep breaths when you feel overwhelmed.',
          type: 'micro-task',
          timestamp: Date.now()
        },
        {
          id: 'fallback3',
          content: 'Every challenge is an opportunity to grow stronger.',
          type: 'quote',
          timestamp: Date.now()
        }
      ];
      
      setMotivationItems(fallbackItems);
    }
  };

  const refreshContent = async () => {
    setIsLoading(true);
    
    // Clear cached content to force regeneration
    localStorage.removeItem('sahaara_motivation_wall');
    localStorage.removeItem('sahaara_motivation_wall_date');
    
    await loadMotivationContent();
    setIsLoading(false);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'affirmation':
        return '💪';
      case 'micro-task':
        return '✨';
      case 'quote':
        return '🌟';
      default:
        return '💫';
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'affirmation':
        return 'from-purple-50 to-purple-100 border-purple-200';
      case 'micro-task':
        return 'from-blue-50 to-blue-100 border-blue-200';
      case 'quote':
        return 'from-pink-50 to-pink-100 border-pink-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-yellow-600" />
          Motivation Wall
        </h2>
        <button
          onClick={refreshContent}
          disabled={isLoading}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {motivationItems.map((item) => (
          <div
            key={item.id}
            className={`bg-gradient-to-r ${getItemColor(item.type)} border rounded-xl p-4 transition-all hover:shadow-md`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-lg">{getItemIcon(item.type)}</span>
              <div className="flex-1">
                <p className="text-gray-800 text-sm leading-relaxed">
                  {item.content}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500 capitalize">
                    {item.type.replace('-', ' ')}
                  </span>
                  {item.type === 'micro-task' && (
                    <button className="text-xs bg-white/70 px-2 py-1 rounded-full text-gray-600 hover:bg-white transition-colors">
                      Mark Done ✓
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
        Fresh content generated daily • Tap refresh for new inspiration
      </div>
    </div>
  );
}
