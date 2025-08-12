import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAyoVDfroag3F9vH_Ls_3vad55weubEyDo",
  authDomain: "fluency-app-463902.firebaseapp.com",
  projectId: "fluency-app-463902",
  storageBucket: "fluency-app-463902.firebasestorage.app",
  messagingSenderId: "267373318894",
  appId: "1:267373318894:web:276a7fa3fafb682fb199ff",
  measurementId: "G-QPPCMEB26S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);