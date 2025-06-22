'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import SignIn from './SignIn';
import OnboardingFlow from './OnboardingFlow';
import { isUserOnboarded } from '@/lib/storage';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user && !loading) {
        try {
          const isOnboarded = await isUserOnboarded();
          setOnboardingComplete(isOnboarded);
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // Default to not onboarded to be safe
          setOnboardingComplete(false);
        } finally {
          setCheckingOnboarding(false);
        }
      } else if (!loading && !user) {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [user, loading]);

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
  };

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  if (onboardingComplete === false) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <>{children}</>;
} 