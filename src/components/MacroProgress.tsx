import { MacroGoals, MacroNutrients } from '@/types';
import { TrendingUp, Zap, Droplets, Flame } from 'lucide-react';

interface MacroProgressProps {
  totalMacros: MacroNutrients;
  goals: MacroGoals;
}

interface BentoMacroCardProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  goal: number;
  unit: string;
  colorClass: string;
  bgClass: string;
  index: number;
}

function BentoMacroCard({ 
  icon, 
  label, 
  current, 
  goal, 
  unit, 
  colorClass, 
  bgClass,
  index 
}: BentoMacroCardProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isOverGoal = current > goal;
  
  return (
    <div 
      className={`bento-card ${bgClass} micro-bounce micro-glow reveal`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Glass overlay */}
      <div className="glass-overlay" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white/10 backdrop-blur-sm ${colorClass}`}>
            {icon}
          </div>
          <span className="font-bold text-slate-100 text-lg">{label}</span>
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-full ${
          isOverGoal 
            ? 'bg-amber-500/20 text-amber-300' 
            : percentage >= 90 
              ? 'bg-green-500/20 text-green-300'
              : 'bg-slate-700/30 text-slate-300'
        }`}>
          {Math.round(percentage)}%
        </div>
      </div>
      
      {/* Progress Ring */}
      <div className="relative z-10 mb-4">
        <div className="relative w-20 h-20 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-white/10"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
              className={`${colorClass} transition-all duration-1000 ease-out`}
              style={{ 
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
                animationDelay: `${index * 0.2}s` 
              }}
            />
          </svg>
          
          {/* Center value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-black ${colorClass} count-up`}>
              {current}
            </span>
            <span className="text-xs text-slate-400 font-medium">{unit}</span>
          </div>
        </div>
      </div>
      
      {/* Bottom info */}
      <div className="text-center relative z-10">
        <div className="text-slate-300 text-sm font-medium">
          Mål: <span className="text-slate-100 font-bold">{goal}{unit}</span>
        </div>
        <div className={`text-xs mt-1 ${
          isOverGoal 
            ? 'text-amber-400' 
            : current >= goal * 0.9 
              ? 'text-green-400'
              : 'text-slate-400'
        }`}>
          {isOverGoal 
            ? `+${current - goal}${unit} över mål` 
            : `${goal - current}${unit} kvar`
          }
        </div>
      </div>
      
      {/* Animated progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-b-soft overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out rounded-b-soft`}
          style={{ 
            width: `${percentage}%`,
            animationDelay: `${index * 0.3}s`
          }}
        />
      </div>
    </div>
  );
}

export default function MacroProgress({ totalMacros, goals }: MacroProgressProps) {
  const macroCards = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Protein",
      current: totalMacros.protein,
      goal: goals.protein,
      unit: "g",
      colorClass: "text-macro-protein",
      bgClass: "bento-protein",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Kolhydrater",
      current: totalMacros.carbs,
      goal: goals.carbs,
      unit: "g",
      colorClass: "text-macro-carbs",
      bgClass: "bento-carbs",
    },
    {
      icon: <Droplets className="w-5 h-5" />,
      label: "Fett",
      current: totalMacros.fat,
      goal: goals.fat,
      unit: "g",
      colorClass: "text-macro-fat",
      bgClass: "bento-fat",
    },
    {
      icon: <Flame className="w-5 h-5" />,
      label: "Kalorier",
      current: totalMacros.calories,
      goal: goals.calories,
      unit: " kcal",
      colorClass: "text-macro-calories",
      bgClass: "bento-calories",
    },
  ];

  return (
    <>
      {macroCards.map((macro, index) => (
        <BentoMacroCard
          key={macro.label}
          {...macro}
          index={index}
        />
      ))}
    </>
  );
} 