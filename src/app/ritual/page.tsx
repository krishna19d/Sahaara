'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Play, Pause, Heart, ArrowLeft, Save, MessageCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { RitualOutput } from '@/types';
import BreathingAnimation from '@/components/BreathingAnimation';

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
                   transition-transform duration-[3000ms] ease-in-out ${getScale()}
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

function RitualContent() {
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
  const [isBreathingMode, setIsBreathingMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathingTimeouts = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sahaara_session_id');
    if (!storedSessionId) {
      router.push('/');
      return;
    }
    setSessionId(storedSessionId);
    
    // Check if this is breathing mode
    const mode = searchParams.get('mode');
    if (mode === 'breathing') {
      setIsBreathingMode(true);
      setTotalTime(120); // 2 minutes for breathing exercise
      const breathingRitual: RitualOutput = {
        escalation: false,
        audio_text: "Find a comfortable position and focus on your breath. We'll practice the 4-7-8 breathing technique together. Breathe in for 4 counts, hold for 7, and exhale for 8. Let this rhythm calm your nervous system and bring you peace.",
        micro_action_instruction: "Notice how you feel after completing this breathing exercise",
        estimated_duration_seconds: 120,
        confidence_score: 0.9,
        tags: ['breathing', 'anxiety-relief', 'calm']
      };
      setRitual(breathingRitual);
    } else if (mode === 'energy') {
      // Energy activation ritual
      const energyRitual: RitualOutput = {
        escalation: false,
        audio_text: "Your body holds amazing potential for energy and vitality. Start by gently rolling your shoulders and releasing any tension. Think about something that usually brings you joy. That spark is still within you - even when it feels dim. Take energizing breaths and imagine renewed energy flowing back into your body, one breath at a time.",
        micro_action_instruction: "Do 5 gentle shoulder rolls or take 3 steps toward something that brings you joy",
        estimated_duration_seconds: 90,
        confidence_score: 0.85,
        tags: ['energy', 'activation', 'movement']
      };
      setRitual(energyRitual);
    } else if (mode === 'connection') {
      // Connection and support ritual
      const connectionRitual: RitualOutput = {
        escalation: false,
        audio_text: "Think of someone who makes you feel valued and understood - it could be a friend, family member, or even a pet. Feel their care for you, even when they're not physically present. You are worthy of healthy, loving connections. Breathe in belonging, breathe out isolation. Your people are out there, and some may already be in your life.",
        micro_action_instruction: "Send a kind message to someone you care about, or write down the name of someone who supports you",
        estimated_duration_seconds: 90,
        confidence_score: 0.85,
        tags: ['connection', 'support', 'belonging']
      };
      setRitual(connectionRitual);
    } else if (mode === 'grounding') {
      // Grounding and stability ritual
      const groundingRitual: RitualOutput = {
        escalation: false,
        audio_text: "Feel your feet connected to the ground beneath you. You are safe and supported right here, right now. Notice three things you can see, two things you can hear, and one thing you can touch. This moment is real, you are present, and you have the strength to handle whatever comes next.",
        micro_action_instruction: "Name three things around you that make you feel safe or comfortable",
        estimated_duration_seconds: 90,
        confidence_score: 0.85,
        tags: ['grounding', 'presence', 'safety']
      };
      setRitual(groundingRitual);
    } else {
      loadRitual(storedSessionId);
    }
  }, [router, searchParams]);

  const loadRitual = async (sessionId: string) => {
    try {
      // Since we're in static export mode, generate ritual client-side
      console.log('Loading ritual for session:', sessionId);
      
      // Get stored preferences and mood data
      const preferences = JSON.parse(localStorage.getItem('sahaara_preferences') || '{}');
      const currentMood = JSON.parse(localStorage.getItem('sahaara_current_mood') || '{}');
      
      // Enhanced archetype classification based on mood
      let archetype = 'performance_anxiety'; // default
      if (currentMood.activation < 0.4) {
        archetype = 'activation_deficit';
      } else if (currentMood.isolation > 0.6) {
        archetype = 'interpersonal_distress';
      } else if (currentMood.stress > 0.7) {
        archetype = 'performance_anxiety';
      }
      
      // Generate diverse ritual content based on archetype and preferences
      const generatePersonalizedRitual = () => {
        const safePlace = preferences.safe_place || 'a peaceful place';
        const dream = preferences.dream || 'your goals';
        const hobbies = preferences.hobbies || [];
        const favoriteHobby = hobbies.length > 0 ? hobbies[0] : 'something you enjoy';
        
        const ritualTypes = {
          performance_anxiety: [
            {
              type: 'grounding',
              audio_text: `Imagine yourself in ${safePlace}. Feel your feet firmly planted on the ground. You are exactly where you need to be. Take three deep breaths and remind yourself: "I have prepared for this moment. I trust in my abilities. I am ready to shine." Visualize yourself succeeding and feeling proud of your accomplishment.`,
              micro_action: "Write down one thing you're prepared for today",
              tags: ['confidence', 'grounding', 'visualization']
            },
            {
              type: 'energy_centering',
              audio_text: `Place your hands on your heart and feel its strong, steady rhythm. This is your inner power source. Breathe confidence into your chest with each inhale. As you exhale, release the pressure to be perfect. You are enough, exactly as you are. Channel this energy toward ${dream}.`,
              micro_action: "State one personal strength out loud",
              tags: ['self-compassion', 'heart-centering', 'affirmation']
            },
            {
              type: 'achievement_visualization',
              audio_text: `Close your eyes and picture yourself after successfully completing your challenge. How does it feel? What do you see around you? Hold onto this feeling of accomplishment. You have overcome difficulties before, and you will again. Trust in your journey toward ${dream}.`,
              micro_action: "Visualize your success for 30 seconds",
              tags: ['visualization', 'success', 'motivation']
            }
          ],
          
          activation_deficit: [
            {
              type: 'energy_awakening',
              audio_text: `Your body holds amazing potential for energy and joy. Start by gently moving your shoulders, releasing any heaviness you're carrying. Think about ${favoriteHobby} and how it makes you feel alive. That spark is still within you. Take energizing breaths and imagine vitality flowing back into your body, one breath at a time.`,
              micro_action: "Do 5 gentle shoulder rolls or stretches",
              tags: ['movement', 'energy', 'body-awareness']
            },
            {
              type: 'purpose_connection',
              audio_text: `Remember ${dream}? That dream exists because something in you knows it's possible. Even when energy feels low, your purpose remains strong. Breathe life into that dream now. You don't need to climb the whole mountain today - just take one small step forward.`,
              micro_action: "Write one tiny step toward your dream",
              tags: ['purpose', 'motivation', 'goal-setting']
            },
            {
              type: 'gentle_activation',
              audio_text: `Sometimes rest is action, and small movements are victories. Honor where you are right now. Gently stretch your arms toward the sky, inviting energy in. You don't have to force anything. Just be open to the possibility that energy can return, slowly and gently, like sunrise.`,
              micro_action: "Take 3 steps outside or toward a window",
              tags: ['gentleness', 'movement', 'patience']
            }
          ],
          
          interpersonal_distress: [
            {
              type: 'heart_healing',
              audio_text: `Place your hand on your heart and offer yourself the same kindness you'd give a good friend. Relationships can be challenging, but you deserve love and understanding. Breathe compassion into your heart space. Remember: you can't control others, but you can choose how you respond with love.`,
              micro_action: "Send yourself one kind message",
              tags: ['self-compassion', 'heart-healing', 'relationships']
            },
            {
              type: 'boundary_strength',
              audio_text: `Imagine yourself surrounded by a gentle, protective light. This light allows love in and keeps harm out. You have the right to set boundaries that protect your peace. Breathe strength into your core. You can be kind AND protect your energy at the same time.`,
              micro_action: "Set one small boundary for yourself today",
              tags: ['boundaries', 'protection', 'self-respect']
            },
            {
              type: 'connection_healing',
              audio_text: `Think of someone who makes you feel valued and understood. Feel their support even when they're not physically present. You are worthy of healthy, loving connections. Breathe in belonging, breathe out isolation. Your people are out there, and some may already be in your life.`,
              micro_action: "Reach out to one person who cares about you",
              tags: ['connection', 'support', 'belonging']
            }
          ]
        };
        
        // Select random ritual type for variety
        const archetypeRituals = ritualTypes[archetype as keyof typeof ritualTypes];
        const selectedRitual = archetypeRituals[Math.floor(Math.random() * archetypeRituals.length)];
        
        return selectedRitual;
      };
      
      const personalizedRitual = generatePersonalizedRitual();
      
      const ritualData: RitualOutput = {
        escalation: false,
        audio_text: personalizedRitual.audio_text,
        micro_action_instruction: personalizedRitual.micro_action,
        estimated_duration_seconds: 90,
        confidence_score: 0.85,
        tags: personalizedRitual.tags,
        // For demo purposes, generate a placeholder audio URL based on ritual type
        audio_url: `data:audio/wav;base64,` // Placeholder for TTS-generated audio
      };
      
      setRitual(ritualData);
      setTotalTime(ritualData.estimated_duration_seconds || 90);
      
    } catch (error) {
      console.error('Error loading ritual:', error);
      // Fallback ritual
      const fallbackRitual: RitualOutput = {
        escalation: false,
        audio_text: "Take a comfortable seat and focus on your breath. Inhale peace and calm, exhale any tension or worry. Allow yourself this moment of stillness and presence.",
        micro_action_instruction: "Take three conscious breaths",
        estimated_duration_seconds: 90,
        confidence_score: 0.7,
        tags: ['breathing', 'mindfulness']
      };
      setRitual(fallbackRitual);
      setTotalTime(90);
    }
  };

  const startBreathingCycle = () => {
    const cycle = () => {
      // Clear any existing timeouts
      breathingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      breathingTimeouts.current = [];
      
      // Start with inhale phase
      setBreathingPhase('inhale');
      
      // After 4 seconds, switch to hold
      const holdTimeout = setTimeout(() => {
        setBreathingPhase('hold');
        
        // After 7 seconds, switch to exhale
        const exhaleTimeout = setTimeout(() => {
          setBreathingPhase('exhale');
          
          // After 8 seconds, restart cycle
          const restartTimeout = setTimeout(() => {
            cycle(); // Restart the cycle
          }, 8000); // Exhale for 8 seconds
          
          breathingTimeouts.current.push(restartTimeout);
        }, 7000); // Hold for 7 seconds
        
        breathingTimeouts.current.push(exhaleTimeout);
      }, 4000); // Inhale for 4 seconds
      
      breathingTimeouts.current.push(holdTimeout);
    };
    
    cycle(); // Start the first cycle
  };

  const stopBreathingCycle = () => {
    breathingTimeouts.current.forEach(timeout => clearTimeout(timeout));
    breathingTimeouts.current = [];
    setBreathingPhase('inhale');
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      
      // Pause TTS if supported
      if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.pause();
      }
      
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
      
      // Use TTS for audio_text if available, otherwise fallback to audio file
      if (ritual?.audio_text && typeof speechSynthesis !== 'undefined') {
        // Cancel any existing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(ritual.audio_text);
        utterance.rate = 0.8; // Slower for mindfulness
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        
        // Try to use Indian English voice if available
        const voices = speechSynthesis.getVoices();
        const indianVoice = voices.find(voice => 
          voice.lang === 'en-IN' || voice.name.includes('Indian')
        ) || voices.find(voice => voice.lang.startsWith('en'));
        
        if (indianVoice) {
          utterance.voice = indianVoice;
        }

        utterance.onend = () => {
          if (currentTime >= totalTime) {
            setIsComplete(true);
            setIsPlaying(false);
            setShowSaveOptions(true);
            stopBreathingCycle();
            if (timerRef.current) clearInterval(timerRef.current);
          }
        };

        utterance.onerror = (error) => {
          console.error('TTS error:', error);
          // Fallback to audio file or continue silently
          if (audioRef.current) {
            audioRef.current.play();
          }
        };

        speechSynthesis.speak(utterance);
      } else if (audioRef.current) {
        // Fallback to audio file
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
      
      // Only start breathing cycle for breathing-based rituals
      if (ritual?.tags?.includes('breathing') || ritual?.tags?.includes('heart-centering')) {
        startBreathingCycle();
      }
    }
  };

  const saveArtifact = async () => {
    if (!sessionId || !ritual) return;

    try {
      // Since we're in static export mode, save artifact locally
      const artifact = {
        session_id: sessionId,
        ritual_type: ritual.tags?.[0] || 'general',
        user_action: userAction,
        text: ritual.visual_artifact,
        completed_at: new Date().toISOString(),
        duration: currentTime
      };

      // Save to local storage for demo
      const existingArtifacts = JSON.parse(localStorage.getItem('sahaara_artifacts') || '[]');
      existingArtifacts.push(artifact);
      localStorage.setItem('sahaara_artifacts', JSON.stringify(existingArtifacts));

      // Update session stats
      const sessionStats = JSON.parse(localStorage.getItem('sahaara_session_stats') || '{}');
      sessionStats.total_rituals = (sessionStats.total_rituals || 0) + 1;
      sessionStats.total_time = (sessionStats.total_time || 0) + currentTime;
      sessionStats.last_ritual = new Date().toISOString();
      localStorage.setItem('sahaara_session_stats', JSON.stringify(sessionStats));

      setShowSaveOptions(false);
      
      // Show success feedback with tracking info
      alert(`Ritual saved! This is your ${sessionStats.total_rituals} ritual this session. Total practice time: ${Math.floor(sessionStats.total_time / 60)}m ${sessionStats.total_time % 60}s`);
      
    } catch (error) {
      console.error('Error saving artifact:', error);
      alert('Artifact saved locally for privacy!');
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

  // If this is breathing mode, show the full-screen breathing animation
  if (isBreathingMode) {
    return (
      <div>
        {/* Header for breathing mode */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">4-7-8 Breathing</p>
              <p className="text-xs text-gray-500">Anxiety Relief</p>
            </div>
            
            <Link href="/chat" className="p-2 rounded-full hover:bg-gray-100">
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>

        <BreathingAnimation 
          isActive={isPlaying || true} // Auto-start breathing animation
          onComplete={() => {
            setIsComplete(true);
            setShowSaveOptions(true);
          }}
          duration={totalTime}
        />

        {/* Completion overlay */}
        {isComplete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800">Great job!</h3>
              <p className="text-gray-600 text-sm">
                You completed the 4-7-8 breathing exercise. How do you feel now?
              </p>
              
              <textarea
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-20 text-sm text-gray-900 placeholder-gray-500"
                placeholder="Describe how you feel after this exercise..."
                value={userAction}
                onChange={(e) => setUserAction(e.target.value)}
              />
              
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
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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

      <div className="max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto p-4 lg:p-8">
        {/* Main Content Layout for Larger Screens */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
          
          {/* Left Column: Breathing Circle and Controls */}
          <div className="space-y-6">
            
            {/* Session & Archetype Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {ritual.tags?.join(', ') || 'Wellness Ritual'}
                </div>
                <div className="text-xs text-gray-500">Session #{sessionId?.slice(-6)}</div>
              </div>
              <div className="text-xs text-gray-500">
                Personalized for your mood & preferences • {totalTime}s experience
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(currentTime / totalTime) * 100}%` }}
              />
            </div>

            {/* Ritual Visual - Show breathing circle only for breathing-based rituals */}
            <div className="py-8 flex justify-center">
              {ritual.tags?.includes('breathing') || ritual.tags?.includes('heart-centering') ? (
                <BreathingCircle isPlaying={isPlaying} phase={breathingPhase} />
              ) : (
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 shadow-2xl flex items-center justify-center">
                  <div className="text-white text-center">
                    {ritual.tags?.includes('movement') && <div className="text-6xl mb-2">🤸</div>}
                    {ritual.tags?.includes('visualization') && <div className="text-6xl mb-2">👁️</div>}
                    {ritual.tags?.includes('affirmation') && <div className="text-6xl mb-2">💪</div>}
                    {ritual.tags?.includes('boundaries') && <div className="text-6xl mb-2">🛡️</div>}
                    {ritual.tags?.includes('connection') && <div className="text-6xl mb-2">🤝</div>}
                    {ritual.tags?.includes('grounding') && <div className="text-6xl mb-2">🌱</div>}
                    {ritual.tags?.includes('energy') && <div className="text-6xl mb-2">⚡</div>}
                    {ritual.tags?.includes('self-compassion') && <div className="text-6xl mb-2">💝</div>}
                    {(!ritual.tags || ritual.tags.length === 0) && <Heart className="w-12 h-12 mb-2" />}
                    <p className="text-sm font-medium">
                      {ritual.tags?.includes('movement') && 'Movement'}
                      {ritual.tags?.includes('visualization') && 'Visualize'}
                      {ritual.tags?.includes('affirmation') && 'Affirm'}
                      {ritual.tags?.includes('boundaries') && 'Protect'}
                      {ritual.tags?.includes('connection') && 'Connect'}
                      {ritual.tags?.includes('grounding') && 'Ground'}
                      {ritual.tags?.includes('energy') && 'Energize'}
                      {ritual.tags?.includes('self-compassion') && 'Love'}
                      {(!ritual.tags || ritual.tags.length === 0) && 'Reflect'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Audio Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-center mb-4">
                <button
                  onClick={togglePlayPause}
                  className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-all duration-200 mx-auto"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                
                {/* Audio Status Indicator */}
                <div className="mt-2 text-xs text-gray-600">
                  {isPlaying ? (
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Audio + Visual Sync</span>
                    </div>
                  ) : (
                    <span>Press to start guided experience</span>
                  )}
                </div>
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
            </div>
          </div>

          {/* Right Column: Ritual Content and Actions */}
          <div className="space-y-6">
            {/* Ritual Text */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
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
                  className="w-full p-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none h-20 text-sm text-gray-900 placeholder-gray-500"
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
                
                {/* Session Progress */}
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <div className="text-sm text-gray-600 mb-2">Session Progress</div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-medium text-green-700">Duration</div>
                      <div className="text-gray-600">{formatTime(currentTime)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-700">Type</div>
                      <div className="text-gray-600">{ritual.tags?.[0] || 'Wellness'}</div>
                    </div>
                  </div>
                </div>
                
                {ritual.visual_artifact && (
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <p className="text-gray-700 italic">&quot;{ritual.visual_artifact}&quot;</p>
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
      </div>
    </div>
  );
}

export default function RitualPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    }>
      <RitualContent />
    </Suspense>
  );
}
