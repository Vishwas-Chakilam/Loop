import React from 'react';
import { DailyLog, Habit } from '../types';

interface MiniCalendarProps {
  habit: Habit;
  logs: Record<string, DailyLog>;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ habit, logs }) => {
  // Generate last 35 days (5 weeks)
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    return d;
  });

  return (
    <div className="mt-4">
      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Completion History</h5>
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-[10px] text-center text-gray-400 font-medium pb-1">{d}</div>
        ))}
        {days.map((date, i) => {
          const dateStr = date.toISOString().split('T')[0];
          const log = logs[dateStr];
          const isDone = log?.completedHabits.includes(habit.id);
          const isToday = date.toDateString() === new Date().toDateString();
          const dayOfWeek = date.getDay();
          const isScheduled = habit.frequency.includes(dayOfWeek);

          return (
            <div key={i} className="flex items-center justify-center aspect-square relative">
              <div 
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all
                  ${isDone 
                    ? 'text-white' 
                    : isToday 
                        ? 'border border-gray-300 dark:border-gray-600' 
                        : 'text-gray-400 dark:text-gray-600'}
                `}
                style={{ backgroundColor: isDone ? habit.color : 'transparent' }}
              >
                {isDone ? '✓' : ''}
              </div>
              {/* Dot for scheduled but missed days in the past */}
              {!isDone && isScheduled && date < new Date() && !isToday && (
                <div className="absolute w-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};