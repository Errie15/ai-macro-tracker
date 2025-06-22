'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { OnboardingState, OnboardingStep } from '@/types';
import OnboardingProfile from './OnboardingProfile';
import OnboardingMacros from './OnboardingMacros';
import OnboardingWalkthrough from './OnboardingWalkthrough';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const ONBOARDING_STEPS: { id: OnboardingStep; title: string; description: string }[] = [
  {
    id: 'profile',
    title: 'Set Up Your Profile',
    description: 'Tell us about yourself to personalize your experience'
  },
  {
    id: 'macros',
    title: 'Configure Your Macros',
    description: 'Set your macro goals to track your nutrition effectively'
  },
  {
    id: 'walkthrough',
    title: 'Learn the App',
    description: 'Discover how to make the most of your macro tracking'
  }
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [isStepComplete, setIsStepComplete] = useState(false);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  // No theme forcing - use user's current theme

  const handleStepComplete = useCallback((stepId: OnboardingStep) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
    setIsStepComplete(true);
  }, [completedSteps]);

  // Auto-complete walkthrough step when it becomes active
  useEffect(() => {
    if (currentStep.id === 'walkthrough' && !completedSteps.includes('walkthrough')) {
      handleStepComplete('walkthrough');
    }
  }, [currentStep.id, completedSteps, handleStepComplete]);

  const handleNext = async () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setIsStepComplete(false);
    } else {
      // Final step completed - save to Firebase and localStorage
      const onboardingState: OnboardingState = {
        isCompleted: true,
        currentStep: ONBOARDING_STEPS.length,
        completedSteps: ONBOARDING_STEPS.map(step => step.id)
      };
      
      try {
        // Import setOnboardingState dynamically to avoid SSR issues
        const { setOnboardingState } = await import('@/lib/storage');
        await setOnboardingState(onboardingState);
      } catch (error) {
        console.error('Error saving onboarding state:', error);
        // Fallback to localStorage
        localStorage.setItem('onboarding-state', JSON.stringify(onboardingState));
      }
      
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setIsStepComplete(completedSteps.includes(ONBOARDING_STEPS[currentStepIndex - 1].id));
    }
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'profile':
        return <OnboardingProfile onComplete={() => handleStepComplete('profile')} />;
      case 'macros':
        return <OnboardingMacros onComplete={() => handleStepComplete('macros')} />;
      case 'walkthrough':
        return <OnboardingWalkthrough onComplete={() => handleStepComplete('walkthrough')} hideNavigation={true} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-display font-black text-primary">Welcome to Macro Tracker!</h1>
            <div className="text-sm text-secondary font-medium">
              Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  index < currentStepIndex || completedSteps.includes(step.id)
                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                    : index === currentStepIndex
                    ? 'border-blue-500 text-blue-600 bg-white shadow-md'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}>
                  {index < currentStepIndex || completedSteps.includes(step.id) ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                    index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card-strong mb-8 animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="text-hero font-black text-primary mb-3">{currentStep.title}</h2>
            <p className="text-secondary text-lg">{currentStep.description}</p>
          </div>

          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center px-4">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="btn-pill-secondary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm px-3 py-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!isStepComplete}
            className="btn-pill-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm px-3 py-2"
          >
            {currentStepIndex === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 