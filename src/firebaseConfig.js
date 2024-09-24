import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";
import { getStorage } from "firebase/storage";

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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const database = getDatabase(app);
const storage = getStorage(app);


export { app, auth, googleProvider, database, storage };

