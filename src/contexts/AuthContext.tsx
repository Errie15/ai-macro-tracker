'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshTrigger: number;
  triggerRefresh: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to detect if app is running in PWA/standalone mode
const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isHandlingRedirect = false;

    // Check for redirect result when app starts (for PWA Google login)
    const checkRedirectResult = async () => {
      if (isHandlingRedirect) return;
      isHandlingRedirect = true;

      try {
        console.log('🔍 Checking for Google redirect result...');
        const { getRedirectResult } = await import('firebase/auth');
        const result = await getRedirectResult(auth);
        
        if (result) {
          console.log('✅ Google login redirect successful:', result.user.email);
          console.log('🔧 User signed in via redirect:', result.user.displayName);
        } else {
          console.log('ℹ️ No redirect result found');
        }
      } catch (error: any) {
        console.error('❌ Google login redirect error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Handle specific redirect errors
        if (error.code === 'auth/popup-closed-by-user' || 
            error.code === 'auth/cancelled-popup-request') {
          console.log('ℹ️ User cancelled the sign-in process');
        } else if (error.code === 'auth/network-request-failed') {
          console.log('❌ Network error during redirect');
        } else {
          console.log('❌ Unknown redirect error:', error.code);
        }
      } finally {
        isHandlingRedirect = false;
      }
    };

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 Auth state changed:', user ? user.email : 'No user');
      setUser(user);
      setLoading(false);
    });

    // Check redirect result
    checkRedirectResult();

    return () => unsubscribe();
  }, []);

  const triggerRefresh = () => {
    console.log('🔄 Triggering refresh from AuthContext...');
    setRefreshTrigger(prev => prev + 1);
  };

  const signIn = async (email: string, password: string) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const { GoogleAuthProvider } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    
    // Add additional scopes and settings
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const pwaMode = isPWA();
    console.log('🚀 Starting Google sign-in in mode:', pwaMode ? 'PWA (redirect)' : 'Browser (popup)');
    
    if (pwaMode) {
      console.log('🔄 Using redirect flow for PWA mode');
      const { signInWithRedirect } = await import('firebase/auth');
      
      // Store that we're attempting a redirect
      sessionStorage.setItem('google_auth_pending', 'true');
      
      try {
        await signInWithRedirect(auth, provider);
        // Note: signInWithRedirect doesn't return a result immediately
        // The result is handled in the redirect callback
        console.log('✅ Redirect initiated successfully');
      } catch (error: any) {
        console.error('❌ Redirect initiation failed:', error);
        sessionStorage.removeItem('google_auth_pending');
        throw error;
      }
    } else {
      console.log('🔄 Using popup flow for browser mode');
      const { signInWithPopup } = await import('firebase/auth');
      
      try {
        const result = await signInWithPopup(auth, provider);
        console.log('✅ Popup sign-in successful:', result.user.email);
      } catch (error: any) {
        console.error('❌ Popup sign-in failed:', error);
        throw error;
      }
    }
  };

  const logout = async () => {
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      refreshTrigger, 
      triggerRefresh,
      signIn,
      signUp,
      signInWithGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 