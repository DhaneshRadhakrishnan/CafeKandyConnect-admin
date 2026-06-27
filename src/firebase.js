import { initializeApp } from "firebase/app";
import { getAuth }      from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage }   from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        "cafe-kandy-connect.firebaseapp.com",
  projectId:         "cafe-kandy-connect",
  storageBucket:     "cafe-kandy-connect.firebasestorage.app",
  messagingSenderId: "609603480689",
  appId:             "1:609603480689:android:c3279f823b935bf2dbffd0"
};

const app = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);