import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyB3P78DJWm1MHnauFA39cijZjTIZScUOzY",
    authDomain: "knowledge-hub-38d58.firebaseapp.com",
    projectId: "knowledge-hub-38d58",
    storageBucket: "knowledge-hub-38d58.firebasestorage.app",
    messagingSenderId: "3196389037",
    appId: "1:3196389037:web:5c4ff9235a42674eb1e824",
    measurementId: "G-BJP3QVJ18D"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
