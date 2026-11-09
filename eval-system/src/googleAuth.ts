import { getApp, getApps, initializeApp } from 'firebase/app'
import type { FirebaseOptions } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isGoogleSignInConfigured = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.trim().length > 0
)

function getFirebaseAuth() {
  if (!isGoogleSignInConfigured) {
    throw new Error('Google sign-in is not configured. Add your Firebase web app settings to eval-system/.env.local, then restart the dev server.')
  }
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return getAuth(app)
}

function studentProfile(user: User): { name: string; email: string } {
  const email = user.email?.trim().toLowerCase()
  if (!email) throw new Error('Google did not provide an email address. Please use a Google account with an email.')
  return { name: user.displayName?.trim() || email.split('@')[0], email }
}

export async function signInWithGoogleProvider(): Promise<{ name: string; email: string }> {
  try {
    const result = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())
    return studentProfile(result.user)
  } catch (reason) {
    if (reason && typeof reason === 'object' && 'code' in reason) {
      if (reason.code === 'auth/popup-closed-by-user') {
        throw new Error('Google sign-in was cancelled.')
      }
      if (reason.code === 'auth/unauthorized-domain') {
        throw new Error('This site is not authorized for Google sign-in. Add localhost, 127.0.0.1, and your deployed domain in Firebase Authentication settings.')
      }
      if (reason.code === 'auth/operation-not-allowed') {
        throw new Error('Google sign-in is disabled for this Firebase project. Enable the Google provider in Firebase Authentication settings.')
      }
      if (reason.code === 'auth/popup-blocked') {
        throw new Error('The Google sign-in popup was blocked. Allow popups for this site and try again.')
      }
    }
    throw reason
  }
}

export async function signOutGoogleProvider(): Promise<void> {
  if (!isGoogleSignInConfigured) return
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  await signOut(getAuth(app))
}
