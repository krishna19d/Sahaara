'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Phone, MessageSquare, Heart, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { EscalationResponse } from '@/types';

function CrisisContent() {
  const searchParams = useSearchParams();
  const [escalationData, setEscalationData] = useState<EscalationResponse | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam)) as EscalationResponse;
        setEscalationData(data);
      } catch (error) {
        console.error('Error parsing escalation data:', error);
        // Fallback to default escalation response
        setEscalationData({
          escalation: true,
          message_text: "I'm really sorry you're feeling this way. This sounds serious — please consider contacting local emergency services or a 24/7 crisis helpline now.",
          helpline_list: [
            {
              country: "IN",
              name: "Kiran Mental Health Helpline",
              number: "1800-599-0019"
            },
            {
              country: "IN", 
              name: "Vandrevala Foundation Helpline",
              number: "9999 666 555"
            },
            {
              country: "IN",
              name: "NIMHANS Helpline",
              number: "080-46110007"
            },
            {
              country: "IN",
              name: "iCall Helpline",
              number: "9152987821"
            }
          ],
          immediate_options: ["call_helpline", "text_helpline", "connect_counselor"]
        });
      }
    }
  }, [searchParams]);

  if (!escalationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-red-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-red-600" />
            <span className="font-semibold text-gray-800">Immediate Support</span>
          </div>
          
          <div className="w-8"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-md lg:max-w-lg xl:max-w-xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Main Message */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-red-500">
          <div className="flex items-start space-x-3">
            <Heart className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-3">
                We&apos;re here for you
              </h1>
              <p className="text-gray-700 leading-relaxed">
                {escalationData.message_text}
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="bg-red-100 border border-red-300 rounded-2xl p-4">
          <h2 className="font-bold text-red-800 mb-2">🚨 Emergency Situations</h2>
          <p className="text-red-700 text-sm mb-2">
            If you are in immediate physical danger or having thoughts of harming yourself:
          </p>
          <div className="space-y-2">
            <a 
              href="tel:100" 
              className="block w-full bg-red-600 text-white text-center py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-all"
            >
              📞 Call Emergency Services: 100
            </a>
          </div>
        </div>

        {/* Crisis Helplines */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">24/7 Crisis Helplines</h2>
          
          {escalationData.helpline_list.map((helpline, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{helpline.name}</h3>
                  <p className="text-sm text-gray-600">Free & Confidential</p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={`tel:${helpline.number}`}
                    className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-all"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                  <a
                    href={`sms:${helpline.number}`}
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <p className="text-lg font-mono text-gray-800 mt-2">{helpline.number}</p>
            </div>
          ))}
        </div>

        {/* Online Resources */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Online Support</h2>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <a 
              href="https://www.befrienders.org/need-to-talk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all"
            >
              <div>
                <h3 className="font-medium text-blue-800">Befrienders Worldwide</h3>
                <p className="text-sm text-blue-600">International emotional support</p>
              </div>
              <ExternalLink className="w-5 h-5 text-blue-600" />
            </a>
            
            <a 
              href="https://www.7cups.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all"
            >
              <div>
                <h3 className="font-medium text-purple-800">7 Cups</h3>
                <p className="text-sm text-purple-600">Free online therapy & support</p>
              </div>
              <ExternalLink className="w-5 h-5 text-purple-600" />
            </a>
          </div>
        </div>

        {/* Immediate Coping Strategies */}
        <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
          <h2 className="text-lg font-semibold text-green-800 mb-4">Right Now, You Can:</h2>
          <ul className="space-y-3 text-sm text-green-700">
            <li className="flex items-start space-x-2">
              <span className="text-green-600">•</span>
              <span>Take slow, deep breaths for 2 minutes</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600">•</span>
              <span>Call or text a trusted friend or family member</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600">•</span>
              <span>Go to a safe, public place with other people</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600">•</span>
              <span>Remove any items that could be used for self-harm</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600">•</span>
              <span>Remember: This feeling is temporary and will pass</span>
            </li>
          </ul>
        </div>

        {/* Return to App */}
        <div className="text-center pt-4">
          <Link 
            href="/dashboard"
            className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            Return to Sahaara when you&apos;re ready →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CrisisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    }>
      <CrisisContent />
    </Suspense>
  );
}
