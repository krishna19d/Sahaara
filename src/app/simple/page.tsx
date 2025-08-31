'use client';
import { useState } from 'react';

export default function SimplePage() {
  const [step, setStep] = useState(1);
  const [responses, setResponses] = useState<Record<number, string>>({});

  const questions = [
    "How do you typically handle stress? (breathing, music, talking, etc.)",
    "What time of day do you feel most anxious?",
    "Do you prefer guided activities or self-directed ones?",
    "What's your biggest mental health challenge right now?"
  ];

  const handleResponse = (value: string) => {
    setResponses(prev => ({ ...prev, [step]: value }));
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      // Store data and redirect
      localStorage.setItem('sahaara_simple_responses', JSON.stringify(responses));
      window.location.href = '/simple-dashboard';
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1>Sahaara - Simple Mode</h1>
        <p>Anonymous mental wellness companion</p>
      </div>

      {step <= questions.length ? (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <span style={{ 
              background: '#667eea',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '15px',
              fontSize: '14px'
            }}>
              Question {step} of {questions.length}
            </span>
          </div>
          
          <h2 style={{ color: '#333', marginBottom: '20px' }}>
            {questions[step - 1]}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => handleResponse(`Response A for question ${step}`)}
              style={{
                padding: '15px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Option A (Quick response)
            </button>
            <button
              onClick={() => handleResponse(`Response B for question ${step}`)}
              style={{
                padding: '15px',
                background: '#764ba2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Option B (Detailed response)
            </button>
            <textarea
              placeholder="Or write your own response..."
              style={{
                padding: '15px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                minHeight: '80px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  const value = (e.target as HTMLTextAreaElement).value;
                  if (value.trim()) {
                    handleResponse(value);
                  }
                }
              }}
            />
            <small style={{ color: '#666' }}>
              Press Ctrl+Enter to submit your written response
            </small>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2>Thank you!</h2>
          <p>Your responses have been saved. Redirecting to dashboard...</p>
          <div style={{ marginTop: '20px' }}>
            <a 
              href="/simple-dashboard"
              style={{
                background: '#667eea',
                color: 'white',
                padding: '15px 30px',
                textDecoration: 'none',
                borderRadius: '8px',
                display: 'inline-block'
              }}
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#667eea', textDecoration: 'none' }}>
          ← Back to Full Version
        </a>
      </div>
    </div>
  );
}
