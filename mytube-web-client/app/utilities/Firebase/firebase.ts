// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
     getAuth,
     signInWithPopup,
     GoogleAuthProvider, 
     onAuthStateChanged, 
     User } from "firebase/auth"
import { config } from "dotenv";
import path from "path";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
config();
const firebaseConfig = {
    apiKey: `${process.env.FIREBASE_API_KEY}`,
    authDomain: "yt-clone-91a79.firebaseapp.com",
    projectId: "yt-clone-91a79",
    storageBucket: "yt-clone-91a79.appspot.com",
    messagingSenderId: "499639576894",
    appId: "1:499639576894:web:96dd9698d81aa2ec3d646f",
    measurementId: "G-7QFYWE8VWD"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
/**
 * Signs the user with google popup
 * @returns a promise that returns with gooogle credentials
 */
export function signInWithGoogle(){
    return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * signs the user out
 * @returns A promise that resolves when the user is signed out
 */
export function signOut() {
    return auth.signOut();
}
/**
 * Triggers a callback when user auth state changes
 * @returns A function to unsubscribe callback
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

