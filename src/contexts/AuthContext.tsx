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

    // Enhanced redirect result checking for iOS PWA
    const checkRedirectResult = async () => {
      if (isHandlingRedirect) return;
      isHandlingRedirect = true;

      try {
        console.log('🔍 Checking for Google redirect result...');
        console.log('📱 Current URL:', window.location.href);
        console.log('🔧 Is PWA mode:', isPWA());
        console.log('📱 Is iOS:', isIOS());
        
        const { getRedirectResult } = await import('firebase/auth');
        
        // For iOS PWA, try multiple times with delays
        let result = null;
        let attempts = 0;
        const maxAttempts = isPWA() && isIOS() ? 5 : 1;
        
        while (!result && attempts < maxAttempts) {
          attempts++;
          console.log(`🔄 Redirect check attempt ${attempts}/${maxAttempts}`);
          
          try {
            result = await getRedirectResult(auth);
            if (result) break;
            
            // Wait before next attempt (only for iOS PWA)
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (attemptError) {
            console.log(`❌ Attempt ${attempts} failed:`, attemptError);
          }
        }
        
        if (result) {
          console.log('✅ Google login redirect successful:', result.user.email);
          console.log('🔧 User signed in via redirect:', result.user.displayName);
          
          // Clear any pending auth flags
          sessionStorage.removeItem('google_auth_pending');
          localStorage.removeItem('google_auth_pending');
          
          // For iOS PWA, force a complete reload to ensure proper state
          if (isPWA() && isIOS()) {
            console.log('📱 iOS PWA: Force reloading to ensure proper state');
            setTimeout(() => {
              window.location.href = window.location.origin;
            }, 100);
          }
        } else {
          console.log('ℹ️ No redirect result found');
          
          // Check if we were expecting a redirect
          const pending = sessionStorage.getItem('google_auth_pending') || localStorage.getItem('google_auth_pending');
          if (pending) {
            console.log('⚠️ Was expecting a redirect result but none found');
            
            // For iOS PWA, try alternative detection methods
            if (isPWA() && isIOS()) {
              console.log('📱 iOS PWA: Attempting alternative auth detection');
              
              // Check if we can detect a successful auth by checking current user
              setTimeout(async () => {
                if (auth.currentUser) {
                  console.log('✅ Found authenticated user via currentUser check');
                  sessionStorage.removeItem('google_auth_pending');
                  localStorage.removeItem('google_auth_pending');
                  window.location.reload();
                }
              }, 2000);
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
      } finally {
        isHandlingRedirect = false;
      }
    };

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 Auth state changed:', user ? user.email : 'No user');
      
      // If we have a user and there was a pending Google auth, clear the flags
      if (user) {
        const pending = sessionStorage.getItem('google_auth_pending') || localStorage.getItem('google_auth_pending');
        if (pending) {
          console.log('✅ User authenticated, clearing pending flags');
          sessionStorage.removeItem('google_auth_pending');
          localStorage.removeItem('google_auth_pending');
        }
      }
      
      setUser(user);
      setLoading(false);
    });

    // Check redirect result with multiple strategies
    checkRedirectResult();
    
    // Additional checks for iOS PWA
    if (isPWA() && isIOS()) {
      console.log('📱 iOS PWA detected - setting up enhanced redirect handling');
      
      // Check again after delays
      setTimeout(() => {
        console.log('⏰ Running delayed redirect check 1 for iOS PWA');
        checkRedirectResult();
      }, 1000);
      
      setTimeout(() => {
        console.log('⏰ Running delayed redirect check 2 for iOS PWA');
        checkRedirectResult();
      }, 3000);
      
      // Listen for visibility changes (when app comes back to foreground)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          console.log('👀 App visible again, checking for auth result');
          setTimeout(checkRedirectResult, 500);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        unsubscribe();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
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
      sessionStorage.setItem('google_auth_timestamp', Date.now().toString());
      localStorage.setItem('google_auth_timestamp', Date.now().toString());
      
      // Store the current URL to help with debugging
      sessionStorage.setItem('pre_auth_url', window.location.href);
      localStorage.setItem('pre_auth_url', window.location.href);
      
      try {
        console.log('📤 Initiating redirect...');
        
        // For iOS PWA, add a special parameter to help with redirect detection
        if (iosDevice) {
          provider.setCustomParameters({
            'prompt': 'select_account',
            'state': 'ios_pwa_redirect'
          });
        }
        
        await signInWithRedirect(auth, provider);
        console.log('✅ Redirect initiated successfully');
        
        // For iOS PWA, set up a fallback mechanism
        if (iosDevice) {
          console.log('📱 iOS PWA redirect initiated');
          
          // Set up a fallback timeout
          setTimeout(() => {
            const stillPending = localStorage.getItem('google_auth_pending');
            if (stillPending) {
              console.log('⚠️ Redirect seems to be taking too long, user might need to manually return');
            }
          }, 30000); // 30 seconds
        }
      } catch (error: any) {
        console.error('❌ Redirect initiation failed:', error);
        sessionStorage.removeItem('google_auth_pending');
        localStorage.removeItem('google_auth_pending');
        sessionStorage.removeItem('google_auth_timestamp');
        localStorage.removeItem('google_auth_timestamp');
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