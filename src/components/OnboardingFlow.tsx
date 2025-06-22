'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Check, Sparkles, User, Target, BookOpen } from 'lucide-react';
import { OnboardingState, OnboardingStep } from '@/types';
import OnboardingProfile from './OnboardingProfile';
import OnboardingMacros from './OnboardingMacros';
import OnboardingWalkthrough from './OnboardingWalkthrough';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const ONBOARDING_STEPS: { id: OnboardingStep; title: string; description: string; icon: any }[] = [
  {
    id: 'profile',
    title: 'Personal Information',
    description: 'Basic details for accurate calculations',
    icon: User
  },
  {
    id: 'macros',
    title: 'Macro Targets',
    description: 'Set your daily nutritional goals',
    icon: Target
  },
  {
    id: 'walkthrough',
    title: 'Quick Overview',
    description: 'Learn the essential features',
    icon: BookOpen
  }
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

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
    setIsTransitioning(true);
    
    // Small delay for transition effect
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
    
    setIsTransitioning(false);
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev - 1);
        setIsStepComplete(completedSteps.includes(ONBOARDING_STEPS[currentStepIndex - 1].id));
        setIsTransitioning(false);
      }, 300);
    }
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'profile':
        return <OnboardingProfile 
          onComplete={() => handleStepComplete('profile')} 
          onSkip={async () => {
            // Allow skipping profile step and mark as complete
            // Set default goals when skipping profile
            try {
              const { setMacroGoals } = await import('@/lib/storage');
              await setMacroGoals({ calories: 2000, protein: 150, carbs: 200, fat: 70 });
            } catch (error) {
              console.error('Error setting default goals:', error);
            }
            handleStepComplete('profile');
          }}
        />;
      case 'macros':
        return <OnboardingMacros onComplete={() => handleStepComplete('macros')} />;
      case 'walkthrough':
        return <OnboardingWalkthrough onComplete={() => handleStepComplete('walkthrough')} hideNavigation={true} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      <div className="min-h-screen flex flex-col p-4 md:p-6 safe-area-inset">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col pt-2 md:pt-0">
          
          {/* Header */}
          <div className="text-center mb-4 md:mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 glass-card-compact mb-3 md:mb-4 text-xs md:text-sm">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <span className="text-gray-700 font-semibold">Welcome to MyMacros</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-3">
              Let&apos;s Get Started!
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
              In just 3 quick steps, we&apos;ll personalize your macro tracking experience
            </p>
          </div>

          {/* Progress Section */}
          <div className="mb-4 md:mb-8 animate-slide-up">
            <div className="flex items-center justify-center mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-4">
                {ONBOARDING_STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    {/* Step Circle */}
                    <div className="relative">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-3 transition-all duration-500 flex items-center justify-center relative overflow-hidden ${
                        index < currentStepIndex || completedSteps.includes(step.id)
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-400 shadow-lg shadow-emerald-500/30'
                          : index === currentStepIndex
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400 shadow-lg shadow-blue-500/30 animate-pulse'
                          : 'bg-gray-700/50 border-gray-600/50 backdrop-blur-sm'
                      }`}>
                        {index < currentStepIndex || completedSteps.includes(step.id) ? (
                          <Check className="w-5 h-5 md:w-7 md:h-7 text-white" />
                        ) : (
                          <step.icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                        )}
                        
                        {/* Animated ring for current step */}
                        {index === currentStepIndex && !completedSteps.includes(step.id) && (
                          <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 animate-ping" />
                        )}
                      </div>
                      
                      {/* Step label */}
                      <div className="absolute -bottom-10 md:-bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                        <div className="text-gray-300 font-semibold text-xs md:text-sm whitespace-nowrap">
                          {step.title.split(' ').slice(0, 2).join(' ')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Connector */}
                    {index < ONBOARDING_STEPS.length - 1 && (
                      <div className={`w-8 md:w-16 h-1 mx-2 md:mx-4 rounded-full transition-all duration-500 ${
                        index < currentStepIndex ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gray-600/50'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            

          </div>

          {/* Main Content */}
          <div className={`flex-1 transition-all duration-500 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="glass-card-strong max-w-3xl mx-auto animate-slide-up">
              {/* Current step header */}
              <div className="text-center mb-4 md:mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <currentStep.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h2 className="text-xl md:text-3xl font-black text-gray-800 mb-2 md:mb-3">
                  {currentStep.title}
                </h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md mx-auto px-4">
                  {currentStep.description}
                </p>
              </div>

              {/* Step content */}
              <div className="min-h-[300px] md:min-h-[400px]">
                {renderStepContent()}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 md:mt-8 max-w-3xl mx-auto w-full px-2">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="btn-pill-secondary disabled:opacity-30 disabled:cursor-not-allowed text-sm md:text-base px-4 py-2 md:px-6 md:py-3"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              Previous
            </button>

            {/* Skip button for faster progression */}
            {currentStep.id === 'walkthrough' && (
              <button
                onClick={onComplete}
                className="btn-pill-secondary text-sm md:text-base px-4 py-2 md:px-6 md:py-3"
              >
                Skip Tutorial
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={!isStepComplete}
              className="btn-pill-primary disabled:opacity-30 disabled:cursor-not-allowed text-sm md:text-base px-6 py-2 md:px-8 md:py-3"
            >
              {currentStepIndex === ONBOARDING_STEPS.length - 1 ? (
                <>
                  <span>Start Tracking</span>
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 