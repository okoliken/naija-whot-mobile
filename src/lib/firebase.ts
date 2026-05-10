import { getApps, initializeApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Paste your Firebase web-app config below.
 *
 * One-time setup:
 *  1. https://console.firebase.google.com → Add project
 *  2. Build → Firestore Database → Create database → Start in **test mode**
 *  3. Project settings → Your apps → Add app → Web (</> icon) → register
 *  4. Copy the `firebaseConfig` object it shows you and replace the fields below.
 *
 * Test-mode rules expire after 30 days; tighten before going public.
 * No native modules — works in Expo Go.
 */
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const db: Firestore = getFirestore(app);
