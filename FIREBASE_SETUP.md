# 🔥 Firebase Real-Time Chat Setup Guide

<<<<<<< Updated upstream
=======
> **Maintenance note for Claude:** This is a living document. Update it whenever Firebase configuration, environment variables, or Firestore setup steps change. See [Claude.md](Claude.md) for the full doc map and session-start primer.

>>>>>>> Stashed changes
## Step 1: Install Firebase Dependencies

Run this command in your terminal:

```bash
npm install firebase
```

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enter project name (e.g., "mystery-game-chat")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 3: Set Up Firestore Database

1. In Firebase Console, click "Firestore Database" in left sidebar
2. Click "Create database"
3. Select "Start in test mode" (we'll add security rules later)
4. Choose a location close to your users
5. Click "Enable"

## Step 4: Get Firebase Configuration

1. In Firebase Console, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>`
4. Register app with nickname (e.g., "mystery-game-web")
5. Copy the `firebaseConfig` object

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 5: Create Firebase Config File

Create a file `src/firebase/config.js` and paste your config:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
```

## Step 6: Set Up Firestore Security Rules (Optional but Recommended)

1. In Firebase Console → Firestore Database → Rules tab
2. Replace with these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow read: if true;
      allow create: if request.auth != null || true; // Allow all for now
      allow update, delete: if false;
    }
  }
}
```

## Step 7: Test Firebase Connection

After setting up, your app should connect automatically. Check browser console for any Firebase errors.

## Firestore Data Structure

Messages will be stored in the `messages` collection with this structure:

```javascript
{
  id: "auto-generated-id",
  characterId: "char_vikram",
  characterName: "Vikram",
  message: "Hello everyone!",
  timestamp: Timestamp (Firestore server timestamp),
  createdAt: 1705968000000 (JavaScript timestamp for sorting)
}
```

## Troubleshooting

**Error: Firebase not initialized**
- Make sure you've replaced the placeholder config with your actual Firebase config

**Error: Missing or insufficient permissions**
- Check Firestore security rules are set to allow reads/writes

**Messages not appearing**
- Check browser console for errors
- Verify Firestore Database is enabled in Firebase Console
- Check network tab for failed requests

## Cost Considerations

Firebase free tier includes:
- 50,000 reads per day
- 20,000 writes per day
- 1 GB storage

For a typical game session with 11 players:
- ~100-500 messages = 500 writes + 500 reads per player
- Well within free tier limits

## Next Steps After Setup

1. Install Firebase: `npm install firebase`
2. Create `src/firebase/config.js` with your config
3. The chat component will automatically connect and sync messages
4. Test by opening multiple browser windows with different characters

---

**Ready?** Once you've completed these steps, the chat will work automatically! 🎉
