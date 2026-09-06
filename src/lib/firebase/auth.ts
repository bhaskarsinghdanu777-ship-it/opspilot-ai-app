import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { handleFirestoreError, OperationType } from './firestore';
import { UserProfile, Business } from '@/src/types';

export function formatAuthError(error: unknown): string {
  if (!error) return 'An unexpected error occurred.';
  const code = (error as { code?: string })?.code || '';
  const message = (error as Error)?.message || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is invalid. Please check and try again.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Please log in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with numbers or symbols.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a few minutes before trying again.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by the browser. Please allow popups for this site.';
    case 'auth/unauthorized-domain':
      return 'Google authentication domain is not yet authorized in Firebase Console.';
    default:
      if (message.includes('missing-field')) {
        return 'Please fill in all required fields.';
      }
      return message || 'Authentication failed. Please try again.';
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  if (!email || !email.trim()) {
    throw new Error('missing-field: Email is required.');
  }
  if (!pass || !pass.trim()) {
    throw new Error('missing-field: Password is required.');
  }

  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return credential.user;
}

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  businessName: string = 'NovaMart Electronics',
  industry: string = 'Retail / Electronics'
): Promise<{ user: FirebaseUser; userProfile: UserProfile; business: Business }> {
  if (!email || !email.trim()) {
    throw new Error('missing-field: Email is required.');
  }
  if (!pass || !pass.trim()) {
    throw new Error('missing-field: Password is required.');
  }
  if (pass.length < 6) {
    const err = new Error('Password must be at least 6 characters.');
    (err as unknown as { code: string }).code = 'auth/weak-password';
    throw err;
  }

  // 1. Create Firebase Auth user
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const user = credential.user;

  // 2. Update display name in Firebase Auth
  const cleanName = displayName?.trim() || email.split('@')[0] || 'Store Manager';
  try {
    await updateProfile(user, { displayName: cleanName });
  } catch (err) {
    console.warn('Could not update profile displayName:', err);
  }

  const now = new Date().toISOString();
  // 3. Create Business workspace: businesses/{businessId}
  const cleanBusinessName = businessName?.trim() || 'NovaMart Electronics';
  const cleanIndustry = industry?.trim() || 'Retail / Electronics';
  const businessId = `biz_${user.uid.slice(0, 12)}`;

  const businessData: Business = {
    id: businessId,
    name: cleanBusinessName,
    industry: cleanIndustry,
    ownerId: user.uid,
    createdAt: now,
  };

  const businessPath = `businesses/${businessId}`;
  try {
    await setDoc(doc(db, 'businesses', businessId), businessData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, businessPath);
  }

  // 4. Create User document: users/{userId}
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || email.trim(),
    displayName: cleanName,
    businessId: businessId,
    createdAt: now,
  };

  const userPath = `users/${user.uid}`;
  try {
    await setDoc(doc(db, 'users', user.uid), userProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, userPath);
  }

  return { user, userProfile, business: businessData };
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
