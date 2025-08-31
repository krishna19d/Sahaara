'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SimpleDashboard() {
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [mood, setMood] = useState({ stress: 5, energy: 5 });
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sahaara_simple_responses');
      if (stored) {
        setResponses(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  }, []);

  const handleMoodUpdate = (type: 'stress' | 'energy', value: number) => {
    setMood(prev => ({ ...prev, [type]: value }));
  };

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, newMessage]);
    setChatMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatMessage,
          userId: 'simple-user',
          context: { mood, responses }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: 'I apologize, but I&apos;m having trouble connecting right now. Try asking about breathing exercises or simple coping strategies.' 
        }]);
      }
    } catch {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Here&apos;s a simple breathing exercise: Breathe in for 4 counts, hold for 4 counts, breathe out for 6 counts. Repeat 3 times.' 
      }]);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
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
        <h1>Your Wellness Dashboard</h1>
        <p>Simple, private, and effective</p>
      </div>

      {/* Mood Check */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>How are you feeling?</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Stress Level: {mood.stress}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={mood.stress}
            onChange={(e) => handleMoodUpdate('stress', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Energy Level: {mood.energy}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={mood.energy}
            onChange={(e) => handleMoodUpdate('energy', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ 
          background: mood.stress > 7 ? '#ffe6e6' : mood.stress < 4 ? '#e6ffe6' : '#fff3e6',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          {mood.stress > 7 && "High stress detected. Try the breathing exercise below."}
          {mood.stress >= 4 && mood.stress <= 7 && "Moderate stress levels. You&apos;re managing well."}
          {mood.stress < 4 && "Low stress levels. Great job maintaining your calm!"}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>Quick Wellness Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <button
            onClick={() => window.open('https://www.youtube.com/watch?v=inpok4MKVLM', '_blank')}
            style={{
              padding: '15px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🫁 Breathing Exercise
          </button>
          <button
            onClick={() => setChatMessage('I need help with anxiety')}
            style={{
              padding: '15px',
              background: '#764ba2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            💬 Ask for Help
          </button>
          <button
            onClick={() => setChatMessage('Give me a quick mood boost')}
            style={{
              padding: '15px',
              background: '#52a7a7',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ⚡ Mood Boost
          </button>
        </div>
      </div>

      {/* Chat */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>Chat with Your Wellness Companion</h2>
        
        <div style={{
          height: '200px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          borderRadius: '5px',
          padding: '10px',
          marginBottom: '10px',
          background: '#f9f9f9'
        }}>
          {chatHistory.length === 0 && (
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              Start a conversation! Ask about breathing exercises, coping strategies, or how you&apos;re feeling.
            </div>
          )}
          {chatHistory.map((msg, index) => (
            <div key={index} style={{
              marginBottom: '10px',
              padding: '10px',
              background: msg.role === 'user' ? '#e3f2fd' : '#f3e5f5',
              borderRadius: '8px'
            }}>
              <strong>{msg.role === 'user' ? 'You' : 'Sahaara'}:</strong> {msg.content}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type your message here..."
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link href="/simple" style={{ color: '#667eea', textDecoration: 'none' }}>
          ← Back to Setup
        </Link>
        {' | '}
        <Link href="/" style={{ color: '#667eea', textDecoration: 'none' }}>
          Full Version
        </Link>
      </div>
    </div>
  );
}
