'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showIOSPWAHelp, setShowIOSPWAHelp] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();

  // Debug information gathering
  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true ||
                  document.referrer.includes('android-app://');
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    const debugData = [
      `🔧 PWA Mode: ${isPWA}`,
      `📱 iOS Device: ${isIOS}`,
      `🌐 Current URL: ${window.location.href}`,
      `🏠 Origin: ${window.location.origin}`,
      `📊 User Agent: ${navigator.userAgent.substring(0, 50)}...`
    ];
    
    // Check for pending auth
    const pending = sessionStorage.getItem('google_auth_pending') || localStorage.getItem('google_auth_pending');
    if (pending) {
      debugData.push(`⏳ Pending Google Auth: ${pending}`);
      
      // Check timestamp to see how long it's been pending
      const timestamp = localStorage.getItem('google_auth_timestamp');
      if (timestamp) {
        const minutes = Math.floor((Date.now() - parseInt(timestamp)) / (1000 * 60));
        debugData.push(`⏰ Auth pending for: ${minutes} minutes`);
        
        // Show iOS PWA help if it's been pending for more than 1 minute
        if (isPWA && isIOS && minutes > 1) {
          setShowIOSPWAHelp(true);
        }
      }
    }
    
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString()) {
      debugData.push(`📝 URL Params: ${urlParams.toString()}`);
    }
    
    setDebugInfo(debugData);
    
    // Auto-clear old debugging flags after 5 minutes
    const cleanup = setTimeout(() => {
      sessionStorage.removeItem('google_auth_pending');
      localStorage.removeItem('google_auth_pending');
      sessionStorage.removeItem('google_auth_timestamp');
      localStorage.removeItem('google_auth_timestamp');
      sessionStorage.removeItem('pre_auth_url');
      localStorage.removeItem('pre_auth_url');
    }, 5 * 60 * 1000);
    
    return () => clearTimeout(cleanup);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
    } catch (error: any) {
      console.error('Email/Password error:', error);
      let errorMessage = 'An error occurred';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('🚀 Starting Google sign-in...');
    setError('');
    setGoogleLoading(true);
    setShowIOSPWAHelp(false);
    
    try {
      console.log('📞 Calling signInWithGoogle...');
      await signInWithGoogle();
      console.log('✅ Google sign-in call completed');
      
      // For iOS PWA, set up help display after delay
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    (window.navigator as any).standalone === true;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isPWA && isIOS) {
        setTimeout(() => {
          const stillPending = localStorage.getItem('google_auth_pending');
          if (stillPending) {
            setShowIOSPWAHelp(true);
          }
        }, 10000); // Show help after 10 seconds
      }
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Google sign-in failed';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/internal-error') {
        errorMessage = 'Internal error. Please try again.';
      } else if (error.message) {
        errorMessage = `Google sign-in error: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const clearError = () => {
    if (error) setError('');
  };

  const clearDebugFlags = () => {
    sessionStorage.removeItem('google_auth_pending');
    localStorage.removeItem('google_auth_pending');
    sessionStorage.removeItem('google_auth_timestamp');
    localStorage.removeItem('google_auth_timestamp');
    sessionStorage.removeItem('pre_auth_url');
    localStorage.removeItem('pre_auth_url');
    console.log('🧹 Debug flags cleared');
    window.location.reload();
  };

  const refreshApp = () => {
    console.log('🔄 Manual app refresh triggered');
    window.location.href = window.location.origin;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '32px',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            {isLogin ? 'Sign in to your account' : 'Get started with your account'}
          </p>
        </div>

        {/* iOS PWA Help */}
        {showIOSPWAHelp && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #93c5fd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              color: '#1d4ed8',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              📱 iOS PWA Sign-in Help
            </h3>
            <p style={{
              color: '#1e40af',
              fontSize: '13px',
              marginBottom: '12px',
              lineHeight: '1.4'
            }}>
              If you are stuck after signing in with Google, try manually refreshing the app by tapping the button below.
            </p>
            <button
              onClick={refreshApp}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              🔄 Refresh App
            </button>
            <button
              onClick={() => setShowIOSPWAHelp(false)}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Debug Info */}
        {debugInfo.length > 0 && (
          <details style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '12px'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
              🔧 Debug Information
            </summary>
            {debugInfo.map((info, index) => (
              <div key={index} style={{ marginBottom: '4px', fontFamily: 'monospace' }}>
                {info}
              </div>
            ))}
            <button
              onClick={clearDebugFlags}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                fontSize: '10px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Debug Flags & Reload
            </button>
          </details>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{
              color: '#dc2626',
              fontSize: '14px',
              margin: '0'
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Google Sign In - Moved to top */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#374151',
            backgroundColor: 'white',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            outline: 'none',
            marginBottom: '24px',
            opacity: (loading || googleLoading) ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading && !googleLoading) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !googleLoading) {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
        >
          {googleLoading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #d1d5db',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Connecting...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            flex: 1,
            height: '1px',
            backgroundColor: '#e5e7eb'
          }}></div>
          <span style={{
            padding: '0 16px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            or
          </span>
          <div style={{
            flex: 1,
            height: '1px',
            backgroundColor: '#e5e7eb'
          }}></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              placeholder="Enter your email"
              autoComplete="email"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#111827',
                outline: 'none',
                transition: 'border-color 0.2s',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              placeholder="Enter your password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#111827',
                outline: 'none',
                transition: 'border-color 0.2s',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: (loading || googleLoading) ? '#9ca3af' : '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (!loading && !googleLoading) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !googleLoading) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
            }}
            style={{
              color: '#3b82f6',
              fontSize: '14px',
              fontWeight: '500',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              outline: 'none'
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>

      {/* CSS Animation for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 