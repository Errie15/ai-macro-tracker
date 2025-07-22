'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Check, Sparkles, User, Target, BookOpen, UserCheck, Brain, Shield } from 'lucide-react';
import { OnboardingState, OnboardingStep } from '@/types';
import OnboardingConsent from './OnboardingConsent';
import OnboardingUsername from './OnboardingUsername';
import OnboardingMacros from './OnboardingMacros';
import OnboardingWalkthrough from './OnboardingWalkthrough';
import OnboardingProfile from './OnboardingProfile';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const ONBOARDING_STEPS: { id: OnboardingStep; title: string; description: string; icon: any }[] = [
  {
    id: 'consent',
    title: 'Privacy & Terms',
    description: 'Review and accept our policies',
    icon: Shield
  },
  {
    id: 'username',
    title: 'Choose Username',
    description: 'Set your unique identifier',
    icon: UserCheck
  },
  {
    id: 'macros',
    title: 'Macro Goals',
    description: 'Set your daily nutritional targets', 
    icon: Target
  },
  {
    id: 'tutorial',
    title: 'Tutorial',
    description: 'Learn the essential features',
    icon: BookOpen
  },
  {
    id: 'personal',
    title: 'Personal Info',
    description: 'Help us personalize your experience',
    icon: User
  },
  {
    id: 'macros-suggested',
    title: 'Suggested Goals',
    description: 'AI-recommended macro targets',
    icon: Brain
  },
  {
    id: 'tour',
    title: 'Take a Tour',
    description: 'Explore the app features',
    icon: Sparkles
  }
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  const handleStepComplete = useCallback((stepId: OnboardingStep) => {
    console.log('🎯 Step completed:', stepId);
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
    setIsStepComplete(true);
  }, [completedSteps]);

  // Auto-complete tutorial step when it becomes active
  useEffect(() => {
    // Remove auto-completion - let users see the tutorial content
    // if (currentStep.id === 'tutorial' && !completedSteps.includes('tutorial')) {
    //   handleStepComplete('tutorial');
    // }
  }, [currentStep.id, completedSteps, handleStepComplete]);

  // Auto-advance from consent step when completed
  useEffect(() => {
    if (currentStep.id === 'consent' && completedSteps.includes('consent') && isStepComplete) {
      console.log('🔄 Auto-advancing from consent step...');
      setTimeout(() => {
        if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentStepIndex(prev => prev + 1);
            setIsStepComplete(false);
            setIsTransitioning(false);
          }, 300);
        }
      }, 1000); // Give user time to see confirmation
    }
  }, [currentStep.id, completedSteps, isStepComplete, currentStepIndex]);

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

  // Handle jumping to personal info step from macros
  const handleJumpToPersonal = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      const personalIndex = ONBOARDING_STEPS.findIndex(step => step.id === 'personal');
      setCurrentStepIndex(personalIndex);
      setIsStepComplete(false);
      setIsTransitioning(false);
    }, 300);
  };

  // Handle returning to macros with suggestions
  const handleReturnToMacrosWithSuggestions = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      const macrosIndex = ONBOARDING_STEPS.findIndex(step => step.id === 'macros-suggested');
      setCurrentStepIndex(macrosIndex);
      setIsStepComplete(false);
      setIsTransitioning(false);
    }, 300);
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'consent':
        return <OnboardingConsent onComplete={() => handleStepComplete('consent')} />;
      case 'username':
        return <OnboardingUsername onComplete={() => handleStepComplete('username')} />;
      case 'macros':
        return <OnboardingMacros 
          onComplete={() => handleStepComplete('macros')} 
          onNeedHelp={handleJumpToPersonal}
          showHelpButton={true}
        />;
      case 'tutorial':
        return <OnboardingWalkthrough onComplete={() => handleStepComplete('tutorial')} hideNavigation={false} />;
      case 'personal':
        return <OnboardingProfile 
          onComplete={handleReturnToMacrosWithSuggestions}
          showReturnToMacros={true}
        />;
      case 'macros-suggested':
        return <OnboardingMacros 
          onComplete={() => handleStepComplete('macros-suggested')} 
          showSuggested={true}
          showHelpButton={false}
        />;
      case 'tour':
        return <OnboardingTour onComplete={() => handleStepComplete('tour')} onSkip={() => handleStepComplete('tour')} />;
      default:
        return null;
    }
  };

  // Tour component
  const OnboardingTour = ({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) => {
    const [showTour, setShowTour] = useState(false);

    if (showTour) {
      return <OnboardingWalkthrough onComplete={onComplete} hideNavigation={false} />;
    }

    return (
      <div className="w-full max-w-3xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">You&apos;re All Set!</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Would you like to take a quick tour to learn how to make the most of your macro tracker?
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tour option */}
            <div className="p-6 rounded-xl border-2 border-blue-200 bg-blue-50 hover:border-blue-300 transition-all cursor-pointer"
                 onClick={() => setShowTour(true)}>
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Yes, Show Me Around</h4>
              <p className="text-gray-600 text-sm">
                Learn the best tips and tricks to track your macros effectively
              </p>
              <div className="mt-4 text-blue-600 font-semibold text-sm">~ 2 minutes</div>
            </div>

            {/* Skip option */}
            <div className="p-6 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                 onClick={onSkip}>
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Skip Tour</h4>
              <p className="text-gray-600 text-sm">
                Jump straight into tracking - you can always access help later
              </p>
              <div className="mt-4 text-gray-600 font-semibold text-sm">Start immediately</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      <div className="min-h-screen flex flex-col p-4 md:p-6 safe-area-inset">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col pt-2 md:pt-0">
          
          {/* Header */}
          <div className="text-center mb-4 md:mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-3 md:mb-4 text-xs md:text-sm">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <span className="text-white font-semibold">Welcome to MyMacros</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-3">
              Let&apos;s Get Started!
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
              In just 5 quick steps, we&apos;ll personalize your macro tracking experience
            </p>
          </div>

          {/* Progress Section - Simplified circles */}
          <div className="mb-4 md:mb-8 animate-slide-up">
            <div className="flex items-center justify-center mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                {ONBOARDING_STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    {/* Simple Circle Indicator */}
                    <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full transition-all duration-500 ${
                      index < currentStepIndex || completedSteps.includes(step.id)
                        ? 'bg-green-500'
                        : index === currentStepIndex
                        ? 'bg-blue-500'
                        : 'bg-gray-600'
                    }`} />
                    
                    {/* Connector */}
                    {index < ONBOARDING_STEPS.length - 1 && (
                      <div className={`w-6 md:w-12 h-1 mx-1 md:mx-2 rounded-full transition-all duration-500 ${
                        index < currentStepIndex ? 'bg-green-500' : 'bg-gray-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Remove glass effect */}
          <div className={`flex-1 transition-all duration-500 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="bg-white rounded-3xl shadow-xl max-w-3xl mx-auto animate-slide-up p-6 md:p-8">
              {/* Current step header */}
              <div className="text-center mb-4 md:mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center`}>
                    <currentStep.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{currentStep.title}</h2>
                    <p className="text-gray-600 text-sm md:text-base">{currentStep.description}</p>
                  </div>
                </div>
              </div>

              {/* Step content */}
              <div className="mb-6">
                {renderStepContent()}
              </div>

              {/* Navigation */}
              {currentStep.id !== 'personal' && currentStep.id !== 'consent' && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStepIndex === 0}
                    className={`btn-pill-secondary group ${currentStepIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Previous</span>
                  </button>

                  <div className="text-center text-sm text-gray-500">
                    Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!isStepComplete}
                    className={`btn-pill-primary group ${!isStepComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>{currentStepIndex === ONBOARDING_STEPS.length - 1 ? 'Complete' : 'Next'}</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 