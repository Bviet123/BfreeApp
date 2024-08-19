// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1icijD4kGrsFMU6QNZLpsWLdnKanEUwQ",
  authDomain: "bfree-5d04c.firebaseapp.com",
  databaseURL: "https://bfree-5d04c-default-rtdb.firebaseio.com",
  projectId: "bfree-5d04c",
  storageBucket: "bfree-5d04c.appspot.com",
  messagingSenderId: "125058010284",
  appId: "1:125058010284:web:2e6c1bfba8ce8501002309",
  measurementId: "G-CX33BXGV4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();


export { app, auth, googleProvider };

