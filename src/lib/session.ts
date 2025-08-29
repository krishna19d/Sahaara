import { doc, setDoc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserSession, Artifact, StateVector, UserPreferences, ConsentFlags } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Session management
export async function createUserSession(
  preferences: UserPreferences, 
  consentFlags: ConsentFlags
): Promise<string> {
  const sessionId = uuidv4();
  
  // Calculate initial state vector based on preferences
  const initialStateVector: StateVector = {
    stress: mapMoodToStress(preferences.mood),
    activation: 0.5, // Neutral starting point
    isolation: preferences.problems.includes('loneliness') || preferences.problems.includes('social') ? 0.7 : 0.3,
    identity_conflict: preferences.problems.includes('identity') || preferences.problems.includes('purpose') ? 0.6 : 0.2,
    clarity: 0.3 // Low initially, will improve with rituals
  };
  
  const session: UserSession = {
    session_id: sessionId,
    created_at: new Date(),
    preferences,
    consent_flags: consentFlags,
    retention_policy: consentFlags.retention,
    state_vector: initialStateVector
  };
  
  // Save to Firestore
  await setDoc(doc(db, 'users', sessionId), session);
  
  return sessionId;
}

export async function getUserSession(sessionId: string): Promise<UserSession | null> {
  try {
    const docRef = doc(db, 'users', sessionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserSession;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user session:', error);
    return null;
  }
}

export async function updateStateVector(sessionId: string, newStateVector: StateVector) {
  try {
    const docRef = doc(db, 'users', sessionId);
    await updateDoc(docRef, {
      state_vector: newStateVector,
      updated_at: new Date()
    });
  } catch (error) {
    console.error('Error updating state vector:', error);
    throw error;
  }
}

export async function saveArtifact(artifact: Omit<Artifact, 'artifact_id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'artifacts'), {
      ...artifact,
      timestamp: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving artifact:', error);
    throw error;
  }
}

// Helper functions
function mapMoodToStress(mood: string): number {
  const moodMap: Record<string, number> = {
    'Calm': 0.1,
    'Uneasy': 0.4,
    'Stressed': 0.7,
    'Panicked': 0.9,
    'Numb': 0.6
  };
  return moodMap[mood] || 0.5;
}

export function calculateTriggerRitual(stateVector: StateVector): { trigger: boolean; confidence: number } {
  // Simple threshold-based triggering for MVP
  const stressWeight = 0.4;
  const activationWeight = 0.3;
  const isolationWeight = 0.3;
  
  const triggerScore = 
    (stateVector.stress * stressWeight) +
    (Math.abs(stateVector.activation - 0.5) * 2 * activationWeight) + // Distance from neutral
    (stateVector.isolation * isolationWeight);
  
  const trigger = triggerScore > 0.6;
  const confidence = Math.min(triggerScore, 1.0);
  
  return { trigger, confidence };
}

// Privacy helpers
export async function deleteUserData(sessionId: string): Promise<void> {
  try {
    // Delete user session
    await setDoc(doc(db, 'users', sessionId), {});
    
    // Note: In production, also delete associated artifacts and audio files
    console.log(`User data deleted for session: ${sessionId}`);
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}
