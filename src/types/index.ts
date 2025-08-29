// Core data types for Sahaara MVP

export interface UserPreferences {
  why: string;
  mood: 'Calm' | 'Uneasy' | 'Stressed' | 'Panicked' | 'Numb';
  movie: {
    title: string;
    reason: string;
  };
  song: {
    title: string;
    emotion: string;
  };
  hobbies: string[];
  safe_place: string;
  dream: string;
  problems: string[];
  delivery: {
    language: 'en' | 'hi';
    voice: 'friendly-peer';
    tts: boolean;
  };
}

export interface ConsentFlags {
  sensors: boolean;
  retention: 'session-only' | 'extended';
  tts: boolean;
}

export interface StateVector {
  stress: number; // 0-1
  activation: number; // 0-1
  isolation: number; // 0-1
  identity_conflict: number; // 0-1
  clarity: number; // 0-1
}

export interface MoodCheck {
  stress: number;
  activation: number;
  isolation: number;
  note?: string;
  timestamp: Date;
}

export interface RitualOutput {
  escalation: boolean;
  audio_text?: string;
  visual_artifact?: string;
  micro_action_instruction?: string;
  tags?: string[];
  estimated_duration_seconds?: number;
  confidence_score?: number;
  audio_url?: string;
}

export interface EscalationResponse {
  escalation: true;
  message_text: string;
  helpline_list: Array<{
    country: string;
    name: string;
    number: string;
  }>;
  immediate_options: ('call_helpline' | 'text_helpline' | 'connect_counselor')[];
}

export interface UserSession {
  session_id: string;
  created_at: Date;
  preferences: UserPreferences;
  consent_flags: ConsentFlags;
  retention_policy: string;
  state_vector: StateVector;
  last_archetype?: 'performance_anxiety' | 'activation_deficit' | 'interpersonal_distress';
}

export interface Artifact {
  artifact_id: string;
  session_id: string;
  text: string;
  timestamp: Date;
  context_state_vector: StateVector;
}

export interface ArchetypeRule {
  name: 'performance_anxiety' | 'activation_deficit' | 'interpersonal_distress';
  conditions: {
    stress_threshold?: number;
    activation_threshold?: number;
    isolation_threshold?: number;
    keywords?: string[];
  };
  weight: number;
}

export interface PregenRitual {
  archetype: 'performance_anxiety' | 'activation_deficit' | 'interpersonal_distress';
  script: string;
  artifact: string;
  audio_url?: string;
  estimated_duration: number;
}

// API Request/Response types
export interface OnboardRequest {
  session_temp: string;
  why: string;
  mood: string;
  movie: { title: string; why: string };
  song: { title: string; emotion: string };
  hobbies: string[];
  safe_place: string;
  dream: string;
  problems: string[];
  delivery: { language: string; voice: string; tts: boolean };
  consent: { sensors: boolean; retention: string };
}

export interface OnboardResponse {
  session_id: string;
  initial_state_vector: StateVector;
}

export interface MoodCheckRequest {
  session_id: string;
  stress: number;
  activation: number;
  isolation: number;
  note?: string;
}

export interface MoodCheckResponse {
  trigger_ritual: boolean;
  ritual_id?: string;
  confidence: number;
}

export interface GenerateRitualRequest {
  session_id: string;
  state_vector: StateVector;
  preferences: UserPreferences;
  delivery: {
    language: string;
    voice: string;
    tts: boolean;
  };
}
