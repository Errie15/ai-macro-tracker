'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Plus, BarChart3, Calendar, Settings, MessageSquare, Check, Sparkles, Zap, Target } from 'lucide-react';

interface OnboardingWalkthroughProps {
  onComplete: () => void;
  hideNavigation?: boolean;
}

const WALKTHROUGH_STEPS = [
  {
    id: 'track',
    title: 'Track Meals Instantly',
    description: 'Just tell us what you ate in plain English. Our AI handles the rest.',
    icon: MessageSquare,
    color: 'from-blue-500 to-cyan-500',
    features: ['Natural language input', 'AI-powered analysis', 'Instant macro calculation']
  },
  {
    id: 'progress',
    title: 'See Your Progress',
    description: 'Beautiful visuals show your daily macro breakdown and progress toward goals.',
    icon: BarChart3,
    color: 'from-purple-500 to-pink-500',
    features: ['Real-time progress tracking', 'Visual macro breakdown', 'Goal achievement insights']
  },
  {
    id: 'ready',
    title: 'You\'re Ready!',
    description: 'Start tracking your first meal right away. It\'s that simple.',
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    features: ['No complicated setup', 'Instant results', 'Reach your goals faster']
  }
];

export default function OnboardingWalkthrough({ onComplete, hideNavigation = false }: OnboardingWalkthroughProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = WALKTHROUGH_STEPS[currentStepIndex];

  // Remove auto-advancing - let user control the flow

  const handleNext = () => {
    if (currentStepIndex < WALKTHROUGH_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsComplete(true);
    onComplete();
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="relative">
          {/* Success animation */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          
          {/* Sparkle effects */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-ping" />
          </div>
          <div className="absolute top-8 left-1/3 transform -translate-x-1/2">
            <Sparkles className="w-4 h-4 text-blue-400 animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute top-6 right-1/3 transform translate-x-1/2">
            <Sparkles className="w-5 h-5 text-purple-400 animate-ping" style={{ animationDelay: '1s' }} />
          </div>
        </div>
        
        <h3 className="text-3xl font-bold text-primary mb-4">You&apos;re All Set! 🚀</h3>
        <p className="text-secondary text-lg mb-6">
          Time to start tracking and reach your goals!
        </p>
        
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
          <Zap className="w-5 h-5" />
          Ready to start your journey
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress indicators */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-3">
          {WALKTHROUGH_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                index <= currentStepIndex
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125 shadow-lg shadow-blue-500/50'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[500px]">
        {/* Left side - Content */}
        <div className="space-y-6">
          {/* Step header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentStep.color} flex items-center justify-center shadow-lg`}>
              <currentStep.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary">{currentStep.title}</h3>
              <p className="text-secondary text-lg">{currentStep.description}</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {currentStep.features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-primary font-medium text-lg">{feature}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleNext}
              className="btn-pill-primary group"
            >
              {currentStepIndex === WALKTHROUGH_STEPS.length - 1 ? (
                <>
                  <span>Get Started</span>
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <button
              onClick={handleSkip}
              className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-black/80 font-medium transition-all hover:bg-white/20 hover:text-grey"
            >
              Skip Walkthrough
            </button>
          </div>
        </div>

        {/* Right side - Visual demonstration */}
        <div className="glass-card-compact">
          {currentStep.id === 'track' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-primary">Add a Meal</h4>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              
              {/* Input simulation */}
              <div className="space-y-3">
                <div className="glass-card-compact bg-white/5">
                  <div className="text-sm text-secondary mb-1">You type:</div>
                  <div className="text-primary font-medium">&quot;Grilled chicken breast with rice and broccoli&quot;</div>
                </div>
                
                <div className="glass-card-compact bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="text-sm text-blue-400 mb-3 font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Analysis Complete
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-500">420</div>
                      <div className="text-xs text-secondary">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-500">35g</div>
                      <div className="text-xs text-secondary">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-500">45g</div>
                      <div className="text-xs text-secondary">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-500">8g</div>
                      <div className="text-xs text-secondary">Fat</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep.id === 'progress' && (
            <div className="space-y-4">
              <h4 className="font-bold text-primary mb-4">Today&apos;s Progress</h4>
              
              {/* Progress bars */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary">Daily Goal</span>
                  <span className="text-sm font-semibold text-primary">1,680 / 2,000 calories</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full animate-pulse" style={{ width: '84%' }}></div>
                </div>
                
                {/* Macro cards */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="glass-card-compact text-center">
                    <div className="text-xl font-bold text-blue-500 mb-1">120g</div>
                    <div className="text-xs text-secondary">Protein</div>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div className="glass-card-compact text-center">
                    <div className="text-xl font-bold text-green-500 mb-1">180g</div>
                    <div className="text-xs text-secondary">Carbs</div>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div className="glass-card-compact text-center">
                    <div className="text-xl font-bold text-purple-500 mb-1">55g</div>
                    <div className="text-xs text-secondary">Fat</div>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '69%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep.id === 'ready' && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <Target className="w-10 h-10 text-white" />
              </div>
              
              <h4 className="text-2xl font-bold text-primary">All Set!</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3 text-green-500">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Profile configured</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-green-500">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Macro goals set</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-green-500">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Ready to track</span>
                </div>
              </div>
              
              <div className="glass-card-compact bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <p className="text-green-400 font-medium">
                  🎉 Your personalized macro tracker is ready to use!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
} 