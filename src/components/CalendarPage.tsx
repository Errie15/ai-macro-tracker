'use client';

import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useState } from 'react';

interface CalendarPageProps {
  onBack: () => void;
  onAddMeal: () => void;
}

export default function CalendarPage({ onBack, onAddMeal }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  // Generate calendar days
  const calendarDays = [];
  const totalDays = 42; // 6 weeks * 7 days
  
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    calendarDays.push(date);
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
  };
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };
  
  const hasMeals = (date: Date) => {
    // Mock data - in the future this would check actual meal data
    const dayOfMonth = date.getDate();
    return dayOfMonth % 3 === 0 && isCurrentMonth(date) && date <= today;
  };

  return (
    <div className="min-h-screen smooth-scroll relative">
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-4 animate-fade-in">
            <button
              onClick={onBack}
              className="btn-pill-secondary w-12 h-12 p-0 tap-effect hover-lift"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-display">Calendar</h1>
              <p className="text-tertiary">View your meal history</p>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="glass-card animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateMonth('prev')}
                className="btn-pill-secondary w-10 h-10 p-0 tap-effect"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-primary capitalize">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              
              <button
                onClick={() => navigateMonth('next')}
                className="btn-pill-secondary w-10 h-10 p-0 tap-effect"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="glass-card animate-slide-up" style={{ animationDelay: '200ms' }}>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map((day) => (
                <div key={day} className="text-center py-2 text-sm font-medium text-tertiary">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const isThisMonth = isCurrentMonth(date);
                const isTodayDate = isToday(date);
                const hasMealData = hasMeals(date);
                
                return (
                  <button
                    key={index}
                    className={`
                      aspect-square flex items-center justify-center text-sm rounded-xl
                      relative transition-all duration-200 tap-effect
                      ${isTodayDate 
                        ? 'bg-blue-500 text-white font-bold shadow-lg' 
                        : isThisMonth 
                          ? hasMealData 
                            ? 'bg-green-500/20 text-primary hover:bg-green-500/30 border border-green-400/30' 
                            : 'text-primary hover:bg-white/10' 
                          : 'text-quaternary'
                      }
                    `}
                    disabled={!isThisMonth || date > today}
                    onClick={() => {
                      if (hasMealData) {
                        // Future: Navigate to specific day's meals
                        console.log('View meals for', date.toDateString());
                      }
                    }}
                  >
                    {date.getDate()}
                    
                    {/* Meal indicator */}
                    {hasMealData && !isTodayDate && (
                      <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="glass-card bg-purple-500/10 border-purple-400/20 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="font-semibold text-primary mb-3">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-lg"></div>
                <span className="text-secondary">Today</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500/20 border border-green-400/30 rounded-lg relative">
                  <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-secondary">Day with meals</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border border-white/20 rounded-lg"></div>
                <span className="text-secondary">Day without meals</span>
              </div>
            </div>
          </div>

        </div>
      </div>


    </div>
  );
} 