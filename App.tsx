import React, { useState, useEffect, useRef } from 'react';
import { loadData, saveData } from './services/storage';
import { AppData, Tab, UserProfile, Habit } from './types';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [loading, setLoading] = useState(true);
  const lastCheckedMinute = useRef<string | null>(null);

  useEffect(() => {
    // Simulate loading for smooth feel
    const timer = setTimeout(() => {
        const loaded = loadData();
        // Migration support for old data without categories/frequencies
        if (loaded.habits.length > 0 && !loaded.habits[0].frequency) {
            loaded.habits = loaded.habits.map(h => ({
                ...h,
                category: 'Health',
                frequency: [0, 1, 2, 3, 4, 5, 6]
            }));
            saveData(loaded);
        }
        setData(loaded);
        setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Theme Effect
  useEffect(() => {
    if (data?.profile?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data?.profile?.theme]);

  // Notification Polling Logic
  useEffect(() => {
    if (!data) return;

    const checkReminders = () => {
        // Only check if permission is granted
        if (Notification.permission !== 'granted') return;

        const now = new Date();
        const currentMinute = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const currentDay = now.getDay();

        if (lastCheckedMinute.current === currentMinute) return;
        lastCheckedMinute.current = currentMinute;

        const todayStr = now.toISOString().split('T')[0];
        const log = data.logs[todayStr];
        const completedSet = new Set(log?.completedHabits || []);

        data.habits.forEach(habit => {
            // Check if reminder time matches AND if habit is scheduled for today
            if (habit.reminderTime === currentMinute && 
                !completedSet.has(habit.id) && 
                habit.frequency.includes(currentDay)) {
                
                try {
                    new Notification(`Time for ${habit.title}!`, {
                        body: `Don't break your streak! ${habit.description || 'Time to complete your habit.'}`,
                        icon: '/favicon.ico', // Fallback
                        tag: `loop-${habit.id}-${todayStr}` 
                    });
                } catch (e) {
                    console.error("Notification failed", e);
                }
            }
        });
    };

    const intervalId = setInterval(checkReminders, 5000); // Check every 5s

    return () => clearInterval(intervalId);
  }, [data]);

  const handleUpdateData = (newData: AppData) => {
    setData(newData);
    saveData(newData);
  };

  const handleOnboardingComplete = (profile: UserProfile, firstHabit: Habit) => {
    if (!data) return;
    const newData: AppData = {
      ...data,
      profile,
      habits: [firstHabit],
    };
    handleUpdateData(newData);
  };

  const handleReset = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (!data.profile.isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === Tab.DASHBOARD && (
        <Dashboard data={data} onUpdateData={handleUpdateData} />
      )}
      {activeTab === Tab.ANALYTICS && (
        <Analytics data={data} />
      )}
      {activeTab === Tab.PROFILE && (
        <Profile 
          data={data} 
          onUpdateData={handleUpdateData} 
          onReset={handleReset}
        />
      )}
    </Layout>
  );
};

export default App;