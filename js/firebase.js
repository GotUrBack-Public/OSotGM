// ==================================================
// FIREBASE KONFIGURATION
// ==================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAiCDS9EHVWQ041trH8kgwxHZUYJnqjCB8",
  authDomain: "osotgm.firebaseapp.com",
  projectId: "osotgm",
  storageBucket: "osotgm.firebasestorage.app",
  messagingSenderId: "723502696230",
  appId: "1:723502696230:web:90bc11be79961a1d3ae3e7",
  measurementId: "G-CXWEC1D7GE"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export {
  app,
  auth,
  db
};



