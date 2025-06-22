'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Plus, BarChart3, Calendar, Settings, MessageSquare, Check } from 'lucide-react';

interface OnboardingWalkthroughProps {
  onComplete: () => void;
  hideNavigation?: boolean;
}

const WALKTHROUGH_STEPS = [
  {
    id: 'home',
    title: 'Track Your Daily Macros',
    description: 'Your home screen shows your daily progress. Click the + button to add meals and see your macro breakdown in real-time.',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-500',
    features: ['View daily macro progress', 'Add meals with AI analysis', 'See calories and macro breakdown']
  },
  {
    id: 'meals',
    title: 'Smart Meal Input',
    description: 'Simply describe what you ate in plain English. Our AI will automatically calculate the macros for you!',
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-500',
    features: ['Natural language input', 'AI-powered macro calculation', 'Instant nutritional analysis']
  },
  {
    id: 'history',
    title: 'Track Your History',
    description: 'View all your meals and progress over time. The meals page shows your complete nutrition history.',
    icon: Calendar,
    color: 'from-green-500 to-emerald-500',
    features: ['Complete meal history', 'Daily progress tracking', 'Easy meal management']
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Adjust your macro goals, update your profile, and personalize the app to fit your needs.',
    icon: Settings,
    color: 'from-orange-500 to-red-500',
    features: ['Update macro goals', 'Edit profile information', 'Customize preferences']
  }
];

export default function OnboardingWalkthrough({ onComplete, hideNavigation = false }: OnboardingWalkthroughProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = WALKTHROUGH_STEPS[currentStepIndex];

  // Only call onComplete when the walkthrough actually finishes all steps
  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  const handleNext = () => {
    if (currentStepIndex < WALKTHROUGH_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsComplete(true);
    onComplete();
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-black text-primary mb-4">You&apos;re All Set!</h3>
          <p className="text-secondary mb-8">
            You&apos;ve completed the onboarding process. Start tracking your macros and reach your fitness goals!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Progress dots */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-3">
          {WALKTHROUGH_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStepIndex
                  ? 'bg-blue-500 scale-125'
                  : index < currentStepIndex
                  ? 'bg-blue-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Content */}
        <div className="glass-card-compact">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentStep.color} flex items-center justify-center shadow-lg`}>
              <currentStep.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-primary">{currentStep.title}</h3>
          </div>

          <p className="text-secondary text-lg mb-6 leading-relaxed">{currentStep.description}</p>

          <div className="space-y-3">
            {currentStep.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-primary font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual mockup */}
        <div className="glass-card-compact max-h-96 overflow-y-auto">
          {currentStep.id === 'home' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-primary">Today&apos;s Progress</h4>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-secondary">Calories</span>
                  <span className="text-sm font-semibold text-primary">1,250 / 2,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" style={{ width: '62%' }}></div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="glass-card-compact">
                    <div className="text-lg font-black text-blue-600">85g</div>
                    <div className="text-xs text-secondary">Protein</div>
                  </div>
                  <div className="glass-card-compact">
                    <div className="text-lg font-black text-green-600">120g</div>
                    <div className="text-xs text-secondary">Carbs</div>
                  </div>
                  <div className="glass-card-compact">
                    <div className="text-lg font-black text-purple-600">45g</div>
                    <div className="text-xs text-secondary">Fat</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep.id === 'meals' && (
            <div className="space-y-4">
              <h4 className="font-bold text-primary mb-4">Add a Meal</h4>
              <div className="space-y-3">
                <div className="glass-card-compact bg-gray-100/50">
                  <div className="text-sm text-secondary mb-1">You said:</div>
                  <div className="text-sm text-primary">&quot;Grilled chicken breast with rice and vegetables&quot;</div>
                </div>
                <div className="glass-card-compact bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="text-sm text-blue-700 mb-2 font-semibold">AI Analysis:</div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-black text-primary">420</div>
                      <div className="text-secondary">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-primary">35g</div>
                      <div className="text-secondary">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-primary">45g</div>
                      <div className="text-secondary">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-primary">8g</div>
                      <div className="text-secondary">Fat</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep.id === 'history' && (
            <div className="space-y-4">
              <h4 className="font-bold text-primary mb-4">Meal History</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <div>
                    <div className="text-sm font-semibold text-primary">Breakfast</div>
                    <div className="text-xs text-secondary">Oatmeal with berries</div>
                  </div>
                  <div className="text-xs text-secondary font-medium">320 cal</div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <div>
                    <div className="text-sm font-semibold text-primary">Lunch</div>
                    <div className="text-xs text-secondary">Chicken salad</div>
                  </div>
                  <div className="text-xs text-secondary font-medium">450 cal</div>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div>
                    <div className="text-sm font-semibold text-primary">Snack</div>
                    <div className="text-xs text-secondary">Greek yogurt</div>
                  </div>
                  <div className="text-xs text-secondary font-medium">150 cal</div>
                </div>
              </div>
            </div>
          )}

          {currentStep.id === 'settings' && (
            <div className="space-y-4">
              <h4 className="font-bold text-primary mb-4">Settings</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 px-4 glass-card-compact hover:bg-white/20 transition-colors">
                  <span className="text-sm font-medium text-primary">Macro Goals</span>
                  <ChevronRight className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex justify-between items-center py-3 px-4 glass-card-compact hover:bg-white/20 transition-colors">
                  <span className="text-sm font-medium text-primary">Profile</span>
                  <ChevronRight className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex justify-between items-center py-3 px-4 glass-card-compact hover:bg-white/20 transition-colors">
                  <span className="text-sm font-medium text-primary">Notifications</span>
                  <ChevronRight className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex justify-between items-center py-3 px-4 glass-card-compact hover:bg-white/20 transition-colors">
                  <span className="text-sm font-medium text-primary">Export Data</span>
                  <ChevronRight className="w-4 h-4 text-secondary" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - only show if not inside another tutorial */}
      {!hideNavigation && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleSkip}
            className="text-secondary hover:text-primary text-sm font-medium transition-colors"
          >
            Skip Tutorial
          </button>

          <div className="flex gap-2">
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
              className="btn-pill-primary text-sm px-3 py-2"
            >
              {currentStepIndex === WALKTHROUGH_STEPS.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 