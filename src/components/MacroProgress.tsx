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
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
        <div className="w-8 h-8">
          {icon}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 ${color}`}>
            {icon}
          </div>
          <h3 className="font-bold text-primary text-lg">{label}</h3>
        </div>
        
        <div className="space-y-3">
          {/* Values */}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-primary animate-count-up">
              {Math.round(displayValue)}
            </span>
            <span className="text-tertiary text-sm font-medium">{unit}</span>
            <span className="text-quaternary text-sm mx-1">/</span>
            <span className="text-secondary text-sm font-medium">
              {goal}{unit}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="progress-container h-2">
              <div 
                className={`progress-fill-glass ${
                  isOverGoal 
                    ? 'bg-gradient-to-r from-warning-400 to-warning-500' 
                    : `bg-gradient-to-r ${color.replace('text-', 'from-').replace('-400', '-400 to-').replace('text-', '').replace('-400', '-500')}`
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`text-xs font-medium ${
                isOverGoal ? 'text-warning-300' : 'text-secondary'
              }`}>
                {Math.round(percentage)}%
              </span>
              {isOverGoal && (
                <span className="text-xs text-warning-300 font-medium">
                  +{Math.round(current - goal)}{unit} over
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MacroProgress({ totalMacros, goals }: MacroProgressProps) {
  const macroBlocks = [
    {
      label: 'Protein',
      current: totalMacros.protein,
      goal: goals.protein,
      unit: 'g',
      color: 'text-blue-400',
      bgGradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
      icon: <Activity className="w-full h-full" />
    },
    {
      label: 'Carbs',
      current: totalMacros.carbs,
      goal: goals.carbs,
      unit: 'g',
      color: 'text-green-400',
      bgGradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      icon: <Zap className="w-full h-full" />
    },
    {
      label: 'Fat',
      current: totalMacros.fat,
      goal: goals.fat,
      unit: 'g',
      color: 'text-purple-400',
      bgGradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      icon: <Droplets className="w-full h-full" />
    },
    {
      label: 'Calories',
      current: totalMacros.calories,
      goal: goals.calories,
      unit: ' kcal',
      color: 'text-orange-400',
      bgGradient: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
      icon: <Target className="w-full h-full" />
    }
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      
      {/* Summary Card */}
      <div className="glass-card text-center space-y-3 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-primary">Daily Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-tertiary">Protein</div>
            <div className="font-bold text-blue-400">
              {Math.round((totalMacros.protein / goals.protein) * 100)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-tertiary">Carbs</div>
            <div className="font-bold text-green-400">
              {Math.round((totalMacros.carbs / goals.carbs) * 100)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-tertiary">Fat</div>
            <div className="font-bold text-purple-400">
              {Math.round((totalMacros.fat / goals.fat) * 100)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-tertiary">Calories</div>
            <div className="font-bold text-orange-400">
              {Math.round((totalMacros.calories / goals.calories) * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 