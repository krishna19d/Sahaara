# Sahaara - Mythic-Reframe Engine (MVP)

**Anonymous AI mental wellness companion for Indian youth (15-30)**

Sahaara delivers personalized 60–90 second micro-rituals using evidence-based psychology, designed for privacy-first engagement with anonymous sessions and cultural resonance.

## 🎯 Project Overview

- **Purpose**: Anonymous AI mental-wellness companion prototype
- **Target**: Indian youth aged 15-30
- **Core Feature**: Personalized 60-90s micro-rituals with 3 phases: grounding → reframe → micro-action
- **Privacy**: Session-only by default, no mythological references in user output
- **MVP Scope**: 3 archetypes (performance_anxiety, activation_deficit, interpersonal_distress)

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **PWA**: Service Worker for offline capability
- **UI Library**: Lucide React icons, Framer Motion

### Backend
- **API**: Next.js API routes
- **Database**: Firebase Firestore (anonymous auth)
- **Storage**: Cloud Storage for audio files
- **AI Integration**: Vertex AI (ready for LLM, TTS, moderation)

### Core Features Implemented
- ✅ Anonymous onboarding (preferences capture)
- ✅ Quick mood check-in with sliders
- ✅ Ritual composer with pre-generated content
- ✅ Audio playback interface + breathing animation
- ✅ Crisis detection & escalation UI
- ✅ Artifact saving system
- ✅ Privacy-first design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase project
- Google Cloud Platform account (for Vertex AI)

### Installation

1. **Clone and install dependencies**
   \`\`\`bash
   cd sahaara
   npm install
   \`\`\`

2. **Environment Setup**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your Firebase and Google Cloud credentials:
   \`\`\`env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   \`\`\`

3. **Firebase Setup**
   - Create a new Firebase project
   - Enable Anonymous Authentication
   - Initialize Firestore with the following collections:
     - \`users/{session_id}\` - User sessions and preferences
     - \`artifacts/{artifact_id}\` - Saved ritual artifacts

4. **Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
   
   Open [http://localhost:3000](http://localhost:3000)

## 📱 User Journey

1. **Landing** → Anonymous entry point with privacy assurance
2. **Onboarding** → 9-step preference capture (90s)
3. **Dashboard** → Mood check + quick ritual access
4. **Ritual Playback** → 60-90s guided experience with breathing animation
5. **Artifact Save** → Optional preservation of meaningful moments
6. **Crisis Support** → Immediate escalation if needed

## 🎭 Archetype System

### Performance Anxiety
- **Triggers**: High stress + activation, keywords: "exam", "test", "pressure"
- **Approach**: Break down overwhelm into single actionable steps
- **Micro-action**: Write one specific question to tackle

### Activation Deficit  
- **Triggers**: Low activation, keywords: "tired", "motivation", "procrastinate"
- **Approach**: Quick energy boost + tiny commitment
- **Micro-action**: 5-minute hobby-related task

### Interpersonal Distress
- **Triggers**: High isolation, keywords: "relationship", "alone", "social"
- **Approach**: Safe emotional expression + connection prep
- **Micro-action**: Write one line to communicate feelings

## 🛡️ Safety & Ethics

### Crisis Detection
- **Regex patterns** for immediate risk keywords
- **Advanced detection** with pattern matching
- **Escalation flow**: Helplines + immediate options + safety resources

### Privacy Guarantees
- Anonymous Firebase authentication
- Session-only data retention by default
- Explicit opt-in for TTS, sensors, extended storage
- No PII collection

### Content Guidelines
- Evidence-based psychology approaches (CBT/ACT/DBT)
- Classical Indian philosophy for research only
- **Zero mythological references** in user-facing content
- Human review required for public demo

## 🔌 API Endpoints

### Core Routes
- \`POST /api/onboard\` - Create session + save preferences
- \`POST /api/mood-check\` - Update state vector, decide ritual trigger
- \`POST /api/generate-ritual\` - Main orchestrator (crisis check → archetype → ritual)
- \`POST /api/save-artifact\` - Save meaningful moments
- \`POST /api/escalate\` - Crisis resources

### Example Payloads

**Onboard Request:**
\`\`\`json
{
  "preferences": {
    "why": "feeling stressed about exams",
    "mood": "Stressed",
    "movie": {"title": "3 Idiots", "reason": "learning-by-doing"},
    "song": {"title": "Kun Faya Kun", "emotion": "calm"},
    "hobbies": ["sketching"],
    "safe_place": "rooftop",
    "dream": "study abroad",
    "problems": ["exams", "sleep"]
  },
  "consent": {
    "sensors": false,
    "retention": "session-only",
    "tts": true
  }
}
\`\`\`

**Ritual Output:**
\`\`\`json
{
  "escalation": false,
  "audio_text": "Hey — let's take ninety seconds...",
  "visual_artifact": "One small question — one real step.",
  "micro_action_instruction": "Write down one specific question...",
  "estimated_duration_seconds": 90,
  "confidence_score": 0.85
}
\`\`\`

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Complete onboarding flow
- [ ] Trigger each archetype ritual
- [ ] Test crisis keyword detection
- [ ] Audio playback functionality
- [ ] Artifact saving/loading
- [ ] Privacy settings
- [ ] Mobile responsiveness

### Crisis Testing
Test with keywords: "suicide", "hurt myself", "no point" → Should redirect to crisis page

### Counselor Review
- [ ] Review sample ritual outputs with licensed counselor
- [ ] Validate crisis detection sensitivity
- [ ] Approve helpline resources

## 📊 Development Tasks Status

- [x] **Setup** (1h): Firebase + Next.js scaffold
- [x] **Onboarding UI** (2h): 9-step flow with preference capture
- [x] **Ritual Templates** (2h): 3 archetype scripts + personalization
- [x] **Core API** (6h): Session management + ritual generation
- [x] **Playback UI** (4h): Breathing animation + audio controls
- [x] **Safety System** (2h): Crisis detection + escalation UI
- [x] **Dashboard** (3h): Mood check + navigation
- [ ] **Audio Generation** (2h): TTS integration for demo
- [ ] **Testing & Polish** (3h): E2E testing + counselor review

**Total: ~23 hours → MVP Ready**

## 🚢 Deployment

### For Demo/Hackathon
1. **Vercel Deployment**
   \`\`\`bash
   npm run build
   vercel --prod
   \`\`\`

2. **Environment Variables**
   - Add all Firebase config to Vercel environment
   - Set \`NODE_ENV=production\`

3. **Audio Assets**
   - Upload pre-generated audio files to \`/public/audio/\`
   - Use signed URLs for Cloud Storage in production

### Production Considerations
- Set up Cloud Run for API scaling
- Implement Vertex AI for dynamic ritual generation
- Add comprehensive monitoring and analytics
- Review all content with mental health professionals

## 📋 Next Steps (Post-MVP)

1. **AI Integration**: Real-time LLM ritual generation
2. **Voice Interface**: Full TTS/STT implementation  
3. **Community Features**: Anonymous peer support (optional)
4. **Advanced Analytics**: Efficacy tracking (with consent)
5. **Multi-language**: Hindi language support
6. **Professional Network**: Counselor referral system

## 🆘 Crisis Resources

**India Mental Health Helplines:**
- Kiran: 1800-599-0019
- Vandrevala Foundation: 9999 666 555
- AASRA: 91-9820466726
- Sneha: 044-24640050

## 📜 License

MIT License - Built for social impact and open mental wellness innovation.

---

**⚠️ Important**: This is a prototype for demonstration purposes. For actual mental health concerns, please consult licensed mental health professionals.
