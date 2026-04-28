import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, query, where, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js'

const firebaseConfig = {
  apiKey: 'AIzaSyAPAW32lFxuvA40soqdtVl9etga-imXZ68',
  authDomain: 'dizmarx-b7946.firebaseapp.com',
  projectId: 'dizmarx-b7946',
  storageBucket: 'dizmarx-b7946.firebasestorage.app',
  messagingSenderId: '948559272978',
  appId: '1:948559272978:web:946fa0cf6486237cb54ccb'
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()
