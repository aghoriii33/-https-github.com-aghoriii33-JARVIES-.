import { initializeApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { getFirestore, Firestore, initializeFirestore } from "firebase/firestore";

let app: FirebaseApp;
export let auth: Auth;
export let db: Firestore;
let isInitialized = false;
let cachedAccessToken: string | null = null;

export const initFirebase = async () => {
  if (isInitialized) return { app, auth, db };
  
  try {
    const response = await fetch('/firebase-applet-config.json');
    if (!response.ok) throw new Error("Config not found");
    let config;
    try {
      config = await response.json();
    } catch (err) {
      throw new Error("Failed to parse firebase-applet-config.json. Make sure the file exists and is valid JSON.");
    }
    
    app = initializeApp(config);
    auth = getAuth(app);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true
    }, config.firestoreDatabaseId); // Fix default DB issue
    isInitialized = true;
    return { app, auth, db };
  } catch (error) {
    console.error("Firebase init failed:", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  const { auth } = await initFirebase();
  const provider = new GoogleAuthProvider();
  
  // Gmail scopes
  provider.addScope('https://mail.google.com/');
  provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
  provider.addScope('https://www.googleapis.com/auth/gmail.send');
  provider.addScope('https://www.googleapis.com/auth/gmail.compose');
  
  // Chat scopes
  provider.addScope('https://www.googleapis.com/auth/chat.spaces');
  provider.addScope('https://www.googleapis.com/auth/chat.spaces.readonly');
  provider.addScope('https://www.googleapis.com/auth/chat.messages');
  provider.addScope('https://www.googleapis.com/auth/chat.messages.readonly');
  provider.addScope('https://www.googleapis.com/auth/chat.memberships');
  provider.addScope('https://www.googleapis.com/auth/chat.memberships.readonly');
  
  // Calendar scopes
  provider.addScope('https://www.googleapis.com/auth/calendar');
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
  
  // Tasks scopes
  provider.addScope('https://www.googleapis.com/auth/tasks');
  
  // Meet scopes
  provider.addScope('https://www.googleapis.com/auth/meetings.space.created');
  provider.addScope('https://www.googleapis.com/auth/meetings.space.readonly');

  // Drive & Picker scopes
  provider.addScope('https://www.googleapis.com/auth/drive');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');

  // Sheets scopes
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');
  provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');

  // Docs scopes
  provider.addScope('https://www.googleapis.com/auth/documents');
  provider.addScope('https://www.googleapis.com/auth/documents.readonly');

  // Forms scopes
  provider.addScope('https://www.googleapis.com/auth/forms.body');
  provider.addScope('https://www.googleapis.com/auth/forms.body.readonly');
  provider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (credential?.accessToken) {
    cachedAccessToken = credential.accessToken;
  }
  return result;
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { auth } = await initFirebase();
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (email: string, password: string) => {
  const { auth } = await initFirebase();
  return signInWithEmailAndPassword(auth, email, password);
};

export const setupRecaptcha = async (containerId: string) => {
  const { auth } = await initFirebase();
  return new RecaptchaVerifier(auth, containerId, {
    'size': 'invisible'
  });
};

export const requestPhoneOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  const { auth } = await initFirebase();
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

export const logOut = async () => {
  const { auth } = await initFirebase();
  cachedAccessToken = null;
  return signOut(auth);
};
