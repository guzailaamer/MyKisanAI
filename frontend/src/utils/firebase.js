// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Debug: Log all environment variables
console.log("All VITE environment variables:", import.meta.env);

// Debug: Log specific Firebase config values
console.log("Firebase config values:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
});

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check for missing values
const missingValues = Object.entries(firebaseConfig).filter(([key, value]) => !value);
if (missingValues.length > 0) {
    console.error("Missing Firebase config values:", missingValues.map(([key]) => key));
    console.error("This means your .env file is not being loaded properly");
    console.error("Make sure your .env file is in the frontend root directory");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with Google popup function - THIS WAS MISSING!
export const signInWithGoogle = async () => {
  try {
    console.log('Attempting Google sign in...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign in successful:', result.user.displayName);
    return result;
  } catch (error) {
    console.error('Google sign in failed:', error);
    throw error;
  }
};

// Log Firebase initialization status
console.log('🔥 Firebase initialized successfully');
console.log('🔥 Auth instance:', auth);
console.log('🔥 Project ID:', firebaseConfig.projectId);

// Export default app
export default app;