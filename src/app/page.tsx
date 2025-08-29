'use client';

import { useState } from 'react';
import { Heart, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
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
