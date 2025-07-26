# Firestore Storage Setup Guide

## Overview
This guide will help you set up Firestore storage for MyKisanAI conversation metadata using Firebase Authentication.

## What's Been Implemented

### Backend (Python/FastAPI)
- ✅ **Firestore Service** (`backend/firestore_service.py`)
  - Stores conversation metadata for each tool
  - Organizes data by user UID
  - Supports querying by tool type and user

- ✅ **Authentication Middleware** (`backend/auth_middleware.py`)
  - Verifies Firebase ID tokens
  - Extracts user UID from authenticated requests

- ✅ **Updated API Endpoints** (`backend/main.py`)
  - All endpoints now require authentication
  - Automatically stores conversation metadata
  - New endpoints for retrieving conversation history

### Frontend (React)
- ✅ **API Service** (`frontend/src/api.js`)
  - Handles authentication tokens automatically
  - Centralized API calls with error handling
  - Supports all tool interactions

- ✅ **Updated UI** (`frontend/src/App.jsx`)
  - Conversation history display
  - Protected content behind authentication
  - Real-time conversation updates

## Setup Steps

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Firebase Service Account

#### Option A: Use Service Account Key (Recommended for Production)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `mykisanai` project
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. Place it in your backend directory (e.g., `backend/serviceAccountKey.json`)
7. Add to your `.env` file:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

#### Option B: Use Default Credentials (Development)
- For local development, you can use Firebase default credentials
- The service will automatically detect if no service account path is provided

### 3. Update Frontend Firebase Config
Make sure your `frontend/src/firebase.js` has the correct configuration from Firebase Console.

### 4. Enable Authentication in Firebase
1. Go to Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Add your domain to **Authorized domains** (localhost for development)

### 5. Set Up Firestore Database
1. Go to Firebase Console → **Firestore Database**
2. Create database if not exists
3. Start in **test mode** for development (or set up security rules)

### 6. Update Firestore Security Rules
Update `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own conversations
    match /users/{userId}/conversations/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Global conversations collection (for admin access)
    match /conversations/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Data Structure

### Conversation Documents
Each conversation is stored with this structure:
```json
{
  "user_id": "firebase_auth_uid",
  "tool_name": "crop_diagnosis|market_advisory|subsidy_navigator|text_to_speech|speech_to_text",
  "timestamp": "2024-01-01T00:00:00Z",
  "metadata": {
    "query": "user input",
    "response": "tool response",
    "tool_type": "specific_tool_type",
    // ... other tool-specific metadata
  },
  "created_at": "server_timestamp"
}
```

### Collections
- `/conversations` - Global conversation collection
- `/users/{userId}/conversations` - User-specific conversations

## API Endpoints

### Protected Endpoints (Require Authentication)
- `POST /diagnose_crop` - Crop disease diagnosis
- `POST /market_advice` - Market advisory
- `POST /subsidy_query` - Subsidy information
- `POST /tts` - Text-to-speech
- `POST /stt` - Speech-to-text

### Conversation History Endpoints
- `GET /conversations` - Get user's conversation history
- `GET /conversations/{tool_name}` - Get conversations for specific tool

## Running the Application

### Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

## Testing the Integration

1. **Sign up/Sign in** with email/password
2. **Use any tool** (crop diagnosis, market advisory, etc.)
3. **Check conversation history** by clicking "Show Conversation History"
4. **Verify data in Firestore** - check the Firebase Console

## Security Features

- ✅ **Authentication Required** - All API endpoints require valid Firebase tokens
- ✅ **User Isolation** - Users can only access their own conversation data
- ✅ **Token Verification** - Backend verifies Firebase ID tokens
- ✅ **Secure Storage** - No sensitive data stored in frontend

## Troubleshooting

### Common Issues

1. **"Authorization header missing"**
   - Ensure user is signed in
   - Check that Firebase Auth is working

2. **"Invalid token"**
   - Verify Firebase config in frontend
   - Check if user is properly authenticated

3. **"Service account not found"**
   - Ensure service account JSON file exists
   - Check file path in environment variables

4. **"Network request failed"**
   - Check internet connection
   - Verify Firebase project settings
   - Ensure domain is authorized in Firebase

### Debug Mode
Enable debug logging by adding to your backend:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Next Steps

1. **Deploy to Production** - Update Firebase config for production domain
2. **Add Analytics** - Track tool usage patterns
3. **Implement Caching** - Cache frequently accessed conversations
4. **Add Search** - Implement conversation search functionality
5. **Export Data** - Add conversation export features

## Support

If you encounter issues:
1. Check browser console for frontend errors
2. Check backend logs for API errors
3. Verify Firebase Console for authentication issues
4. Ensure all environment variables are set correctly 