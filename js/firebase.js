// ==================================================
// FIREBASE KONFIGURATION
// ==================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==================================================
// FIREBASE CONFIG
// ==================================================

const firebaseConfig = {

  apiKey:
    "AIzaSyAiCDS9EHVWQ041trH8kgwxHZUYJnqjCB8",

  authDomain:
    "osotgm.firebaseapp.com",

  projectId:
    "osotgm",

  storageBucket:
    "osotgm.firebasestorage.app",

  messagingSenderId:
    "723502696230",

  appId:
    "1:723502696230:web:90bc11be79961a1d3ae3e7",

  measurementId:
    "G-CXWEC1D7GE"

};


// ==================================================
// FIREBASE INITIALISIEREN
// ==================================================

const app =
  initializeApp(firebaseConfig);


// ==================================================
// AUTH
// ==================================================

const auth =
  getAuth(app);


// ==================================================
// FIRESTORE
// ==================================================

const db =
  getFirestore(app);


// ==================================================
// EXPORTS
// ==================================================

export {
  app,
  auth,
  db
};
