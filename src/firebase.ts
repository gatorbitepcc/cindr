import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChcIL19H7b20G4wf7msT-bVj3m58pTLjA",
  authDomain: "cindr-b5c15.firebaseapp.com",
  projectId: "cindr-b5c15",
  storageBucket: "cindr-b5c15.firebasestorage.app",
  messagingSenderId: "881076096652",
  appId: "1:881076096652:web:aefeee2280eccbcd56f5a9",
  measurementId: "G-M5BDE5TQP1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const google = new GoogleAuthProvider();
