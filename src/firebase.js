// Firebase Realtime Database Configuration
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyB-IRi1zY2uxBjmzIHoSTSUFwRYaXHoQ1c",
  authDomain: "sicack-c8858.firebaseapp.com",
  databaseURL: "https://sicack-c8858-default-rtdb.firebaseio.com",
  projectId: "sicack-c8858",
  storageBucket: "sicack-c8858.firebasestorage.app",
  messagingSenderId: "389613827258",
  appId: "1:389613827258:web:b9832bffcc52eb6dcf3e83"
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export { app, database }
export default firebaseConfig
