'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw, Heart } from 'lucide-react';

interface Bubble {
  id: number;
  isPopped: boolean;
}

export default function PopItGame() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [score, setScore] = useState(0);
  const [poppedCount, setPoppedCount] = useState(0);
  const [isAllPopped, setIsAllPopped] = useState(false);
  const [animatingBubbles, setAnimatingBubbles] = useState<Set<number>>(new Set());
  const [rippleEffect, setRippleEffect] = useState<{id: number, x: number, y: number} | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastPopTime, setLastPopTime] = useState<number | null>(null);
  const [bonusMultiplier, setBonusMultiplier] = useState(1);
  const [mindfulnessBonus, setMindfulnessBonus] = useState(0);
  const [floatingScore, setFloatingScore] = useState<{points: number, x: number, y: number, type: string} | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize bubbles in a 8x6 grid
  useEffect(() => {
    const initialBubbles: Bubble[] = [];
    for (let i = 0; i < 48; i++) {
      initialBubbles.push({ id: i, isPopped: false });
    }
    setBubbles(initialBubbles);
  }, []);

  // Check if all bubbles are popped
  useEffect(() => {
    if (bubbles.length > 0) {
      const allPopped = bubbles.every(bubble => bubble.isPopped);
      setIsAllPopped(allPopped);
      if (allPopped && poppedCount === bubbles.length) {
        // Celebration effect
        setShowCelebration(true);
        setTimeout(() => {
          if (soundEnabled) {
            playSuccessSound();
          }
        }, 300);
        
        // Hide celebration after 3 seconds
        setTimeout(() => {
          setShowCelebration(false);
        }, 3000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bubbles, poppedCount, soundEnabled]);

  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Create pop sound using Web Audio API with variations
  const playPopSound = (bubbleId?: number) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = initAudioContext();
      
      // Create different sound variations based on bubble position
      const soundVariations = [
        { freq: 200, type: 'sine' as OscillatorType },
        { freq: 250, type: 'triangle' as OscillatorType },
        { freq: 300, type: 'sine' as OscillatorType },
        { freq: 180, type: 'triangle' as OscillatorType },
        { freq: 350, type: 'sine' as OscillatorType }
      ];
      
      const variation = bubbleId !== undefined 
        ? soundVariations[bubbleId % soundVariations.length]
        : soundVariations[Math.floor(Math.random() * soundVariations.length)];
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(variation.freq, audioContext.currentTime);
      oscillator.type = variation.type;
      
      // Add subtle pitch bend for more satisfying pop
      oscillator.frequency.exponentialRampToValueAtTime(
        variation.freq * 0.8, 
        audioContext.currentTime + 0.1
      );
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    } catch {
      console.log('Audio not available');
    }
  };

  // Success sound for completing the grid
  const playSuccessSound = useCallback(() => {
    try {
      const audioContext = initAudioContext();
      const notes = [262, 330, 392, 523]; // C, E, G, C (major chord)
      
      notes.forEach((frequency, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        }, index * 150);
      });
    } catch {
      console.log('Audio not available');
    }
  }, []);

  const popBubble = (id: number) => {
    setBubbles(prev => prev.map(bubble => {
      if (bubble.id === id && !bubble.isPopped) {
        // Add to animating set for enhanced animation
        setAnimatingBubbles(current => new Set(current).add(id));
        
        // Remove from animating set after animation completes
        setTimeout(() => {
          setAnimatingBubbles(current => {
            const newSet = new Set(current);
            newSet.delete(id);
            return newSet;
          });
        }, 600);
        
        // Create ripple effect
        const bubbleElement = document.querySelector(`[data-bubble-id="${id}"]`) as HTMLElement;
        if (bubbleElement) {
          const rect = bubbleElement.getBoundingClientRect();
          const containerRect = bubbleElement.closest('.bubble-container')?.getBoundingClientRect();
          if (containerRect) {
            setRippleEffect({
              id,
              x: rect.left - containerRect.left + rect.width / 2,
              y: rect.top - containerRect.top + rect.height / 2
            });
            
            // Clear ripple effect after animation
            setTimeout(() => setRippleEffect(null), 800);
          }
        }
        
        // Enhanced scoring logic
        const currentTime = Date.now();
        const bubblePoints = 10; // Base points
        let streakBonus = 0;
        let rhythmBonus = 0;
        
        // Streak system: consecutive pops within reasonable time
        if (lastPopTime && currentTime - lastPopTime < 3000) { // 3 seconds
          setStreak(prev => prev + 1);
          if (streak >= 5) {
            streakBonus = Math.min(streak * 2, 20); // Max 20 bonus points
          }
        } else {
          setStreak(1); // Reset streak
        }
        
        // Mindful rhythm bonus: pops at steady, relaxed pace (1.5-3 seconds apart)
        if (lastPopTime) {
          const timeDiff = currentTime - lastPopTime;
          if (timeDiff >= 1500 && timeDiff <= 3000) {
            rhythmBonus = 5;
            setMindfulnessBonus(prev => prev + 5);
          }
        }
        
        // Pattern completion bonus: completing rows/columns
        const row = Math.floor(id / 8);
        const col = id % 8;
        const rowBubbles = Array.from({length: 8}, (_, i) => row * 8 + i);
        const colBubbles = Array.from({length: 6}, (_, i) => i * 8 + col);
        
        let patternBonus = 0;
        const allBubblesAfterPop = prev.map(b => b.id === id ? {...b, isPopped: true} : b);
        
        // Check if row is complete
        if (rowBubbles.every(bubbleId => allBubblesAfterPop.find(b => b.id === bubbleId)?.isPopped)) {
          patternBonus += 25; // Row completion bonus
        }
        
        // Check if column is complete
        if (colBubbles.every(bubbleId => allBubblesAfterPop.find(b => b.id === bubbleId)?.isPopped)) {
          patternBonus += 25; // Column completion bonus
        }
        
        const totalPoints = (bubblePoints + streakBonus + rhythmBonus + patternBonus) * bonusMultiplier;
        
        // Show floating score if bonus points earned
        if (totalPoints > 10) {
          const bubbleElement = document.querySelector(`[data-bubble-id="${id}"]`) as HTMLElement;
          if (bubbleElement) {
            const rect = bubbleElement.getBoundingClientRect();
            const containerRect = bubbleElement.closest('.bubble-container')?.getBoundingClientRect();
            if (containerRect) {
              setFloatingScore({
                points: Math.round(totalPoints - 10), // Show bonus points only
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top,
                type: streakBonus > 0 ? 'streak' : rhythmBonus > 0 ? 'mindful' : 'pattern'
              });
              
              setTimeout(() => setFloatingScore(null), 2000);
            }
          }
        }
        
        setLastPopTime(currentTime);
        playPopSound(id);
        setScore(s => s + Math.round(totalPoints));
        setPoppedCount(c => c + 1);
        
        return { ...bubble, isPopped: true };
      }
      return bubble;
    }));
  };

  const resetGame = () => {
    setBubbles(prev => prev.map(bubble => ({ ...bubble, isPopped: false })));
    setScore(0);
    setPoppedCount(0);
    setIsAllPopped(false);
    setAnimatingBubbles(new Set());
    setRippleEffect(null);
    setShowCelebration(false);
    setStreak(0);
    setLastPopTime(null);
    setBonusMultiplier(1);
    setMindfulnessBonus(0);
    setFloatingScore(null);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <>
      {/* Custom CSS for enhanced animations */}
      <style jsx>{`
        @keyframes slowPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes rippleExpand {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
        
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100px) rotate(180deg); opacity: 0; }
        }
        
        @keyframes scoreFloat {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-40px) scale(0.8); opacity: 0; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .bubble-hover:hover {
          animation: slowPulse 1.5s ease-in-out infinite;
        }
        
        .bubble-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
        
        .bubble-pop {
          animation: gentleBounce 0.6s ease-out;
        }
        
        .celebration-float {
          animation: floatUp 3s ease-out forwards;
        }
        
        .score-float {
          animation: scoreFloat 2s ease-out forwards;
        }
        
        .ripple-animation {
          animation: rippleExpand 0.8s ease-out;
        }
        
        .shimmer-effect {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-1 {
          animation-delay: 1s;
        }
        
        .animation-delay-2 {
          animation-delay: 2s;
        }
        
        .animation-delay-3 {
          animation-delay: 3s;
        }
        
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 relative">
        {/* Floating celebration particles */}
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-3 h-3 rounded-full celebration-float`}
                style={{
                  backgroundColor: ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl animate-bounce">🎉</div>
            </div>
          </div>
        )}
        
        <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🫧 Pop-It Stress Relief
          </h1>
          <p className="text-gray-600 text-sm">
            Pop all the bubbles to relax and unwind
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-4 glass-effect rounded-lg p-3 shadow-sm border border-white/20">
          <div className="text-sm">
            <span className="font-semibold text-purple-600">Score: {score}</span>
            <span className="text-gray-500 ml-2">({poppedCount}/{bubbles.length})</span>
            {streak > 1 && (
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                🔥 {streak} streak
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-full bg-purple-100/80 hover:bg-purple-200/80 transition-all duration-200 hover:scale-105 active:scale-95"
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-purple-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            <button
              onClick={resetGame}
              className="p-2 rounded-full bg-purple-100/80 hover:bg-purple-200/80 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Reset game"
            >
              <RotateCcw className="w-4 h-4 text-purple-600" />
            </button>
          </div>
        </div>

        {/* Bonus Display */}
        {(streak > 1 || mindfulnessBonus > 0) && (
          <div className="mb-4 glass-effect rounded-lg p-3 shadow-sm border border-white/20">
            <div className="text-xs text-gray-600 mb-2">Active Bonuses:</div>
            <div className="flex gap-2 flex-wrap">
              {streak > 1 && (
                <div className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  🔥 Streak: +{Math.min(streak * 2, 20)} pts
                </div>
              )}
              {mindfulnessBonus > 0 && (
                <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  🧘 Mindful: +{mindfulnessBonus} pts
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {isAllPopped && (
          <div className="glass-effect rounded-lg p-4 mb-4 text-center border border-green-200/50 animate-pulse">
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2 animate-bounce" />
            <p className="text-green-700 font-semibold">
              🎉 Amazing! You popped them all!
            </p>
            <p className="text-green-600 text-sm mt-1">
              Take a deep breath. You&apos;ve earned this moment of calm.
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pop-It Grid */}
        <div className="bg-white rounded-2xl p-6 shadow-lg relative bubble-container overflow-hidden">
          {/* Floating Score Display */}
          {floatingScore && (
            <div
              className="absolute pointer-events-none z-20 score-float"
              style={{
                left: floatingScore.x,
                top: floatingScore.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className={`
                px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg
                ${floatingScore.type === 'streak' ? 'bg-orange-500' : 
                  floatingScore.type === 'mindful' ? 'bg-blue-500' : 'bg-green-500'}
              `}>
                +{floatingScore.points}
              </div>
            </div>
          )}
          
          {/* Ripple Effect */}
          {rippleEffect && (
            <div
              className="absolute pointer-events-none z-10"
              style={{
                left: rippleEffect.x,
                top: rippleEffect.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-8 h-8 border-2 border-purple-400 rounded-full ripple-animation"></div>
              <div className="absolute inset-0 w-12 h-12 border border-pink-300 rounded-full ripple-animation animation-delay-200"></div>
              <div className="absolute inset-0 w-6 h-6 bg-purple-200 rounded-full animate-pulse opacity-50"></div>
            </div>
          )}
          
          <div className="grid grid-cols-8 gap-2 relative">
            {bubbles.map((bubble) => {
              const isAnimating = animatingBubbles.has(bubble.id);
              return (
                <button
                  key={bubble.id}
                  data-bubble-id={bubble.id}
                  onClick={() => popBubble(bubble.id)}
                  disabled={bubble.isPopped}
                  className={`
                    aspect-square rounded-full border-2 transition-all duration-300 transform relative overflow-hidden
                    ${bubble.isPopped 
                      ? 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 scale-90 shadow-inner' 
                      : 'bg-gradient-to-br from-pink-400 via-purple-400 to-purple-500 border-purple-400 shadow-lg hover:scale-110 active:scale-95 hover:shadow-xl bubble-hover bubble-breathe'
                    }
                    ${isAnimating ? 'bubble-pop' : ''}
                    ${!bubble.isPopped && 'hover:rotate-1 active:rotate-0'}
                  `}
                  style={{
                    boxShadow: bubble.isPopped 
                      ? 'inset 0 3px 6px rgba(0,0,0,0.15), inset 0 1px 2px rgba(0,0,0,0.1)' 
                      : '0 6px 12px rgba(168, 85, 247, 0.4), 0 2px 4px rgba(168, 85, 247, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s ease-out',
                    animationDelay: `${(bubble.id % 8) * 0.1}s` // Stagger breathing animation
                  }}
                >
                  {/* Inner bubble with gradient */}
                  <div className={`
                    w-full h-full rounded-full transition-all duration-300 relative overflow-hidden
                    ${bubble.isPopped 
                      ? 'bg-gradient-to-br from-purple-200 to-purple-300 shadow-inner scale-95' 
                      : 'bg-gradient-to-br from-pink-300 via-purple-300 to-purple-400 shadow-sm'
                    }
                  `}>
                    {/* Shine effect for unpopped bubbles */}
                    {!bubble.isPopped && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent rounded-full"></div>
                        <div className="absolute inset-0 shimmer-effect rounded-full" 
                             style={{ animationDelay: `${(bubble.id % 5) * 0.5}s` }}></div>
                      </>
                    )}
                    
                    {/* Pop animation spark */}
                    {isAnimating && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                        <div className="absolute w-1 h-1 bg-white rounded-full animate-bounce"></div>
                      </div>
                    )}
                    
                    {/* Concentric circles for depth */}
                    {!bubble.isPopped && (
                      <>
                        <div className="absolute inset-2 bg-gradient-to-br from-pink-200/50 to-purple-300/50 rounded-full"></div>
                        <div className="absolute inset-3 bg-gradient-to-br from-pink-100/30 to-purple-200/30 rounded-full"></div>
                      </>
                    )}
                    
                    {/* Popped state indentation */}
                    {bubble.isPopped && (
                      <div className="absolute inset-1 bg-gradient-to-tl from-purple-300 to-purple-200 rounded-full shadow-inner"></div>
                    )}
                  </div>
                  
                  {/* Hover glow effect */}
                  {!bubble.isPopped && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-300/20 to-purple-400/20 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Breathing Instructions */}
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
            🫁 Mindful Popping
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            As you pop each bubble, take a slow, deep breath. Let the satisfying sound 
            and tactile sensation help release your stress. Focus on the present moment.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-purple-600">{score}</div>
            <div className="text-xs text-gray-500">Total Score</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-blue-600">{poppedCount}</div>
            <div className="text-xs text-gray-500">Bubbles Popped</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-green-600">
              {Math.round((poppedCount / bubbles.length) * 100) || 0}%
            </div>
            <div className="text-xs text-gray-500">Progress</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-orange-600">{streak}</div>
            <div className="text-xs text-gray-500">Best Streak</div>
          </div>
        </div>

        {/* Scoring Guide */}
        <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2 text-sm">💫 Scoring System</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Base pop:</span>
              <span className="font-medium">+10 pts</span>
            </div>
            <div className="flex justify-between">
              <span>Mindful rhythm (1.5-3s):</span>
              <span className="font-medium text-blue-600">+5 pts</span>
            </div>
            <div className="flex justify-between">
              <span>Streak bonus (5+):</span>
              <span className="font-medium text-orange-600">+2-20 pts</span>
            </div>
            <div className="flex justify-between">
              <span>Row/Column complete:</span>
              <span className="font-medium text-green-600">+25 pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
