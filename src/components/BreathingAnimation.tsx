'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BreathingAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number; // in seconds
}

export default function BreathingAnimation({ 
  isActive, 
  onComplete, 
  duration = 60 
}: BreathingAnimationProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const totalCycleTime = 16; // 4 seconds inhale + 7 seconds hold + 8 seconds exhale
    const maxCycles = Math.ceil(duration / totalCycleTime);

    let interval: NodeJS.Timeout;
    let phaseTimeout: NodeJS.Timeout;

    const startPhase = (newPhase: 'inhale' | 'hold' | 'exhale', time: number) => {
      setPhase(newPhase);
      phaseTimeout = setTimeout(() => {
        if (newPhase === 'inhale') {
          startPhase('hold', 7000);
        } else if (newPhase === 'hold') {
          startPhase('exhale', 8000);
        } else {
          setCycleCount(prev => {
            const newCount = prev + 1;
            if (newCount >= maxCycles) {
              onComplete?.();
              return newCount;
            }
            startPhase('inhale', 4000);
            return newCount;
          });
        }
      }, time);
    };

    // Start countdown timer
    // eslint-disable-next-line prefer-const
    interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start breathing cycle
    startPhase('inhale', 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(phaseTimeout);
    };
  }, [isActive, duration, onComplete]);

  const getInstructions = () => {
    switch (phase) {
      case 'inhale':
        return { text: 'Breathe In', subtitle: 'Fill your lungs slowly and deeply' };
      case 'hold':
        return { text: 'Hold', subtitle: 'Keep your breath steady and calm' };
      case 'exhale':
        return { text: 'Breathe Out', subtitle: 'Release slowly through your mouth' };
    }
  };

  const instructions = getInstructions();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      {/* Timer */}
      <div className="mb-8 text-center">
        <div className="text-3xl font-bold text-gray-800">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Cycle {cycleCount + 1} • 4-7-8 Breathing
        </div>
      </div>

      {/* Breathing Circle */}
      <div className="relative mb-8">
        <motion.div
          className="w-64 h-64 rounded-full border-4 border-purple-300 flex items-center justify-center"
          animate={{
            scale: phase === 'inhale' ? 1.3 : phase === 'exhale' ? 0.8 : 1.15,
            borderColor: phase === 'inhale' ? '#8b5cf6' : phase === 'exhale' ? '#ec4899' : '#a855f7'
          }}
          transition={{
            duration: phase === 'inhale' ? 4 : phase === 'hold' ? 0.5 : 8,
            ease: 'easeInOut'
          }}
        >
          <motion.div
            className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
            animate={{
              scale: phase === 'inhale' ? 1.5 : phase === 'exhale' ? 0.6 : 1.2,
              opacity: phase === 'hold' ? 0.9 : 0.7
            }}
            transition={{
              duration: phase === 'inhale' ? 4 : phase === 'hold' ? 0.5 : 8,
              ease: 'easeInOut'
            }}
          />
        </motion.div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-60"
            style={{
              top: '50%',
              left: '50%',
              marginTop: '-4px',
              marginLeft: '-4px'
            }}
            animate={{
              x: phase === 'inhale' ? Math.cos(i * 60 * Math.PI / 180) * 150 : 
                 phase === 'exhale' ? Math.cos(i * 60 * Math.PI / 180) * 50 : 
                 Math.cos(i * 60 * Math.PI / 180) * 120,
              y: phase === 'inhale' ? Math.sin(i * 60 * Math.PI / 180) * 150 : 
                 phase === 'exhale' ? Math.sin(i * 60 * Math.PI / 180) * 50 : 
                 Math.sin(i * 60 * Math.PI / 180) * 120,
              rotate: 360
            }}
            transition={{
              duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : 0.5,
              ease: 'easeInOut',
              rotate: { duration: 20, ease: 'linear', repeat: Infinity }
            }}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="text-center mb-8">
        <motion.h2 
          className="text-2xl font-bold text-gray-800 mb-2"
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {instructions.text}
        </motion.h2>
        <motion.p 
          className="text-gray-600"
          key={`${phase}-subtitle`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {instructions.subtitle}
        </motion.p>
      </div>

      {/* Progress indicator */}
      <div className="w-64 bg-gray-200 rounded-full h-2 mb-4">
        <motion.div
          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${((duration - timeLeft) / duration) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Phase indicators */}
      <div className="flex space-x-4 text-sm">
        <div className={`flex items-center space-x-2 ${phase === 'inhale' ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
          <div className="w-2 h-2 rounded-full bg-current"></div>
          <span>Inhale (4s)</span>
        </div>
        <div className={`flex items-center space-x-2 ${phase === 'hold' ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
          <div className="w-2 h-2 rounded-full bg-current"></div>
          <span>Hold (7s)</span>
        </div>
        <div className={`flex items-center space-x-2 ${phase === 'exhale' ? 'text-pink-600 font-semibold' : 'text-gray-400'}`}>
          <div className="w-2 h-2 rounded-full bg-current"></div>
          <span>Exhale (8s)</span>
        </div>
      </div>
    </div>
  );
}
