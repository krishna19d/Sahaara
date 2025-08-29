'use client';

import { useState, useEffect } from 'react';
import { Heart, Shield, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { signInAnonymous, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    // Test Firebase connection
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAnonymous(user.isAnonymous);
        setAuthStatus('connected');
      } else {
        // Try to sign in anonymously
        signInAnonymous()
          .then(() => {
            setAuthStatus('connected');
            setIsAnonymous(true);
          })
          .catch((error) => {
            console.error('Firebase auth error:', error);
            setAuthStatus('error');
          });
      }
    });

    return () => unsubscribe();
  }, []);

  const getStatusBadge = () => {
    switch (authStatus) {
      case 'loading':
        return (
          <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
            <span>Connecting...</span>
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Connected {isAnonymous ? '(Anonymous)' : ''}</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Demo Mode</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Status Badge */}
        <div className="flex justify-center">
          {getStatusBadge()}
        </div>

        {/* Logo/Brand */}
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sahaara</h1>
          <p className="text-lg text-gray-600">Your anonymous wellness companion</p>
        </div>

        {/* Value Proposition */}
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Personalized 60-90 second micro-rituals to help you navigate stress, 
            find your energy, and connect with yourself.
          </p>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <Shield className="w-6 h-6 mx-auto text-green-600" />
              <p className="text-gray-600">Anonymous & Private</p>
            </div>
            <div className="space-y-2">
              <Sparkles className="w-6 h-6 mx-auto text-purple-600" />
              <p className="text-gray-600">Personalized</p>
            </div>
            <div className="space-y-2">
              <Heart className="w-6 h-6 mx-auto text-pink-600" />
              <p className="text-gray-600">Evidence-Based</p>
            </div>
          </div>
        </div>

        {/* Connection Status Info */}
        {authStatus === 'error' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
            <h3 className="font-medium text-amber-800 mb-2">Demo Mode Active</h3>
            <p className="text-amber-700 text-sm mb-2">
              Firebase connection failed. The app will work in demo mode.
            </p>
            <p className="text-amber-600 text-xs">
              To enable full functionality, ensure Anonymous Authentication is enabled in Firebase Console.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="space-y-4">
          <Link 
            href="/onboard"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 block"
          >
            Start Anonymous Session
          </Link>
          
          <p className="text-xs text-gray-500">
            No personal info required • Session-only by default
          </p>
        </div>

        {/* Crisis Resources */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            In crisis? Get immediate help:
          </p>
          <div className="flex justify-center space-x-4 text-xs">
            <a href="tel:1800-599-0019" className="text-blue-600 hover:underline">
              Kiran: 1800-599-0019
            </a>
            <a href="tel:9999666555" className="text-blue-600 hover:underline">
              Vandrevala: 9999 666 555
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
