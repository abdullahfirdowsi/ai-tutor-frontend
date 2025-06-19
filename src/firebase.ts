import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration - replace with your own config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate Firebase configuration
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName]?.includes('your-'));

if (missingVars.length > 0) {
  console.error('Missing or invalid Firebase configuration. Please update your .env file with actual Firebase credentials.');
  console.error('Missing/invalid variables:', missingVars);
  console.error('Get your Firebase config from: Firebase Console > Project Settings > General > Your apps');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Connect to emulators in development environment
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATORS === 'true') {
  // Auth emulator - typically runs on port 9099
  connectAuthEmulator(auth, 'http://localhost:9099');
  
  // Firestore emulator - typically runs on port 8080
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  
  console.log('Using Firebase emulators for development');
}

export { app, auth, firestore, googleProvider };