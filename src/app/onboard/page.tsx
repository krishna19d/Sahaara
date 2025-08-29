'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPreferences, ConsentFlags } from '@/types';

const MOOD_OPTIONS = ['Calm', 'Uneasy', 'Stressed', 'Panicked', 'Numb'];
const HOBBY_OPTIONS = ['sketching', 'music', 'reading', 'sports', 'coding', 'cooking', 'dancing', 'writing'];
const SAFE_PLACE_OPTIONS = ['bedroom', 'rooftop', 'park', 'library', 'home', 'garden', 'café'];
const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    delivery: { language: 'en', voice: 'friendly-peer', tts: true }
  });
  const [consent, setConsent] = useState<ConsentFlags>({
    sensors: false,
    retention: 'session-only',
    tts: true
  });

  const steps = [
    {
      title: "Why did you open Sahaara today?",
      field: 'why',
      type: 'text',
      placeholder: "e.g., feeling stressed about exams..."
    },
    {
      title: "How are you feeling right now?",
      field: 'mood',
      type: 'chips',
      options: MOOD_OPTIONS
    },
    {
      title: "What's your favorite movie and why?",
      field: 'movie',
      type: 'textpair',
      placeholders: ["Movie title", "What you love about it"]
    },
    {
      title: "Favorite song and how it makes you feel?",
      field: 'song',
      type: 'textpair',
      placeholders: ["Song title", "Feeling it gives you"]
    },
    {
      title: "Pick your top 3 hobbies",
      field: 'hobbies',
      type: 'multichips',
      options: HOBBY_OPTIONS,
      max: 3
    },
    {
      title: "Where do you feel most safe?",
      field: 'safe_place',
      type: 'chips',
      options: SAFE_PLACE_OPTIONS
    },
    {
      title: "What's one big dream you have?",
      field: 'dream',
      type: 'text',
      placeholder: "e.g., study abroad, start a business..."
    },
    {
      title: "What are your top 3 current problems?",
      field: 'problems',
      type: 'multitext',
      max: 3,
      placeholder: "e.g., exam stress, sleep issues..."
    },
    {
      title: "Language & Privacy Settings",
      field: 'consent',
      type: 'settings'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          consent
        })
      });
      
      const data = await response.json();
      
      if (data.session_id) {
        localStorage.setItem('sahaara_session_id', data.session_id);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  const updatePreferences = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateConsent = (field: string, value: any) => {
    setConsent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStepComplete = () => {
    const step = steps[currentStep];
    if (step.field === 'consent') return true;
    
    const value = (preferences as any)[step.field];
    if (!value) return false;
    
    if (step.type === 'textpair') {
      return value.title && value.reason;
    }
    if (step.type === 'multichips' || step.type === 'multitext') {
      return Array.isArray(value) && value.length > 0;
    }
    return true;
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.type) {
      case 'text':
        return (
          <textarea
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-32"
            placeholder={step.placeholder}
            value={(preferences as any)[step.field] || ''}
            onChange={(e) => updatePreferences(step.field, e.target.value)}
          />
        );

      case 'chips':
        return (
          <div className="grid grid-cols-2 gap-3">
            {step.options?.map((option) => (
              <button
                key={option}
                className={`p-3 rounded-xl border-2 transition-all ${
                  (preferences as any)[step.field] === option
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updatePreferences(step.field, option)}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'multichips':
        const selectedHobbies = (preferences as any)[step.field] || [];
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {step.options?.map((option) => (
                <button
                  key={option}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedHobbies.includes(option)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    const current = selectedHobbies;
                    if (current.includes(option)) {
                      updatePreferences(step.field, current.filter((h: string) => h !== option));
                    } else if (current.length < (step.max || 3)) {
                      updatePreferences(step.field, [...current, option]);
                    }
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center">
              Selected: {selectedHobbies.length}/{step.max || 3}
            </p>
          </div>
        );

      case 'textpair':
        const pairValue = (preferences as any)[step.field] || {};
        return (
          <div className="space-y-4">
            <input
              type="text"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={step.placeholders?.[0]}
              value={pairValue.title || ''}
              onChange={(e) => updatePreferences(step.field, { ...pairValue, title: e.target.value })}
            />
            <input
              type="text"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={step.placeholders?.[1]}
              value={pairValue.reason || ''}
              onChange={(e) => updatePreferences(step.field, { ...pairValue, reason: e.target.value })}
            />
          </div>
        );

      case 'multitext':
        const problems = (preferences as any)[step.field] || [''];
        return (
          <div className="space-y-3">
            {problems.map((problem: string, index: number) => (
              <input
                key={index}
                type="text"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={`${step.placeholder} (${index + 1})`}
                value={problem}
                onChange={(e) => {
                  const newProblems = [...problems];
                  newProblems[index] = e.target.value;
                  updatePreferences(step.field, newProblems.filter(p => p.trim()));
                }}
              />
            ))}
            {problems.length < (step.max || 3) && (
              <button
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400"
                onClick={() => updatePreferences(step.field, [...problems, ''])}
              >
                + Add another
              </button>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Language
              </label>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.code}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      preferences.delivery?.language === lang.code
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updatePreferences('delivery', { 
                      ...preferences.delivery, 
                      language: lang.code 
                    })}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Voice Audio (TTS)</p>
                  <p className="text-sm text-gray-500">Hear rituals spoken aloud</p>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-all ${
                    consent.tts ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                  onClick={() => updateConsent('tts', !consent.tts)}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      consent.tts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Sensor Access</p>
                  <p className="text-sm text-gray-500">For breathing guidance (optional)</p>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-all ${
                    consent.sensors ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                  onClick={() => updateConsent('sensors', !consent.sensors)}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      consent.sensors ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-800">
                  <strong>Privacy:</strong> All data is session-only by default. 
                  Nothing is stored permanently without your explicit consent.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <button onClick={handleBack} disabled={currentStep === 0}>
            <ArrowLeft className={`w-6 h-6 ${currentStep === 0 ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-purple-600" />
            <span className="font-semibold text-gray-800">Sahaara</span>
          </div>
          
          <Link href="/" className="text-gray-600">
            Skip
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex space-x-2 mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full ${
                  index <= currentStep ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            {steps[currentStep].title}
          </h2>
          
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <button
          className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all ${
            isStepComplete()
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleNext}
          disabled={!isStepComplete()}
        >
          {currentStep === steps.length - 1 ? 'Start Your Journey' : 'Continue'}
          <ArrowRight className="w-5 h-5 inline ml-2" />
        </button>
      </div>
    </div>
  );
}
