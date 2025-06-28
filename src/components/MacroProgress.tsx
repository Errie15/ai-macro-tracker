'use client';

import { useEffect, useState } from 'react';
import { MacroGoals, MacroNutrients } from '@/types';
import { Activity, Target, Zap, Droplets } from 'lucide-react';

interface MacroProgressProps {
  totalMacros: MacroNutrients;
  goals: MacroGoals;
}

interface MacroBlockProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
  bgGradient: string;
}

function MacroBlock({ label, current, goal, unit, color, icon, bgGradient }: MacroBlockProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((current / goal) * 100, 100);
  const isOverGoal = current > goal;
  
  // Count-up animation
  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const increment = current / steps;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      setDisplayValue(Math.min(increment * step, current));
      
      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className={`macro-block group relative overflow-hidden ${bgGradient}`}>
      {/* Background icon */}
      <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
        <div className="w-6 h-6">
          {icon}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-5 h-5 ${color}`}>
            {icon}
          </div>
          <h3 className="font-bold text-primary text-base">{label}</h3>
        </div>
        
        <div className="space-y-2">
          {/* Values with inline overflow indicator */}
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-2xl font-black text-primary animate-count-up">
              {Math.round(displayValue)}
            </span>
            <span className="text-tertiary text-sm font-medium">{unit}</span>
            <span className="text-quaternary text-sm mx-1">/</span>
            <span className="text-secondary text-sm font-medium">
              {goal}{unit}
            </span>
            {/* Show over-goal indicator inline */}
            {isOverGoal && (
              <span className="text-xs text-warning-300 font-medium ml-1">
                +{Math.round(current - goal)}{unit} over
              </span>
            )}
          </div>
          
          {/* Progress bar only */}
          <div className="progress-container h-1.5">
            <div 
              className={`progress-fill-glass ${
                isOverGoal 
                  ? 'bg-gradient-to-r from-warning-400 to-warning-500' 
                  : `bg-gradient-to-r ${color.replace('text-', 'from-').replace('-400', '-400 to-').replace('text-', '').replace('-400', '-500')}`
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MacroProgress({ totalMacros, goals }: MacroProgressProps) {
  // Provide fallback values in case goals are undefined or invalid
  const safeGoals = {
    protein: goals?.protein || 150,
    carbs: goals?.carbs || 200,
    fat: goals?.fat || 70,
    calories: goals?.calories || 2000
  };
  
  // Provide fallback values for totalMacros as well
  const safeTotalMacros = {
    protein: totalMacros?.protein || 0,
    carbs: totalMacros?.carbs || 0,
    fat: totalMacros?.fat || 0,
    calories: totalMacros?.calories || 0
  };

  console.log('📊 MacroProgress rendering with goals:', safeGoals, 'and totals:', safeTotalMacros);

  const macroBlocks = [
    {
      label: 'Protein',
      current: safeTotalMacros.protein,
      goal: safeGoals.protein,
      unit: 'g',
      color: 'text-blue-400',
      bgGradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      icon: <Activity className="w-full h-full" />
    },
    {
      label: 'Carbs',
      current: safeTotalMacros.carbs,
      goal: safeGoals.carbs,
      unit: 'g',
      color: 'text-green-400',
      bgGradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      icon: <Zap className="w-full h-full" />
    },
    {
      label: 'Fat',
      current: safeTotalMacros.fat,
      goal: safeGoals.fat,
      unit: 'g',
      color: 'text-purple-400',
      bgGradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      icon: <Droplets className="w-full h-full" />
    },
    {
      label: 'Calories',
      current: safeTotalMacros.calories,
      goal: safeGoals.calories,
      unit: ' kcal',
      color: 'text-orange-400',
      bgGradient: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
      icon: <Target className="w-full h-full" />
    }
  ];

  return (
    <div className="animate-slide-up">
      {/* Vertical Layout - Single Column */}
      <div className="space-y-3">
        {macroBlocks.map((block, index) => (
          <div 
            key={block.label}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <MacroBlock {...block} />
          </div>
        ))}
      </div>
    </div>
  );
} 