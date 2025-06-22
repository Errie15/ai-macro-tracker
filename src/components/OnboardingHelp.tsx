'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Check, X } from 'lucide-react';
import { OnboardingStep } from '@/types';
import OnboardingMacros from './OnboardingMacros';
import OnboardingWalkthrough from './OnboardingWalkthrough';

interface OnboardingHelpProps {
  onComplete: () => void;
}

const HELP_STEPS: { id: OnboardingStep; title: string; description: string }[] = [
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

export default function OnboardingHelp({ onComplete }: OnboardingHelpProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [isStepComplete, setIsStepComplete] = useState(false);

  const currentStep = HELP_STEPS[currentStepIndex];

  // Use user's current theme

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

  const handleNext = () => {
    if (currentStepIndex < HELP_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      // Check if the next step is already completed
      const nextStep = HELP_STEPS[currentStepIndex + 1];
      setIsStepComplete(completedSteps.includes(nextStep.id));
    } else {
      // Help tutorial completed
      onComplete();
    }
  };

  const handleSkipStep = () => {
    // Skip current step and automatically advance to next
    const updatedCompletedSteps = completedSteps.includes(currentStep.id) 
      ? completedSteps 
      : [...completedSteps, currentStep.id];
    
    setCompletedSteps(updatedCompletedSteps);
    
    // Automatically advance to next step
    if (currentStepIndex < HELP_STEPS.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      const nextStep = HELP_STEPS[nextStepIndex];
      setCurrentStepIndex(nextStepIndex);
      // Check if the next step is already completed
      setIsStepComplete(updatedCompletedSteps.includes(nextStep.id));
    } else {
      // Last step - complete tutorial
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setIsStepComplete(completedSteps.includes(HELP_STEPS[currentStepIndex - 1].id));
    }
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'macros':
        return <OnboardingMacros onComplete={() => handleStepComplete('macros')} />;
      case 'walkthrough':
        return <OnboardingWalkthrough onComplete={() => {}} hideNavigation={true} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col p-4 min-h-0">
        {/* Progress Bar */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-black text-primary">App Tutorial</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-xs sm:text-sm text-secondary font-medium">
                Step {currentStepIndex + 1} of {HELP_STEPS.length}
              </div>
              <button
                onClick={onComplete}
                className="btn-pill-secondary w-8 h-8 sm:w-10 sm:h-10 p-0 tap-effect"
                title="Exit Tutorial"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {HELP_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300 ${
                  index < currentStepIndex || completedSteps.includes(step.id)
                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                    : index === currentStepIndex
                    ? 'border-blue-500 text-blue-600 bg-white shadow-md'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}>
                  {index < currentStepIndex || completedSteps.includes(step.id) ? (
                    <Check className="w-3 h-3 sm:w-5 sm:h-5" />
                  ) : (
                    <span className="text-xs sm:text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                
                {index < HELP_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-all duration-300 ${
                    index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card-strong flex-1 flex flex-col animate-slide-up min-h-0">
          <div className="text-center mb-4 flex-shrink-0 px-2">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-primary mb-2">{currentStep.title}</h2>
            <p className="text-secondary text-sm sm:text-base">{currentStep.description}</p>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center px-4 py-3 flex-shrink-0 border-t border-white/10 mt-2">
          <div className="flex gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed tap-effect flex items-center justify-center transition-all hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            
            <button
              onClick={onComplete}
              className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium tap-effect transition-all hover:bg-white/20"
            >
              Exit
            </button>
            
            {!isStepComplete && (
              <button
                onClick={handleSkipStep}
                className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium tap-effect transition-all hover:bg-white/20"
              >
                {currentStepIndex === HELP_STEPS.length - 1 ? 'Skip & Finish' : 'Skip & Next'}
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={!isStepComplete}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-30 disabled:cursor-not-allowed tap-effect flex items-center justify-center transition-all hover:scale-105 shadow-lg"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 