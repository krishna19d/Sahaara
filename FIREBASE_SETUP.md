# Firebase Setup Instructions for Sahaara

## ✅ Your Firebase Project is Ready!

**Project ID**: `sahaara-a266d`
**Console**: https://console.firebase.google.com/project/sahaara-a266d

## 🔧 Required Configuration

### 1. Enable Authentication
1. Go to Firebase Console → Authentication
2. Click "Get Started" 
3. Go to "Sign-in method" tab
4. Enable **Anonymous** authentication
5. Click "Save"

### 2. Set up Firestore Database
1. Go to Firebase Console → Firestore Database
2. Click "Create database"
3. Choose **"Start in test mode"** (for development)
4. Select location: **us-central** (recommended)
5. Click "Done"

### 3. Configure Storage (Optional for MVP)
1. Go to Firebase Console → Storage
2. Click "Get started"
3. Use default security rules for now
4. Choose **us-central** location

## 🧪 Test Your Setup

Run the test script to verify everything works:

```bash
cd scripts
node firebase-setup.js
```

You should see:
- ✅ Firebase initialized successfully!
- 🎭 Anonymous sign-in test successful!
- 👤 User ID: [some-anonymous-id]

## 🔒 Security Rules

### Firestore Rules (for production):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own session data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Artifacts are tied to user sessions
    match /artifacts/{artifactId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /audio/{allPaths=**} {
      allow read: if true; // Audio files are public
      allow write: if request.auth != null;
    }
  }
}
```

## 🚀 Next Steps

1. **Test the App**: Visit http://localhost:3000
2. **Complete Onboarding**: Try the full user flow
3. **Check Firestore**: Verify data is being saved in Firebase Console
4. **Test Crisis Flow**: Try keywords like "suicide" to test safety features

## 📊 Collections Created

Your app will automatically create these Firestore collections:

- **`users/{session_id}`** - Anonymous user sessions and preferences
- **`artifacts/{artifact_id}`** - Saved ritual moments and reflections

## 🆘 Troubleshooting

**Issue**: "Permission denied" errors
**Solution**: Make sure Firestore is in "test mode" and Anonymous auth is enabled

**Issue**: "Firebase not initialized"
**Solution**: Check that .env.local file exists with your credentials

**Issue**: Network errors
**Solution**: Ensure your Firebase project is active and billing is set up (free tier is sufficient)

---

**🎉 Your Sahaara MVP is now connected to Firebase and ready for full functionality!**
