
import React, { useState, useEffect } from 'react';
import { AppData, Habit, DailyLog, Category } from '../types';
import { getTodayStr, calculateStreak, checkForNewBadges, calculateLevel } from '../services/storage';
import { playSound } from '../services/audioService';
import { Check, Plus, Moon, Flame, X, Bell, Trash2, Edit, AlertTriangle, Timer, Trophy } from 'lucide-react';
import { HABIT_ICONS, HABIT_COLORS, CATEGORIES, DAYS_OF_WEEK } from '../constants';
import { Button } from '../components/Button';
import { MiniCalendar } from '../components/MiniCalendar';
import { FocusTimer } from '../components/FocusTimer';

const simpleId = () => Math.random().toString(36).substr(2, 9);

interface DashboardProps {
  data: AppData;
  onUpdateData: (newData: AppData) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onUpdateData }) => {
  const today = getTodayStr();
  const [currentLog, setCurrentLog] = useState<DailyLog>(data.logs[today] || { date: today, completedHabits: [], sleepHours: 7 });
  
  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  // Add/Edit Habit State
  const [isAdding, setIsAdding] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  
  const [habitTitle, setHabitTitle] = useState('');
  const [habitDesc, setHabitDesc] = useState('');
  const [habitIcon, setHabitIcon] = useState(HABIT_ICONS[0]);
  const [habitColor, setHabitColor] = useState(HABIT_COLORS[0]);
  const [habitTime, setHabitTime] = useState('');
  const [habitCategory, setHabitCategory] = useState<Category>('Health');
  const [habitFrequency, setHabitFrequency] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  // View State
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [showBonus, setShowBonus] = useState<string | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null); // For toast

  // Timer State
  const [timerHabit, setTimerHabit] = useState<Habit | null>(null);

  useEffect(() => {
    if (!data.logs[today]) {
        const initialLog = { date: today, completedHabits: [], sleepHours: 7 };
        setCurrentLog(initialLog);
        onUpdateData({
            ...data,
            logs: { ...data.logs, [today]: initialLog }
        });
    } else {
        setCurrentLog(data.logs[today]);
    }
  }, [data.logs, today]);

  const toggleHabit = (habitId: string) => {
    const isCompleted = currentLog.completedHabits.includes(habitId);
    let newCompleted = [];
    let pointsChange = 0;
    let bonusMsg = null;

    if (isCompleted) {
      newCompleted = currentLog.completedHabits.filter(id => id !== habitId);
      pointsChange = -10;
    } else {
      newCompleted = [...currentLog.completedHabits, habitId];
      pointsChange = 10;
      playSound('complete'); // Sound Effect
      
      const habit = data.habits.find(h => h.id === habitId);
      if (habit) {
          const currentStreak = calculateStreak(data.logs, habit); 
          const newStreak = currentStreak + 1;
          
          if (newStreak >= 3) {
              pointsChange += 5;
              bonusMsg = `Streak! +${pointsChange} XP`;
          } else {
              bonusMsg = `+${pointsChange} XP`;
          }
      }
    }

    const updatedLog = { ...currentLog, completedHabits: newCompleted };
    
    // Optimistic update for UI speed
    setCurrentLog(updatedLog);

    let updatedProfile = {
      ...data.profile,
      points: Math.max(0, data.profile.points + pointsChange)
    };
    
    // Level Up Check
    const newLevel = calculateLevel(updatedProfile.points);
    if (newLevel > updatedProfile.level) {
        updatedProfile.level = newLevel;
        bonusMsg = `Level Up! Lvl ${newLevel}`;
        playSound('levelUp');
    }

    // Build the provisional new data object to check badges
    const newData = {
      ...data,
      profile: updatedProfile,
      logs: { ...data.logs, [today]: updatedLog }
    };

    // Badge Logic
    const newBadges = checkForNewBadges(newData);
    if (newBadges.length > 0) {
        updatedProfile.unlockedBadges = [
            ...(updatedProfile.unlockedBadges || []),
            ...newBadges.map(b => b.id)
        ];
        // Show the first new badge as a toast
        setUnlockedBadge(newBadges[0].name);
        playSound('success');
        setTimeout(() => setUnlockedBadge(null), 3000);
    }

    if (bonusMsg && pointsChange > 0) {
        setShowBonus(bonusMsg);
        setTimeout(() => setShowBonus(null), 2000);
    }

    onUpdateData({
      ...newData,
      profile: updatedProfile
    });
  };

  const updateSleep = (hours: number) => {
    const updatedLog = { ...currentLog, sleepHours: hours };
    setCurrentLog(updatedLog);
    onUpdateData({
      ...data,
      logs: { ...data.logs, [today]: updatedLog }
    });
  };

  const resetForm = () => {
    setHabitTitle('');
    setHabitDesc('');
    setHabitIcon(HABIT_ICONS[0]);
    setHabitColor(HABIT_COLORS[0]);
    setHabitTime('');
    setHabitCategory('Health');
    setHabitFrequency([0, 1, 2, 3, 4, 5, 6]);
    setEditingHabitId(null);
    setIsAdding(false);
  };

  const startEditHabit = (habit: Habit) => {
    setHabitTitle(habit.title);
    setHabitDesc(habit.description || '');
    setHabitIcon(habit.icon);
    setHabitColor(habit.color);
    setHabitTime(habit.reminderTime || '');
    setHabitCategory(habit.category || 'Health');
    setHabitFrequency(habit.frequency || [0, 1, 2, 3, 4, 5, 6]);
    setEditingHabitId(habit.id);
    setIsAdding(true);
    setExpandedHabitId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveHabit = async () => {
    if (!habitTitle.trim()) return;

    if (habitTime && Notification.permission === 'default') {
        try {
            await Notification.requestPermission();
        } catch (e) {
            console.error("Could not request notification permission", e);
        }
    }

    let updatedHabits = [...data.habits];

    const habitData = {
        title: habitTitle,
        description: habitDesc,
        icon: habitIcon,
        color: habitColor,
        reminderTime: habitTime,
        category: habitCategory,
        frequency: habitFrequency
    };

    if (editingHabitId) {
        updatedHabits = updatedHabits.map(h => 
            h.id === editingHabitId 
            ? { ...h, ...habitData }
            : h
        );
    } else {
        const newHabit: Habit = {
            id: simpleId(),
            ...habitData,
            created_at: new Date().toISOString()
        };
        updatedHabits.push(newHabit);
    }

    onUpdateData({ ...data, habits: updatedHabits });
    resetForm();
  };

  const deleteHabit = () => {
    if (!deletingHabitId) return;
    const updatedHabits = data.habits.filter(h => h.id !== deletingHabitId);
    onUpdateData({ ...data, habits: updatedHabits });
    setDeletingHabitId(null);
  };

  const toggleDayFrequency = (dayId: number) => {
    if (habitFrequency.includes(dayId)) {
        if (habitFrequency.length > 1) {
            setHabitFrequency(habitFrequency.filter(d => d !== dayId));
        }
    } else {
        setHabitFrequency([...habitFrequency, dayId]);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (sourceIndexStr === '') return;
    const sourceIndex = parseInt(sourceIndexStr, 10);
    
    if (sourceIndex === targetIndex) return;

    const newHabits = [...data.habits];
    const [movedHabit] = newHabits.splice(sourceIndex, 1);
    newHabits.splice(targetIndex, 0, movedHabit);

    onUpdateData({ ...data, habits: newHabits });
  };

  const filteredHabits = data.habits.filter(h => {
      if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;
      return true;
  });

  const dueTodayHabits = data.habits.filter(h => h.frequency.includes(new Date().getDay()));
  const completedTodayCount = currentLog.completedHabits.filter(id => {
      const habit = data.habits.find(h => h.id === id);
      return habit && habit.frequency.includes(new Date().getDay());
  }).length;
  
  const progressPercent = dueTodayHabits.length > 0 ? (completedTodayCount / dueTodayHabits.length) * 100 : 0;
  
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-32">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-0.5 tracking-tight">Hello, {data.profile.name || 'Friend'}</h1>
        </div>
        <div className="flex flex-col items-end relative">
             <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {data.profile.avatar}
            </div>
             {showBonus && (
                <div className="absolute top-12 right-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-xl animate-bounce shadow-md whitespace-nowrap z-50">
                    {showBonus}
                </div>
            )}
            {unlockedBadge && (
                <div className="absolute top-12 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl animate-fade-in-up shadow-md whitespace-nowrap z-50 flex items-center gap-1">
                    <Trophy size={14} /> {unlockedBadge} Unlocked!
                </div>
            )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between relative overflow-hidden">
        <div className="flex flex-col z-10">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Daily Focus</span>
            <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tighter">
                    {completedTodayCount}
                </span>
                <span className="text-2xl font-medium text-gray-300 dark:text-gray-600">
                    / {dueTodayHabits.length}
                </span>
            </div>
            <p className="text-sm font-medium text-gray-400 mt-1">habits completed</p>
        </div>
        
        <div className="relative flex items-center justify-center z-10 pr-2">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                    <circle 
                        cx="50" cy="50" r={radius} 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        className="text-gray-100 dark:text-gray-800" 
                    />
                    <circle 
                        cx="50" cy="50" r={radius} 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset} 
                        strokeLinecap="round"
                        className="text-primary transition-all duration-1000 ease-out" 
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {Math.round(progressPercent)}%
                    </span>
                </div>
            </div>
        </div>
        
        <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-full pointer-events-none"></div>
      </div>

      <div>
        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar px-1">
            <button
                onClick={() => setSelectedCategory('All')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === 'All' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-105' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-800'}`}
            >
                All Habits
            </button>
            {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-105' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-800'}`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Your Habits</h3>
          <button 
            onClick={() => {
                if(isAdding) resetForm();
                else setIsAdding(true);
            }}
            className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95"
          >
            {isAdding ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>

        {isAdding && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-900 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-800 animate-slide-down space-y-6">
             <h4 className="font-bold text-lg text-gray-900 dark:text-white">{editingHabitId ? 'Edit Habit' : 'Create New Habit'}</h4>
             
             <input 
              type="text" 
              value={habitTitle}
              onChange={(e) => setHabitTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-medium placeholder:text-gray-400"
              autoFocus
            />

            <div className="grid grid-cols-2 gap-5">
                <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Category</label>
                     <select 
                        value={habitCategory}
                        onChange={(e) => setHabitCategory(e.target.value as Category)}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none appearance-none font-medium"
                     >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                     </select>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Reminder</label>
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3.5 border border-gray-200 dark:border-gray-700">
                        <input 
                            type="time" 
                            value={habitTime}
                            onChange={(e) => setHabitTime(e.target.value)}
                            className="bg-transparent w-full outline-none text-gray-900 dark:text-white font-medium p-0"
                        />
                    </div>
                </div>
            </div>

            <div>
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block ml-1">Frequency</label>
                 <div className="flex justify-between gap-1">
                    {DAYS_OF_WEEK.map(day => {
                        const isSelected = habitFrequency.includes(day.id);
                        return (
                            <button
                                key={day.id}
                                onClick={() => toggleDayFrequency(day.id)}
                                className={`h-11 w-11 rounded-full text-sm font-bold transition-all ${isSelected ? 'bg-black dark:bg-white text-white dark:text-black shadow-md transform scale-105' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                            >
                                {day.label}
                            </button>
                        );
                    })}
                 </div>
            </div>

            <input 
              type="text" 
              value={habitDesc}
              onChange={(e) => setHabitDesc(e.target.value)}
              placeholder="Motivation (Optional)"
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none bg-gray-50 dark:bg-gray-800 text-sm dark:text-white"
            />
            
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block ml-1">Icon</label>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                    {HABIT_ICONS.map(icon => (
                        <button
                            key={icon}
                            onClick={() => setHabitIcon(icon)}
                            className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${habitIcon === icon ? 'bg-black dark:bg-white text-white dark:text-black scale-110 shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block ml-1">Color</label>
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-1">
                    {HABIT_COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => setHabitColor(color)}
                            className={`flex-shrink-0 h-10 w-10 rounded-full transition-all ring-offset-2 dark:ring-offset-gray-900 ${habitColor === color ? 'ring-2 ring-black dark:ring-white scale-110 shadow-sm' : ''}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>

            <Button fullWidth onClick={saveHabit} disabled={!habitTitle} size="lg">
                {editingHabitId ? 'Update Habit' : 'Create Habit'}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {filteredHabits.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                <p>No habits found for this category.</p>
            </div>
          ) : (
            filteredHabits.map((habit, index) => {
                const isDone = currentLog.completedHabits.includes(habit.id);
                const isExpanded = expandedHabitId === habit.id;
                const streak = calculateStreak(data.logs, habit);
                const isScheduledToday = habit.frequency.includes(new Date().getDay());
                
                const opacityClass = isScheduledToday ? 'opacity-100' : 'opacity-60 grayscale-[0.5]';

                return (
                    <div 
                        key={habit.id}
                        draggable={!isExpanded} 
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`
                            relative overflow-hidden rounded-[1.5rem] border transition-all duration-300
                            ${isDone 
                            ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm' 
                            : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm'
                            }
                            ${opacityClass}
                        `}
                    >
                        <div className="flex items-center justify-between p-5">
                            <div 
                                className="flex items-center gap-5 flex-1 cursor-pointer select-none"
                                onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
                            >
                                <div 
                                    className={`h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform duration-500 ${isDone ? 'rotate-[360deg] scale-90' : 'active:scale-95'}`}
                                    style={{ backgroundColor: isDone ? `${habit.color}20` : `${habit.color}15`, color: habit.color }} 
                                >
                                    {habit.icon}
                                </div>
                                <div>
                                    <h4 className={`text-lg font-bold text-gray-900 dark:text-white leading-tight transition-opacity duration-300 ${isDone ? 'opacity-50 line-through' : ''}`}>{habit.title}</h4>
                                    <div className="flex items-center gap-3 text-sm font-medium mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <Flame size={14} className={streak > 0 ? "fill-orange-500 text-orange-500" : "text-gray-300 dark:text-gray-700"} />
                                            <span className={streak > 0 ? "text-orange-600 dark:text-orange-400 font-bold" : "text-gray-400 dark:text-gray-600"}>{streak} Day Streak</span>
                                        </div>
                                         {!isScheduledToday && (
                                            <span className="text-gray-400 text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Skipped</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {isScheduledToday && (
                                <button
                                    onClick={() => toggleHabit(habit.id)}
                                    className={`
                                        h-12 w-12 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 ml-4 active:scale-90
                                        ${isDone ? 'scale-105 border-transparent rotate-0' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800'}
                                    `}
                                    style={{ backgroundColor: isDone ? habit.color : undefined }}
                                >
                                    {isDone && <Check size={22} className="text-white animate-fade-in-up" strokeWidth={3} />}
                                </button>
                            )}
                        </div>

                        {isExpanded && (
                            <div className="bg-gray-50/50 dark:bg-black/20 px-5 pb-5 pt-0 text-sm animate-slide-down">
                                <div className="h-px w-full bg-gray-100 dark:bg-gray-800 mb-4" />
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        {habit.category || 'General'}
                                    </span>
                                     <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        {habit.frequency.length === 7 ? 'Every Day' : `${habit.frequency.length} days/week`}
                                    </span>
                                </div>
                                {habit.description && (
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed font-medium">
                                        "{habit.description}"
                                    </p>
                                )}
                                
                                <MiniCalendar habit={habit} logs={data.logs} />

                                <div className="flex items-center justify-between mt-6">
                                     <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
                                        {habit.reminderTime ? (
                                            <span className="flex items-center gap-1.5"><Bell size={12} /> {habit.reminderTime}</span>
                                        ) : (
                                            <span>No reminder set</span>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setTimerHabit(habit); }}
                                            className="px-3 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors flex items-center gap-1.5 font-bold text-xs"
                                        >
                                            <Timer size={14} /> Focus
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); startEditHabit(habit); }}
                                            className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setDeletingHabitId(habit.id); }}
                                            className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })
          )}
        </div>
      </div>

      <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] p-6 border border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center gap-3 mb-6 text-indigo-900 dark:text-indigo-300">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                <Moon size={20} className="fill-indigo-500 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="font-bold text-lg">Sleep Tracker</h3>
        </div>
        
        <div className="flex flex-col items-center">
            <div className="text-5xl font-extrabold text-indigo-900 dark:text-indigo-100 mb-6 tracking-tighter">
                {currentLog.sleepHours} <span className="text-xl font-bold text-indigo-400 dark:text-indigo-500">hrs</span>
            </div>
            <input 
                type="range" 
                min="0" 
                max="12" 
                step="0.5" 
                value={currentLog.sleepHours}
                onChange={(e) => updateSleep(parseFloat(e.target.value))}
                className="w-full h-3 bg-indigo-200 dark:bg-indigo-900 rounded-full appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
            />
             <div className="flex justify-between w-full mt-3 text-xs text-indigo-400 dark:text-indigo-500 font-bold px-1 uppercase tracking-wide">
                <span>0h</span>
                <span>6h</span>
                <span>12h</span>
            </div>
        </div>
      </div>

      {deletingHabitId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-scale-up border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="h-14 w-14 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 dark:text-red-400 mb-5">
                        <AlertTriangle size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Delete Habit?</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">Are you sure you want to delete this habit? All progress and streak history will be lost forever.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" onClick={() => setDeletingHabitId(null)}>Cancel</Button>
                    <Button variant="danger" onClick={deleteHabit}>Delete</Button>
                </div>
            </div>
        </div>
      )}

      {/* Focus Timer Modal */}
      {timerHabit && (
        <FocusTimer 
            isOpen={!!timerHabit} 
            habitTitle={timerHabit.title}
            onClose={() => setTimerHabit(null)}
            onComplete={() => {
                // If habit not done, mark it as done
                if (!currentLog.completedHabits.includes(timerHabit.id)) {
                    toggleHabit(timerHabit.id);
                }
            }}
        />
      )}
    </div>
  );
};
