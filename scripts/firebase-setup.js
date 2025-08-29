// Firebase Firestore Setup Script for Sahaara
// Run this after setting up your Firebase project

import { initializeApp } from 'firebase/app';
import { getFirestore, enableNetwork } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDEWMlpYgDJXT8E_zW7peu5Dpho6TdGf20",
  authDomain: "sahaara-a266d.firebaseapp.com",
  projectId: "sahaara-a266d",
  storageBucket: "sahaara-a266d.firebasestorage.app",
  messagingSenderId: "147514507667",
  appId: "1:147514507667:web:d6be830d54a5754516a866"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable Firestore
enableNetwork(db);

console.log('✅ Firebase initialized successfully!');
console.log('📁 Project ID:', firebaseConfig.projectId);
console.log('🔐 Auth Domain:', firebaseConfig.authDomain);

// Test anonymous authentication
signInAnonymously(auth).then((userCredential) => {
  console.log('🎭 Anonymous sign-in test successful!');
  console.log('👤 User ID:', userCredential.user.uid);
}).catch((error) => {
  console.error('❌ Anonymous sign-in failed:', error);
});

export { app, db, auth };
