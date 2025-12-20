// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingo-b3fd6.firebaseapp.com",
  projectId: "vingo-b3fd6",
  storageBucket: "vingo-b3fd6.firebasestorage.app",
  messagingSenderId: "750640341001",
  appId: "1:750640341001:web:84e89d28e63ba5015818d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };
