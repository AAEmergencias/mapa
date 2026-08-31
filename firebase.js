// ✅ IMPORTAR desde CDN (OBLIGATORIO)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,

  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword

}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ✅ TU CONFIG (la que ya tienes)
const firebaseConfig = {
  apiKey: "AIzaSyARJ78KrXtTprE-T4DpnPIHUBGVPegZUDI",
  authDomain: "emergencias-central.firebaseapp.com",
  projectId: "emergencias-central",
  storageBucket: "emergencias-central.firebasestorage.app",
  messagingSenderId: "372579610673",
  appId: "1:372579610673:web:209dc38ede137df604e510"
};

// ✅ INICIALIZAR FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ EXPORTAR funciones
export {

  db,
  auth,

  collection,
  addDoc,
  getDocs,
  getDoc,

  doc,
  setDoc,
  updateDoc,
  deleteDoc,

  onSnapshot,

  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,

  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword

};
