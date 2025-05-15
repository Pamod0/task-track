import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getDatabase, type Database } from "firebase/database"; // Added
import { firebaseConfig } from "./config";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore; // For Firestore
let database: Database; // For Realtime Database

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);
database = getDatabase(app); // Initialize Realtime Database

export { app, auth, db, database }; // Export RTDB instance
