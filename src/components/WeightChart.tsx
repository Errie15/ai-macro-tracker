'use client';

import { useMemo } from 'react';
import { WeightEntry } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WeightChartProps {
  weightEntries: WeightEntry[];
}

export default function WeightChart({ weightEntries }: WeightChartProps) {
  const chartData = useMemo(() => {
    if (weightEntries.length === 0) return null;

    // Sort by date
    const sortedEntries = [...weightEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const minWeight = Math.min(...sortedEntries.map(e => e.weight));
    const maxWeight = Math.max(...sortedEntries.map(e => e.weight));
    const weightRange = maxWeight - minWeight;
    
    // Handle case where all weights are the same
    const padding = weightRange > 0 ? weightRange * 0.1 : 1; // Use 1kg padding if all weights are same
    
    const chartMin = Math.max(0, minWeight - padding);
    const chartMax = maxWeight + padding;
    const chartRange = chartMax - chartMin;

    // Calculate points for the line chart
    const points = sortedEntries.map((entry, index) => {
      // Handle single entry case
      const xPos = sortedEntries.length === 1 ? 50 : (index / (sortedEntries.length - 1)) * 100;
      const yPos = chartRange > 0 ? ((chartMax - entry.weight) / chartRange) * 100 : 50;
      
      return {
        x: xPos,
        y: yPos,
        weight: entry.weight,
        date: entry.date,
        timestamp: entry.timestamp
      };
    });

    // Create SVG path - handle single point case
    let pathData;
    if (points.length === 1) {
      // For single point, create a small horizontal line
      pathData = `M ${points[0].x - 2} ${points[0].y} L ${points[0].x + 2} ${points[0].y}`;
    } else {
      pathData = points.map((point, index) => 
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ');
    }

    // Calculate trend
    const firstWeight = sortedEntries[0].weight;
    const lastWeight = sortedEntries[sortedEntries.length - 1].weight;
    const weightChange = lastWeight - firstWeight;
    const trend = weightChange > 0.5 ? 'up' : weightChange < -0.5 ? 'down' : 'stable';

    return {
      points,
      pathData,
      minWeight: chartMin,
      maxWeight: chartMax,
      actualMinWeight: minWeight,
      actualMaxWeight: maxWeight,
      entries: sortedEntries,
      trend,
      weightChange: Math.abs(weightChange),
      latestWeight: lastWeight
    };
  }, [weightEntries]);

  if (!chartData || weightEntries.length === 0) {
    return (
      <div className="text-center py-8 text-tertiary">
        <div className="text-6xl mb-3">⚖️</div>
        <p className="text-lg">No weight data available</p>
        <p className="text-sm">Add weight entries to see your progress chart</p>
      </div>
    );
  }

  const { points, pathData, minWeight, maxWeight, actualMinWeight, actualMaxWeight, entries, trend, weightChange, latestWeight } = chartData;

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-red-400" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-green-400" />;
      default:
        return <Minus className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-red-400';
      case 'down':
        return 'text-green-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getTrendText = () => {
    if (entries.length === 1) {
      return 'Single entry';
    }
    switch (trend) {
      case 'up':
        return `+${weightChange.toFixed(1)}kg increase`;
      case 'down':
        return `${weightChange.toFixed(1)}kg decrease`;
      default:
        return 'Weight stable';
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-primary">
            {latestWeight.toFixed(1)} kg
          </div>
          <div className="text-sm text-secondary">Current weight</div>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {getTrendText()}
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative w-full h-56 bg-white/5 rounded-xl p-4 overflow-hidden">
        <svg className="w-full h-40" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="25" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            </pattern>
            {/* Gradient definition */}
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Chart line */}
          <path
            d={pathData}
            fill="none"
            stroke="rgb(34, 197, 94)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="2"
                fill="rgb(34, 197, 94)"
                stroke="rgb(255, 255, 255)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-sm"
              />
              {/* Weight label on hover */}
              <title>{`${point.weight}kg on ${new Date(point.date).toLocaleDateString()}`}</title>
            </g>
          ))}
          
          {/* Fill area under curve - only if more than one point */}
          {points.length > 1 && (
            <path
              d={`${pathData} L 100 100 L 0 100 Z`}
              fill="url(#gradient)"
              opacity="0.2"
            />
          )}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-40 flex flex-col justify-between text-xs text-tertiary py-2">
          <span>{maxWeight.toFixed(1)}kg</span>
          <span>{((maxWeight + minWeight) / 2).toFixed(1)}kg</span>
          <span>{minWeight.toFixed(1)}kg</span>
        </div>
        
        {/* X-axis date labels */}
        <div className="absolute bottom-0 left-4 right-4 h-12 flex items-center justify-between text-xs text-tertiary">
          {points.map((point, index) => {
            // Show date labels for key points
            const shouldShow = entries.length <= 3 || index === 0 || index === entries.length - 1 || 
                              (entries.length > 3 && index % Math.ceil(entries.length / 3) === 0);
            
            if (!shouldShow) return null;
            
            const date = new Date(point.date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isRecent = (new Date().getTime() - date.getTime()) < (7 * 24 * 60 * 60 * 1000); // Within 7 days
            
            return (
              <div 
                key={index} 
                className="text-center flex flex-col items-center"
                style={{ 
                  position: 'absolute',
                  left: `${point.x}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className={`text-xs font-medium ${isToday ? 'text-green-400' : isRecent ? 'text-blue-400' : 'text-tertiary'}`}>
                  {date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                {isToday && (
                  <div className="text-xs text-green-400 font-bold">Today</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Summary */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20">
          <div className="font-bold text-blue-400">{entries.length}</div>
          <div className="text-secondary">Entries</div>
        </div>
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-400/20">
          <div className="font-bold text-green-400">{actualMinWeight.toFixed(1)}kg</div>
          <div className="text-secondary">Lowest</div>
        </div>
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-400/20">
          <div className="font-bold text-purple-400">{actualMaxWeight.toFixed(1)}kg</div>
          <div className="text-secondary">Highest</div>
        </div>
      </div>

      {/* Recent entries list */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-primary">Recent Entries</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {entries.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <div>
                  <div className="font-medium text-primary">{entry.weight}kg</div>
                  <div className="text-xs text-secondary">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs text-tertiary">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 