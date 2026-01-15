import { initializeApp } from "firebase/app";
import { getAuth, browserSessionPersistence, setPersistence } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB7iZxA5_tZdzli_iJJAh0hh7LCX1Dz2B8",
    authDomain: "task-manager-c07a2.firebaseapp.com",
    projectId: "task-manager-c07a2",
    storageBucket: "task-manager-c07a2.firebasestorage.app",
    messagingSenderId: "233700769686",
    appId: "1:233700769686:web:696310a4114ad8519c67b7",
    measurementId: "G-JBLELE130L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set session persistence so that each tab has independent auth state
setPersistence(auth, browserSessionPersistence).catch((error) => {
    console.error("Failed to set auth persistence:", error);
});
