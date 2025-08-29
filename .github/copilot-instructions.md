<!-- Sahaara - Mythic-Reframe Engine (MVP) Instructions -->

## Project Overview
- **Project Type**: Next.js PWA with Firebase backend and Vertex AI integration
- **Purpose**: Anonymous AI mental wellness companion for Indian youth (15-30)
- **Tech Stack**: Next.js, Firebase, Cloud Run, Vertex AI, Tailwind CSS
- **Privacy**: Session-only by default, no mythological references in user output

## Development Guidelines
- Use evidence-based psychology approaches (CBT/ACT/DBT)
- Classical Indian philosophy for research only - NO user-facing mythological references
- Crisis detection mandatory before ritual generation
- 60-90 second micro-rituals with 3 phases: grounding → reframe → micro-action
- Anonymous sessions with explicit opt-in for TTS/sensors

## Architecture
- Frontend: Next.js PWA + Tailwind CSS
- Backend: Cloud Run (Node.js/Express) + Firebase Functions
- Database: Firebase Auth (anonymous) + Firestore
- AI: Vertex AI (LLM, TTS, moderation)
- Storage: Cloud Storage for audio blobs

## Progress Tracking
- [x] Verify copilot-instructions.md file created
- [x] Clarify Project Requirements (provided in spec)
- [x] Scaffold the Project (Next.js with TypeScript/Tailwind)
- [x] Customize the Project (Core MVP features implemented)
- [x] Install Required Extensions (Dependencies installed)
- [x] Compile the Project (Development server working)
- [x] Create and Run Task (npm run dev active)
- [x] Launch the Project (Ready for demo at localhost:3000)
- [x] Ensure Documentation is Complete (README.md + DEMO.md created)

## MVP Implementation Status
✅ **Core Features Complete:**
- Anonymous onboarding (9-step preference capture)
- Dashboard with mood check sliders
- Ritual playback with breathing animation
- Crisis detection and escalation
- Pre-generated ritual templates for 3 archetypes
- Privacy-first design with session management
- PWA-ready architecture

## Quick Demo
1. Start: `npm run dev`
2. Visit: http://localhost:3000
3. Test flow: Landing → Onboard → Dashboard → Ritual
4. Crisis test: Type "hurt myself" during onboarding

## Ready for Production
- Comprehensive TypeScript implementation
- Firebase integration prepared
- Scalable architecture for Vertex AI
- Professional crisis handling
- Full documentation provided
