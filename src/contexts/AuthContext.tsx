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

// Function to detect iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
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
        console.log('📱 Current URL:', window.location.href);
        console.log('🔧 Is PWA mode:', isPWA());
        console.log('📱 Is iOS:', isIOS());
        
        const { getRedirectResult } = await import('firebase/auth');
        const result = await getRedirectResult(auth);
        
        if (result) {
          console.log('✅ Google login redirect successful:', result.user.email);
          console.log('🔧 User signed in via redirect:', result.user.displayName);
          
          // Clear any pending auth flags
          sessionStorage.removeItem('google_auth_pending');
          localStorage.removeItem('google_auth_pending');
          
          // Force a refresh to ensure the app updates
          console.log('🔄 Forcing app refresh after successful auth');
          window.location.reload();
        } else {
          console.log('ℹ️ No redirect result found');
          
          // Check if we were expecting a redirect
          const pending = sessionStorage.getItem('google_auth_pending') || localStorage.getItem('google_auth_pending');
          if (pending) {
            console.log('⚠️ Was expecting a redirect result but none found');
            console.log('🔍 Checking URL parameters...');
            
            const urlParams = new URLSearchParams(window.location.search);
            const hasAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('error');
            
            if (hasAuthParams) {
              console.log('📝 Found auth parameters in URL:', Object.fromEntries(urlParams.entries()));
            } else {
              console.log('❌ No auth parameters found in URL');
            }
          }
        }
      } catch (error: any) {
        console.error('❌ Google login redirect error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Clear pending flags on error
        sessionStorage.removeItem('google_auth_pending');
        localStorage.removeItem('google_auth_pending');
        
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

    // Check redirect result immediately and after a delay (for iOS PWA)
    checkRedirectResult();
    
    // Additional check after a delay for iOS PWA mode
    if (isPWA() && isIOS()) {
      console.log('📱 iOS PWA detected - setting up delayed redirect check');
      setTimeout(() => {
        console.log('⏰ Running delayed redirect check for iOS PWA');
        checkRedirectResult();
      }, 1000);
    }

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
    const iosDevice = isIOS();
    
    console.log('🚀 Starting Google sign-in...');
    console.log('🔧 PWA mode:', pwaMode);
    console.log('📱 iOS device:', iosDevice);
    console.log('🌐 Current URL:', window.location.href);
    console.log('🏠 Origin:', window.location.origin);
    
    if (pwaMode) {
      console.log('🔄 Using redirect flow for PWA mode');
      const { signInWithRedirect } = await import('firebase/auth');
      
      // Store that we're attempting a redirect (use both storage types for iOS)
      sessionStorage.setItem('google_auth_pending', 'true');
      localStorage.setItem('google_auth_pending', 'true');
      
      // Store the current URL to help with debugging
      sessionStorage.setItem('pre_auth_url', window.location.href);
      localStorage.setItem('pre_auth_url', window.location.href);
      
      try {
        console.log('📤 Initiating redirect...');
        await signInWithRedirect(auth, provider);
        console.log('✅ Redirect initiated successfully');
        
        // For iOS PWA, we might need to handle this differently
        if (iosDevice) {
          console.log('📱 iOS PWA redirect initiated - user should return automatically');
        }
      } catch (error: any) {
        console.error('❌ Redirect initiation failed:', error);
        sessionStorage.removeItem('google_auth_pending');
        localStorage.removeItem('google_auth_pending');
        sessionStorage.removeItem('pre_auth_url');
        localStorage.removeItem('pre_auth_url');
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