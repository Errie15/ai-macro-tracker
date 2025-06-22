'use client';

import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Target, Scale, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getDatesWithData, getUserProfile } from '@/lib/storage';
import { UserProfile } from '@/types';
import DayDetailPage from './DayDetailPage';

interface CalendarPageProps {
  onBack: () => void;
  onAddMeal: () => void;
}

export default function CalendarPage({ onBack, onAddMeal }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [datesWithMeals, setDatesWithMeals] = useState<Set<string>>(new Set());
  const [datesWithWeight, setDatesWithWeight] = useState<Set<string>>(new Set());
  const [datesWithData, setDatesWithData] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
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

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const [dateData, profile] = await Promise.all([
        getDatesWithData(),
        getUserProfile()
      ]);
      setDatesWithMeals(dateData.mealsData);
      setDatesWithWeight(dateData.weightData);
      setDatesWithData(dateData.allData);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  // Add a function to refresh data that can be called externally
  const refreshCalendarData = () => {
    loadCalendarData();
  };

  // Add effect to refresh when component becomes visible again
  useEffect(() => {
    const handleFocus = () => {
      // Refresh data when window/tab becomes active
      loadCalendarData();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh data when page becomes visible
        loadCalendarData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
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
  
  // Helper function to get local date string (avoid timezone issues)
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const hasData = (date: Date) => {
    const dateString = getLocalDateString(date);
    return datesWithData.has(dateString);
  };

  const hasMeals = (date: Date) => {
    const dateString = getLocalDateString(date);
    return datesWithMeals.has(dateString);
  };

  const hasWeight = (date: Date) => {
    const dateString = getLocalDateString(date);
    return datesWithWeight.has(dateString);
  };

  const hasGoalTargetDate = (date: Date) => {
    const dateString = getLocalDateString(date);
    return activeGoals.some(goal => goal.targetDate === dateString);
  };

  const getGoalsForDate = (date: Date) => {
    const dateString = getLocalDateString(date);
    return activeGoals.filter(goal => goal.targetDate === dateString);
  };

  const handleDateClick = (date: Date) => {
    if (!isCurrentMonth(date)) return;
    
    const dateString = getLocalDateString(date);
    const hasDataForDate = hasData(date);
    const hasGoalForDate = hasGoalTargetDate(date);
    const isTodayDate = isToday(date);
    
    console.log('Calendar date clicked:', date, 'Date string:', dateString);
    
    if (hasDataForDate || isTodayDate) {
      // Allow viewing day details for any day with data OR for today
      setSelectedDate(dateString);
    } else if (hasGoalForDate) {
      // Show goal details for future target dates
      const goals = getGoalsForDate(date);
      const goalsList = goals.map(goal => 
        `• ${goal.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}${goal.description ? ': ' + goal.description : ''}`
      ).join('\n');
      
      alert(`Goal Target Date: ${date.toLocaleDateString()}\n\n${goalsList}`);
    }
  };

  const activeGoals = userProfile.fitnessGoals?.filter(goal => goal.isActive) || [];

  // If a date is selected, show the day detail page
  if (selectedDate) {
    return (
      <DayDetailPage
        date={selectedDate}
        onBack={() => setSelectedDate(null)}
        onAddMeal={onAddMeal}
      />
    );
  }

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
              <p className="text-tertiary">View your meal and weight history</p>
            </div>

            <button
              onClick={refreshCalendarData}
              className="btn-pill-secondary w-12 h-12 p-0 tap-effect hover-lift"
              aria-label="Refresh"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
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
            {loading ? (
              <div className="text-center py-8">
                <div className="ai-thinking w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-tertiary mt-3">Loading calendar...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const isThisMonth = isCurrentMonth(date);
                  const isTodayDate = isToday(date);
                  const hasDataForDate = hasData(date);
                  const hasMealsForDate = hasMeals(date);
                  const hasWeightForDate = hasWeight(date);
                  const hasGoalForDate = hasGoalTargetDate(date);
                  const isInteractive = hasDataForDate || hasGoalForDate || isTodayDate;
                  
                  return (
                    <button
                      key={index}
                      className={`
                        aspect-square flex items-center justify-center text-sm rounded-xl
                        relative transition-all duration-200 tap-effect
                        ${isTodayDate 
                          ? 'bg-blue-500 text-white font-bold shadow-lg cursor-pointer' 
                          : isThisMonth 
                            ? hasDataForDate 
                              ? 'bg-green-500/20 text-primary hover:bg-green-500/30 border border-green-400/30 cursor-pointer' 
                              : hasGoalForDate
                                ? 'bg-purple-500/20 text-primary hover:bg-purple-500/30 border border-purple-400/30 cursor-pointer'
                                : 'text-primary hover:bg-white/10' 
                            : 'text-quaternary'
                        }
                        ${!isThisMonth ? 'cursor-not-allowed' : isInteractive ? 'cursor-pointer' : ''}
                      `}
                      disabled={!isThisMonth}
                      onClick={() => handleDateClick(date)}
                    >
                      {date.getDate()}
                      
                      {/* Meal indicator */}
                      {hasMealsForDate && !isTodayDate && (
                        <div className={`absolute bottom-1 right-1 w-2 h-2 bg-green-400 rounded-full ${hasWeightForDate ? 'bottom-1 left-1' : ''}`}></div>
                      )}
                      
                      {/* Weight indicator */}
                      {hasWeightForDate && !isTodayDate && (
                        <div className="absolute bottom-1 right-1 w-2 h-2 bg-orange-400 rounded-full"></div>
                      )}
                      
                      {/* Goal target indicator */}
                      {hasGoalForDate && !isTodayDate && (
                        <div className={`absolute top-1 right-1 w-2 h-2 bg-purple-400 rounded-full ${hasDataForDate ? 'top-1 left-1' : ''}`}></div>
                      )}
                      
                      {/* Goal target badge for important dates */}
                      {hasGoalForDate && !hasDataForDate && !isTodayDate && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-purple-300 flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Data Summary */}
          {!loading && (
            <div className="glass-card animate-slide-up" style={{ animationDelay: '300ms' }}>
              <h3 className="font-semibold text-primary mb-3">This Month</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-400/20">
                  <div className="text-2xl font-bold text-green-400">
                    {Array.from(datesWithData).filter(dateStr => {
                      const date = new Date(dateStr);
                      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                    }).length}
                  </div>
                  <div className="text-sm text-secondary">Days with Data</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20">
                  <div className="text-2xl font-bold text-blue-400">
                    {activeGoals.length}
                  </div>
                  <div className="text-sm text-secondary">Active Goals</div>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="glass-card bg-purple-500/10 border-purple-400/20 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <h3 className="font-semibold text-primary mb-3">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-lg"></div>
                <span className="text-secondary">Today (clickable)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500/20 border border-green-400/30 rounded-lg relative">
                  <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-secondary">Day with meals</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500/20 border border-green-400/30 rounded-lg relative">
                  <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                </div>
                <span className="text-secondary">Day with weight data</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500/20 border border-green-400/30 rounded-lg relative">
                  <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                </div>
                <span className="text-secondary">Day with meals + weight</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-500/20 border border-purple-400/30 rounded-lg relative">
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border border-purple-300 flex items-center justify-center">
                    <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                  </div>
                </div>
                <span className="text-secondary">Goal target date</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border border-white/20 rounded-lg"></div>
                <span className="text-secondary">Day without data</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-400/20">
              <p className="text-xs text-secondary">
                <strong>Tip:</strong> Click on days with data to view detailed information, or click on goal target dates to see your upcoming deadlines.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
} 