'use client';

import { useState } from 'react';
import ConsentFlow from './ConsentFlow';
import { setUserConsent } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingConsentProps {
  onComplete: () => void;
}

export default function OnboardingConsent({ onComplete }: OnboardingConsentProps) {
  const { user, loading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    
    try {
      console.log('🔄 Starting consent save process...');
      console.log('👤 User authenticated:', !!user, 'Loading:', loading);
      
      if (!user) {
        console.warn('⚠️ No authenticated user found, proceeding without saving consent');
        setTimeout(() => {
          console.log('🎯 Calling onComplete callback (no user)');
          onComplete();
        }, 500);
        return;
      }
      
      // Save consent to Firebase
      console.log('💾 Saving consent for user:', user.uid);
      await setUserConsent(true, true, '1.0');
      console.log('✅ Consent saved successfully');
      
      // Small delay for smooth UX
      setTimeout(() => {
        console.log('🎯 Calling onComplete callback');
        onComplete();
        setIsProcessing(false);
      }, 1500); // Longer delay for better UX before auto-advance
    } catch (error) {
      console.error('❌ Error saving consent:', error);
      // Still proceed even if save fails, but log it
      setTimeout(() => {
        console.log('⚠️ Proceeding despite consent save error');
        onComplete();
        setIsProcessing(false);
      }, 500);
    }
  };

  const handleReject = () => {
    // If user rejects, we should not let them proceed
    // In a real app, this might redirect to a "cannot continue" page
    // For now, we'll just show an alert and stay on the consent page
    alert('You must accept the privacy policy and terms of service to use MyMacros. You can close the app or refresh to start over.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your consent...</p>
        </div>
      </div>
    );
  }

  return (
    <ConsentFlow 
      onAccept={handleAccept}
      onReject={handleReject}
      showTitle={true}
    />
  );
} 