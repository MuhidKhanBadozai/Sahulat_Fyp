import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 👈 ADD THIS LINE

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0YppHdSBLZL2WSdDpYsbATIyEfxEHFiA",
  authDomain: "sahulat-hub-e68ba.firebaseapp.com",
  projectId: "sahulat-hub-e68ba",
  storageBucket: "sahulat-hub-e68ba.appspot.com",
  messagingSenderId: "798656252072", 
  appId: "1:798656252072:web:e00c7b12eb1b2602b59a9d",
  measurementId: "G-2R2KEGMCKK",
};

// Check if Firebase app is already initialized
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // 👈 ADD THIS LINE

export { auth, db, storage }; // 👈 EXPORT STORAGE TOO
