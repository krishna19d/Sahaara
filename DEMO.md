# Sahaara MVP - Development & Deployment Guide

## Quick Start for Demo

### 1. Immediate Demo Setup (No Firebase)
For immediate demo without Firebase setup:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000

3. **Demo Flow:**
   - Landing page → "Start Anonymous Session"
   - Complete 9-step onboarding (mock data is fine)
   - Dashboard → "Quick Ritual" or "Check & Get Ritual"
   - Experience ritual playback with breathing animation
   - Test crisis detection by mentioning keywords like "suicide" or "hurt myself"

### 2. Firebase Setup (For Full Functionality)

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Enable Authentication → Anonymous sign-in
   - Create Firestore database

2. **Configure Environment:**
   ```bash
   cp .env.example .env.local
   ```
   Add your Firebase credentials to `.env.local`

3. **Firestore Collections:**
   - `users/{session_id}` - User sessions
   - `artifacts/{artifact_id}` - Saved moments

### 3. Production Deployment

**Vercel (Recommended for MVP):**
```bash
npm run build
npx vercel --prod
```

**Environment Variables for Production:**
- Add all Firebase config to Vercel dashboard
- Set `NODE_ENV=production`

## 🎯 MVP Demo Script (2 minutes)

### Minute 1: User Journey
1. **Landing (15s)**: Show privacy-first design, anonymous entry
2. **Onboarding (30s)**: Quick preference capture, show personalization
3. **Dashboard (15s)**: Mood check interface, stress/energy/connection sliders

### Minute 2: Core Experience  
1. **Ritual Selection (15s)**: Trigger ritual based on mood
2. **Playback (45s)**: Breathing animation, personalized script, micro-action
3. **Safety Demo (15s)**: Show crisis detection with test keywords

### Key Demo Points:
- ✅ **Privacy**: Anonymous sessions, no PII
- ✅ **Personalization**: Movie/song preferences integrated into rituals  
- ✅ **Evidence-based**: CBT/ACT techniques, not mythological
- ✅ **Safety**: Crisis detection redirects to professional help
- ✅ **Cultural**: Indian context without appropriation

## 📊 Technical Highlights for Judges

### Architecture Decisions
- **Next.js 15**: Latest framework for performance
- **Firebase**: Scalable, anonymous auth
- **TypeScript**: Type safety for mental health app
- **Tailwind**: Rapid, accessible UI development
- **PWA Ready**: Offline capability for crisis situations

### Code Quality
- Comprehensive TypeScript types
- Crisis detection with multiple fallbacks
- Session management with privacy controls
- Modular ritual system for easy expansion

### Scalability Considerations
- Cloud Run ready for API scaling
- Vertex AI integration prepared
- Modular archetype system
- Firestore for horizontal scaling

## 🧪 Testing Checklist

### Manual Tests
- [ ] Complete onboarding flow
- [ ] All 3 ritual archetypes trigger correctly
- [ ] Crisis detection works (test: "I want to hurt myself")
- [ ] Audio controls function properly
- [ ] Mobile responsive design
- [ ] Artifact saving (if Firebase connected)

### Demo Scenarios
1. **Performance Anxiety**: Mention "exam stress" → Get study-focused ritual
2. **Low Energy**: Set low activation → Get activation ritual
3. **Social Issues**: Mention "lonely" → Get connection ritual
4. **Crisis**: Type crisis keywords → Redirect to helplines

## 🔧 Development Notes

### File Structure
```
src/
├── app/                 # Next.js app router
│   ├── page.tsx        # Landing page
│   ├── onboard/        # 9-step onboarding
│   ├── dashboard/      # Mood check + navigation
│   ├── ritual/         # Core ritual playback
│   ├── crisis/         # Safety escalation
│   └── api/            # Backend API routes
├── lib/                # Core logic
│   ├── rituals.ts      # Archetype classification
│   ├── crisis.ts       # Safety detection
│   ├── session.ts      # User management
│   └── firebase.ts     # Database config
├── types/              # TypeScript definitions
└── components/         # Reusable UI components
```

### Key Algorithms
- **Archetype Classification**: Rule-based scoring system
- **Crisis Detection**: Keyword + pattern matching
- **State Vector**: Multi-dimensional mood tracking
- **Ritual Personalization**: Template + user preference injection

## 📈 Post-MVP Roadmap

### Immediate (Week 1-2)
- [ ] Real TTS integration with Vertex AI
- [ ] Advanced crisis detection with ML
- [ ] A/B testing framework

### Short-term (Month 1-3)
- [ ] Dynamic ritual generation with LLM
- [ ] Hindi language support
- [ ] Community features (anonymous peer support)

### Long-term (Month 3-6)
- [ ] Professional counselor integration
- [ ] Outcome tracking (with consent)
- [ ] Insurance partnership for referrals

## 🆘 Troubleshooting

**Build Errors:**
- Run `npm run lint -- --fix` to auto-fix linting issues
- Check Firebase config in `.env.local`

**Runtime Errors:**
- Verify Firebase project permissions
- Check browser console for specific API errors

**Demo Issues:**
- Use mock data if Firebase is not configured
- Crisis page should work without authentication
- Audio files are optional for basic demo

---

**Contact**: Built for hackathon demo - ready for immediate scaling and professional review.
