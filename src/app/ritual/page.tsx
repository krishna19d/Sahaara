'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Play, Pause, Heart, ArrowLeft, Save, MessageCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { RitualOutput } from '@/types';

const BreathingCircle = ({ isPlaying, phase }: { isPlaying: boolean; phase: 'inhale' | 'exhale' | 'hold' }) => {
  const getScale = () => {
    if (!isPlaying) return 'scale-100';
    switch (phase) {
      case 'inhale': return 'scale-125';
      case 'hold': return 'scale-125';
      case 'exhale': return 'scale-75';
      default: return 'scale-100';
    }
  };

  const getColor = () => {
    switch (phase) {
      case 'inhale': return 'from-blue-400 to-purple-500';
      case 'hold': return 'from-purple-500 to-purple-600';
      case 'exhale': return 'from-purple-500 to-pink-500';
      default: return 'from-purple-400 to-pink-400';
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`w-48 h-48 rounded-full bg-gradient-to-br ${getColor()} 
                   transition-transform duration-4000 ease-in-out ${getScale()}
                   shadow-2xl flex items-center justify-center`}
      >
        <div className="text-white text-center">
          <Heart className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium capitalize">{phase}</p>
        </div>
      </div>
    </div>
  );
};

export default function RitualPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ritual, setRitual] = useState<RitualOutput | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(90);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale' | 'hold'>('inhale');
  const [isComplete, setIsComplete] = useState(false);
  const [userAction, setUserAction] = useState('');
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sahaara_session_id');
    if (!storedSessionId) {
      router.push('/');
      return;
    }
    setSessionId(storedSessionId);
    loadRitual(storedSessionId);
  }, [router]);

  const loadRitual = async (sessionId: string) => {
    try {
      const response = await fetch('/api/generate-ritual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });

      const data = await response.json();
      
      if (data.escalation) {
        router.push(`/crisis?data=${encodeURIComponent(JSON.stringify(data))}`);
        return;
      }

      setRitual(data);
      setTotalTime(data.estimated_duration_seconds || 90);
    } catch (error) {
      console.error('Error loading ritual:', error);
    }
  };

  const startBreathingCycle = () => {
    let phase: 'inhale' | 'hold' | 'exhale' = 'inhale';
    
    const cycle = () => {
      setBreathingPhase(phase);
      
      const nextPhase = () => {
        if (phase === 'inhale') {
          phase = 'hold';
          setTimeout(nextPhase, 1000); // Hold for 1 second
        } else if (phase === 'hold') {
          phase = 'exhale';
          setTimeout(nextPhase, 4000); // Exhale for 4 seconds
        } else {
          phase = 'inhale';
          setTimeout(nextPhase, 4000); // Inhale for 4 seconds
        }
      };
      
      nextPhase();
    };
    
    cycle();
    breathingRef.current = setInterval(cycle, 9000); // Full cycle every 9 seconds
  };

  const stopBreathingCycle = () => {
    if (breathingRef.current) {
      clearInterval(breathingRef.current);
      breathingRef.current = null;
    }
    setBreathingPhase('inhale');
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopBreathingCycle();
    } else {
      // Play
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.play();
      }
      
      // Start timer
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= totalTime) {
            setIsComplete(true);
            setIsPlaying(false);
            setShowSaveOptions(true);
            stopBreathingCycle();
            if (timerRef.current) clearInterval(timerRef.current);
            return totalTime;
          }
          return newTime;
        });
      }, 1000);
      
      startBreathingCycle();
    }
  };

  const saveArtifact = async () => {
    if (!sessionId || !ritual) return;

    try {
      const response = await fetch('/api/save-artifact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          text: ritual.visual_artifact,
          user_action: userAction,
          ritual_type: ritual.tags?.[0] || 'general'
        })
      });

      if (response.ok) {
        setShowSaveOptions(false);
        // Show success feedback
      }
    } catch (error) {
      console.error('Error saving artifact:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!ritual) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600">Preparing your personalized ritual...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Your Ritual</p>
            <p className="text-xs text-gray-500">{formatTime(currentTime)} / {formatTime(totalTime)}</p>
          </div>
          
          <Link href="/chat" className="p-2 rounded-full hover:bg-gray-100">
            <MessageCircle className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(currentTime / totalTime) * 100}%` }}
          />
        </div>

        {/* Breathing Circle */}
        <div className="py-8">
          <BreathingCircle isPlaying={isPlaying} phase={breathingPhase} />
        </div>

        {/* Audio Controls */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="text-center">
            <button
              onClick={togglePlayPause}
              className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-all duration-200 mx-auto"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
          </div>
          
          {ritual.audio_url && (
            <audio
              ref={audioRef}
              src={ritual.audio_url}
              onEnded={() => {
                setIsComplete(true);
                setIsPlaying(false);
                setShowSaveOptions(true);
                stopBreathingCycle();
              }}
            />
          )}
          
          <div className="text-center">
            <p className="text-sm text-gray-600 leading-relaxed">
              {ritual.audio_text}
            </p>
          </div>
        </div>

        {/* Micro Action */}
        {isPlaying && ritual.micro_action_instruction && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Your Micro-Action</h3>
            <p className="text-yellow-700 text-sm mb-3">{ritual.micro_action_instruction}</p>
            <textarea
              className="w-full p-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none h-20 text-sm"
              placeholder="Write your response here..."
              value={userAction}
              onChange={(e) => setUserAction(e.target.value)}
            />
          </div>
        )}

        {/* Completion & Save */}
        {isComplete && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <h3 className="text-lg font-semibold text-green-800">Ritual Complete!</h3>
            
            {ritual.visual_artifact && (
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <p className="text-gray-700 italic">"{ritual.visual_artifact}"</p>
              </div>
            )}
            
            {showSaveOptions && (
              <div className="space-y-3">
                <button
                  onClick={saveArtifact}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 flex items-center justify-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save This Moment
                </button>
                
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                >
                  Continue (Auto-delete)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
