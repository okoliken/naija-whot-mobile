import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import {
  initializeAuth,
  signInAnonymously,
  type Auth,
} from "firebase/auth";
// `getReactNativePersistence` lives in the firebase/auth RN entry and Metro
// resolves it correctly at runtime, but it isn't part of the default public
// types (auth-public.d.ts). Namespace-import + cast keeps TS happy without
// reaching for @ts-expect-error.
import * as firebaseAuth from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Loaded from `.env` at bundle time. EXPO_PUBLIC_* vars are statically
// replaced by Expo, so this becomes plain strings in the final bundle.
// These are not secrets — security lives in firestore.rules.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const db: Firestore = getFirestore(app);

const { getReactNativePersistence } = firebaseAuth as typeof firebaseAuth & {
  getReactNativePersistence: (storage: typeof AsyncStorage) => unknown;
};

export const auth: Auth = initializeAuth(app, {
  // Persist the anonymous session so a single device keeps the same uid
  // across reloads — without this, every cold start would create a new
  // user and orphan any rooms the device hosts.
  persistence: getReactNativePersistence(AsyncStorage) as never,
});

// Kick off sign-in eagerly. Idempotent: if a session is already cached
// in AsyncStorage, Firebase resumes it; otherwise it creates a new
// anonymous user.
signInAnonymously(auth).catch((err) => {
  console.warn("[firebase] anonymous sign-in failed", err);
});
