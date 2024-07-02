// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import { 
     getAuth,
     signInWithPopup,
     GoogleAuthProvider, 
     onAuthStateChanged, 
     User } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


const firebaseConfig = {
    apiKey: "AIzaSyCK8wVMlYwbq-VqUg951r1cGN4Es9HG3eY",
    authDomain: "yt-clone-91a79.firebaseapp.com",
    projectId: "yt-clone-91a79",
    storageBucket: "yt-clone-91a79.appspot.com",
    messagingSenderId: "499639576894",
    appId: "1:499639576894:web:02f5a548771f32ed3d646f",
    measurementId: "G-15BEYRTWQ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const functions = getFunctions(app);
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

