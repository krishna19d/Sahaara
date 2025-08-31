'use client';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState({
    env: '',
    fetch: '',
    localStorage: '',
    error: ''
  });

  useEffect(() => {
    try {
      // Test environment variables
      const env = process.env.NODE_ENV || 'undefined';
      
      // Test fetch API
      let fetchTest = 'Available';
      if (typeof fetch === 'undefined') {
        fetchTest = 'Not Available';
      }
      
      // Test localStorage
      let localStorageTest = 'Available';
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
      } catch (e) {
        localStorageTest = 'Not Available';
      }

      setDebugInfo({
        env,
        fetch: fetchTest,
        localStorage: localStorageTest,
        error: 'None'
      });

      // Test API call
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test', userId: 'debug' })
      }).then(response => {
        console.log('API Test Response:', response.status);
        if (!response.ok) {
          setDebugInfo(prev => ({ ...prev, error: `API Error: ${response.status}` }));
        }
      }).catch(error => {
        console.error('API Test Error:', error);
        setDebugInfo(prev => ({ ...prev, error: `API Error: ${error.message}` }));
      });

    } catch (error) {
      setDebugInfo(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Sahaara Debug Information</h1>
      <div style={{ background: '#f5f5f5', padding: '10px', marginBottom: '10px' }}>
        <strong>Environment:</strong> {debugInfo.env}
      </div>
      <div style={{ background: '#f5f5f5', padding: '10px', marginBottom: '10px' }}>
        <strong>Fetch API:</strong> {debugInfo.fetch}
      </div>
      <div style={{ background: '#f5f5f5', padding: '10px', marginBottom: '10px' }}>
        <strong>LocalStorage:</strong> {debugInfo.localStorage}
      </div>
      <div style={{ background: debugInfo.error === 'None' ? '#e8f5e8' : '#ffe6e6', padding: '10px', marginBottom: '10px' }}>
        <strong>Error Status:</strong> {debugInfo.error}
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Browser Information</h2>
        <div style={{ background: '#f5f5f5', padding: '10px', marginBottom: '10px' }}>
          <strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'Not Available'}
        </div>
        <div style={{ background: '#f5f5f5', padding: '10px', marginBottom: '10px' }}>
          <strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Not Available'}
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>← Back to Main App</a>
      </div>
    </div>
  );
}
