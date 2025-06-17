import { MacroGoals, MacroNutrients } from '@/types';

interface MacroProgressProps {
  totalMacros: MacroNutrients;
  goals: MacroGoals;
}

interface ProgressItemProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

function ProgressItem({ label, current, goal, unit, color }: ProgressItemProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isOverGoal = current > goal;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-900">{label}</span>
        <span className={`text-sm font-medium ${
          isOverGoal ? 'text-warning-700' : 'text-gray-800'
        }`}>
          {current}{unit} / {goal}{unit}
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className={`progress-fill ${color} ${
            isOverGoal ? 'bg-warning-500' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-right">
        <span className={`text-xs ${
          isOverGoal ? 'text-warning-700' : 'text-gray-600'
        }`}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

export default function MacroProgress({ totalMacros, goals }: MacroProgressProps) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Dagens Progress</h2>
      
      <div className="space-y-6">
        <ProgressItem
          label="Protein"
          current={totalMacros.protein}
          goal={goals.protein}
          unit="g"
          color="bg-blue-500"
        />
        
        <ProgressItem
          label="Kolhydrater"
          current={totalMacros.carbs}
          goal={goals.carbs}
          unit="g"
          color="bg-green-500"
        />
        
        <ProgressItem
          label="Fett"
          current={totalMacros.fat}
          goal={goals.fat}
          unit="g"
          color="bg-purple-500"
        />
        
        <ProgressItem
          label="Kalorier"
          current={totalMacros.calories}
          goal={goals.calories}
          unit=" kcal"
          color="bg-orange-500"
        />
      </div>
    </div>
  );
} 