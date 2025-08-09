import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth, 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyChcIL19H7b20G4wf7msT-bVj3m58pTLjA",
  authDomain: "cindr-b5c15.firebaseapp.com",
  projectId: "cindr-b5c15",
  storageBucket: "cindr-b5c15.firebasestorage.app",
  messagingSenderId: "881076096652",
  appId: "1:881076096652:web:aad43c9e8b0afa9456f5a9",
  measurementId: "G-L0F0GM6HFR",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };