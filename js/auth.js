import { auth, db, googleProvider, githubProvider } from './firebase.js'
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    await saveUserToFirestore(user)
    localStorage.setItem('dizmarx_user', JSON.stringify(user))
    window.location.hash = 'dashboard'
  } catch (error) { console.error(error) }
}

export async function loginWithGitHub() {
  try {
    const result = await signInWithPopup(auth, githubProvider)
    const user = result.user
    await saveUserToFirestore(user)
    localStorage.setItem('dizmarx_user', JSON.stringify(user))
    window.location.hash = 'dashboard'
  } catch (error) { console.error(error) }
}

async function saveUserToFirestore(user) {
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || '',
      avatar: user.photoURL || '',
      createdAt: new Date().toISOString()
    })
  }
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem('dizmarx_user') || 'null')
}

export function logout() {
  localStorage.removeItem('dizmarx_user')
  window.location.hash = ''
  window.location.reload()
}
