import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  FIREBASE_PROJECT_ID,
  OperationType,
  handleFirestoreError,
} from '../firebase';

export interface CustomerProfile {
  uid: string;
  email: string;
  displayName: string;
  defaultBusinessName?: string;
  defaultLocation?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface AuthContextValue {
  user: User | null;
  profile: CustomerProfile | null;
  authLoading: boolean;
  isAdmin: boolean;
  hasAdminClaim: boolean;
  refreshAdminClaims: () => Promise<boolean>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
    defaultBusinessName?: string
  ) => Promise<{ verificationSent: boolean }>;
  logInWithEmail: (email: string, password: string) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshVerificationStatus: () => Promise<boolean>;
  updateCustomerProfile: (updates: {
    displayName: string;
    defaultBusinessName?: string;
    defaultLocation?: string;
  }) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function formatFirebaseAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/operation-not-allowed':
      return `Email/Password sign-in is not yet enabled in Firebase Console for project "${FIREBASE_PROJECT_ID}". Open Firebase Console → Authentication → Sign-in method and enable Email/Password.`;
    case 'auth/unauthorized-domain':
      return `This domain is not authorized for Firebase Authentication yet. Add "${window.location.hostname}" under Firebase Console → Authentication → Settings → Authorized domains.`;
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in or reset your password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Please choose a stronger password (at least 6 characters).';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please double-check and try again, or reset your password.';
    case 'auth/too-many-requests':
      return 'Too many attempts detected. Please wait a couple of minutes before trying again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in window was closed before completing login.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Allow popups or use Email/Password login.';
    case 'auth/network-request-failed':
      return 'Network error communicating with Firebase Authentication. Check your internet connection and retry.';
    default:
      return error?.message || 'Authentication could not be completed. Please try again.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAdminClaim, setHasAdminClaim] = useState(false);

  const loadUserProfileAndRole = useCallback(async (currentUser: User | null) => {
    if (!currentUser || !currentUser.emailVerified) {
      setProfile(null);
      setIsAdmin(false);
      setHasAdminClaim(false);
      return;
    }

    // Read Firebase Auth custom claim (server-assigned via Firebase Admin SDK)
    let claimAdmin = false;
    try {
      const tokenResult = await currentUser.getIdTokenResult();
      claimAdmin = tokenResult.claims?.admin === true && currentUser.emailVerified === true;
    } catch {
      claimAdmin = false;
    }
    setHasAdminClaim(claimAdmin);

    // Phase 1 transition: preserve existing admin fallback until custom claim is assigned and verified;
    // legacy email and /admins/{uid} checks will be removed in Phase 2.
    let adminFlag =
      claimAdmin || (currentUser.email === 'esindunonye@gmail.com' && currentUser.emailVerified);
    try {
      const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
      if (adminSnap.exists()) {
        adminFlag = true;
      }
    } catch {
      // Non-admins receive permission-denied or not-found
    }
    setIsAdmin(adminFlag);

    // Load or initialize private customer profile
    const profilePath = `users/${currentUser.uid}/private/profile`;
    try {
      const profileRef = doc(db, 'users', currentUser.uid, 'private', 'profile');
      const snap = await getDoc(profileRef);
      if (snap.exists()) {
        setProfile(snap.data() as CustomerProfile);
      } else {
        const initialProfile: CustomerProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'SME Owner',
          defaultBusinessName: '',
          defaultLocation: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(profileRef, initialProfile);
        setProfile({
          ...initialProfile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Could not load/init private profile yet:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadUserProfileAndRole(firebaseUser);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setHasAdminClaim(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [loadUserProfileAndRole]);

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    defaultBusinessName = ''
  ): Promise<{ verificationSent: boolean }> => {
    const cleanEmail = email.trim();
    const cleanName = displayName.trim() || cleanEmail.split('@')[0];
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    await updateProfile(cred.user, { displayName: cleanName });

    if (defaultBusinessName.trim()) {
      try {
        sessionStorage.setItem(`pending_biz_${cred.user.uid}`, defaultBusinessName.trim());
      } catch {
        // ignore sessionStorage failure
      }
    }

    await sendEmailVerification(cred.user);
    setUser(auth.currentUser);
    return { verificationSent: true };
  };

  const logInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const logInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No signed-in user found.');
    }
    await sendEmailVerification(auth.currentUser);
  };

  const refreshVerificationStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    const refreshed = auth.currentUser;
    setUser(refreshed ? ({ ...refreshed } as User) : null);
    if (refreshed?.emailVerified) {
      // Apply any pending defaultBusinessName once verified
      let pendingBiz = '';
      try {
        pendingBiz = sessionStorage.getItem(`pending_biz_${refreshed.uid}`) || '';
        sessionStorage.removeItem(`pending_biz_${refreshed.uid}`);
      } catch {
        // ignore
      }
      await loadUserProfileAndRole(refreshed);
      if (pendingBiz) {
        const profileRef = doc(db, 'users', refreshed.uid, 'private', 'profile');
        try {
          await updateDoc(profileRef, {
            defaultBusinessName: pendingBiz.slice(0, 160),
            updatedAt: serverTimestamp(),
          });
        } catch {
          // non-blocking
        }
      }
      return true;
    }
    return false;
  };

  const refreshAdminClaims = async (): Promise<boolean> => {
    if (!auth.currentUser) {
      setHasAdminClaim(false);
      return false;
    }
    await auth.currentUser.reload();
    const tokenResult = await auth.currentUser.getIdTokenResult(true);
    const verifiedAndClaimed =
      auth.currentUser.emailVerified === true && tokenResult.claims?.admin === true;
    setHasAdminClaim(verifiedAndClaimed);
    if (verifiedAndClaimed) {
      setIsAdmin(true);
    }
    return verifiedAndClaimed;
  };

  const updateCustomerProfile = async (updates: {
    displayName: string;
    defaultBusinessName?: string;
    defaultLocation?: string;
  }) => {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to update account settings.');
    }
    if (!auth.currentUser.emailVerified) {
      throw new Error('Please verify your email address before saving profile updates.');
    }

    const cleanName = updates.displayName.trim().slice(0, 120);
    if (!cleanName) {
      throw new Error('Display name cannot be empty.');
    }

    await updateProfile(auth.currentUser, { displayName: cleanName });

    const path = `users/${auth.currentUser.uid}/private/profile`;
    try {
      const profileRef = doc(db, 'users', auth.currentUser.uid, 'private', 'profile');
      await updateDoc(profileRef, {
        displayName: cleanName,
        defaultBusinessName: (updates.defaultBusinessName || '').trim().slice(0, 160),
        defaultLocation: (updates.defaultLocation || '').trim().slice(0, 160),
        updatedAt: serverTimestamp(),
      });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              displayName: cleanName,
              defaultBusinessName: (updates.defaultBusinessName || '').trim().slice(0, 160),
              defaultLocation: (updates.defaultLocation || '').trim().slice(0, 160),
            }
          : prev
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const logOut = async () => {
    await signOut(auth);
    setProfile(null);
    setIsAdmin(false);
    setHasAdminClaim(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authLoading,
        isAdmin,
        hasAdminClaim,
        refreshAdminClaims,
        signUpWithEmail,
        logInWithEmail,
        logInWithGoogle,
        sendPasswordReset,
        resendVerificationEmail,
        refreshVerificationStatus,
        updateCustomerProfile,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
