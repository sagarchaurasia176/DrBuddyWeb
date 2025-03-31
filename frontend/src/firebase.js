import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDyP2gfjbQ_bo2tcTbiKM3W6H4HiflwJxU",
  authDomain: "drbuddy-acebe.firebaseapp.com",
  projectId: "drbuddy-acebe",
  storageBucket: "drbuddy-acebe.appspot.com",
  messagingSenderId: "567868386256",
  appId: "1:567868386256:web:c22e2f3aa3cf2ad3bde7d5",
  measurementId: "G-QQ6RVG1H13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
