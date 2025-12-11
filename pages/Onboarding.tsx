
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { AVATARS, HABIT_ICONS } from '../constants';
import { UserProfile, Habit } from '../types';

const simpleId = () => Math.random().toString(36).substr(2, 9);

interface OnboardingProps {
  onComplete: (profile: UserProfile, firstHabit: Habit) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitIcon, setHabitIcon] = useState(HABIT_ICONS[0]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      const profile: UserProfile = {
        name,
        email,
        avatar,
        isOnboarded: true,
        points: 50, // Starting bonus
        level: 1,
        joinedDate: new Date().toISOString(),
        theme: 'light', // Default to light
        unlockedBadges: []
      };
      
      const firstHabit: Habit = {
        id: simpleId(),
        title: habitTitle || 'Drink Water',
        icon: habitIcon,
        color: '#007AFF',
        category: 'Health',
        frequency: [0, 1, 2, 3, 4, 5, 6],
        created_at: new Date().toISOString()
      };
      
      onComplete(profile, firstHabit);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col p-6 max-w-md mx-auto relative overflow-hidden transition-colors">
      <div className="flex-1 flex flex-col justify-center z-10">
        
        {/* Progress Dots */}
        <div className="flex gap-2 mb-8 justify-center">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 w-2 rounded-full transition-all duration-300 ${step === i ? 'w-6 bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-800'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fade-in-up space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome to Loop</h1>
              <p className="text-gray-500 dark:text-gray-400">Let's get to know you.</p>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="grid grid-cols-4 gap-3">
                {AVATARS.map(a => (
                  <button 
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`text-3xl p-3 rounded-2xl border-2 transition-all ${avatar === a ? 'border-primary bg-primary/10 scale-110' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="e.g. Alex"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up space-y-6">
             <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Stay Connected</h1>
              <p className="text-gray-500 dark:text-gray-400">Secure your account (optional).</p>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="alex@example.com"
                />
              </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">First Habit</h1>
              <p className="text-gray-500 dark:text-gray-400">What's one thing you want to do daily?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Habit Name</label>
              <input 
                type="text" 
                value={habitTitle}
                onChange={e => setHabitTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g. Morning Run"
              />
            </div>

             <div className="flex justify-center mt-4">
              <div className="grid grid-cols-5 gap-2">
                {HABIT_ICONS.map(icon => (
                  <button 
                    key={icon}
                    onClick={() => setHabitIcon(icon)}
                    className={`text-2xl p-2 rounded-xl transition-all ${habitIcon === icon ? 'bg-black dark:bg-white text-white dark:text-black scale-110 shadow-lg' : 'bg-gray-50 dark:bg-gray-900 text-gray-500'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="py-6 z-10">
        <Button 
          fullWidth 
          onClick={handleNext} 
          disabled={step === 1 && !name}
        >
          {step === 3 ? "Start Journey" : "Continue"}
        </Button>
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
    </div>
  );
};
