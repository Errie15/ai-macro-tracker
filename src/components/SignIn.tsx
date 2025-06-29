'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || (!isForgotPassword && !password.trim())) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        // Handle password reset
        const { sendPasswordResetEmail } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase');
        
        await sendPasswordResetEmail(auth, email.trim());
        setSuccess('Password reset email sent! Check your inbox.');
        setEmail('');
      } else if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
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
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    if (error) setError('');
    if (success) setSuccess('');
  };

  const resetForm = () => {
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgb(17, 24, 39) 0%, rgb(31, 41, 55) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
    }}>
      <div style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '32px',
            marginBottom: '12px'
          }}>
            🤖
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'rgb(255, 255, 255)',
            marginBottom: '8px',
            margin: '0'
          }}>
            MyMacros
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.87)',
            margin: '8px 0 0 0'
          }}>
            {isForgotPassword 
              ? 'Reset your password' 
              : isLogin 
                ? 'Welcome back to your macro tracker' 
                : 'Start your macro tracking journey'
            }
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <p style={{
              color: 'rgb(34, 197, 94)',
              fontSize: '14px',
              margin: '0',
              fontWeight: '500'
            }}>
              {success}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <p style={{
              color: 'rgb(239, 68, 68)',
              fontSize: '14px',
              margin: '0',
              fontWeight: '500'
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.87)',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearMessages();
              }}
              placeholder="Enter your email"
              autoComplete="email"
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgb(255, 255, 255)',
                outline: 'none',
                transition: 'all 0.2s ease',
                WebkitAppearance: 'none',
                appearance: 'none',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            />
          </div>

          {!isForgotPassword && (
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.87)',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearMessages();
                }}
                placeholder="Enter your password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgb(255, 255, 255)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '700',
              color: 'white',
              background: loading 
                ? 'rgba(107, 114, 128, 0.8)' 
                : 'linear-gradient(to right, #0ea5e9, #d946ef)',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none',
              transform: loading ? 'scale(1)' : 'scale(1)',
              boxShadow: loading 
                ? 'none' 
                : '0 4px 12px rgba(0, 0, 0, 0.15)',
              minHeight: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.background = 'linear-gradient(to right, #0284c7, #c026d3)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'linear-gradient(to right, #0ea5e9, #d946ef)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Loading...
              </>
            ) : (
              <>
                {isForgotPassword ? '📧 Send Reset Email' : isLogin ? '🔑 Sign In' : '🚀 Create Account'}
              </>
            )}
          </button>
        </form>

        {/* Navigation Links */}
        <div style={{ textAlign: 'center', fontSize: '14px' }}>
          {isForgotPassword ? (
            <button
              onClick={() => {
                setIsForgotPassword(false);
                resetForm();
              }}
              style={{
                color: 'rgba(255, 255, 255, 0.87)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                outline: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ← Back to sign in
            </button>
          ) : (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    resetForm();
                  }}
                  style={{
                    color: 'rgba(255, 255, 255, 0.87)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
              
              {isLogin && (
                <button
                  onClick={() => {
                    setIsForgotPassword(true);
                    resetForm();
                  }}
                  style={{
                    color: 'rgba(255, 255, 255, 0.70)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    outline: 'none',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Forgot your password?
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.54);
        }
      `}</style>
    </div>
  );
} 