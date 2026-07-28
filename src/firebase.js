// Firebase Realtime Database Configuration Placeholder
//
// To enable real Firebase integration:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or use an existing one)
// 3. Enable Realtime Database in the Build section
// 4. Copy your web app config and replace the placeholder values below
// 5. Set Realtime Database rules as needed (start in test mode for development)

import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
// Optional: import { getAuth } from 'firebase/auth' for authentication

// PLACEHOLDER: Replace these values with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}

// Initialize Firebase (will work once you add real credentials)
let app = null
let database = null

try {
  // Only initialize if config looks real (not placeholder)
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig)
    database = getDatabase(app)
    console.log("Firebase Realtime Database connected")
  } else {
    console.log("Firebase placeholder active — using local mock data. Add your config in src/firebase.js to enable Realtime Database.")
  }
} catch (error) {
  console.warn("Firebase initialization skipped (placeholder config):", error.message)
}

export { app, database }
export default firebaseConfig
