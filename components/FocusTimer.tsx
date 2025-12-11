
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { playSound } from '../services/audioService';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  habitTitle: string;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ isOpen, onClose, onComplete, habitTitle }) => {
  const [duration, setDuration] = useState(25 * 60); // Default 25 min
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      playSound('timer');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
        setIsFinished(false);
        setIsActive(false);
        setTimeLeft(duration);
    }
  }, [isOpen, duration]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    onComplete();
    onClose();
  };

  const setPreset = (mins: number) => {
    const secs = mins * 60;
    setDuration(secs);
    setTimeLeft(secs);
    setIsActive(false);
    setIsFinished(false);
  };

  // Circular progress math
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = 1 - (timeLeft / duration);
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm p-8 shadow-2xl relative flex flex-col items-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Focus Mode</h3>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">{habitTitle}</h2>

        {/* Timer Visualization */}
        <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
                <circle cx="150" cy="150" r={radius} stroke="#E5E7EB" strokeWidth="8" fill="transparent" className="dark:stroke-gray-800" />
                <circle 
                    cx="150" cy="150" r={radius} 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round"
                    className="text-blue-500 transition-all duration-1000 ease-linear"
                />
             </svg>
             <div className="absolute text-5xl font-mono font-bold text-gray-900 dark:text-white">
                {formatTime(timeLeft)}
             </div>
        </div>

        {isFinished ? (
            <div className="text-center animate-fade-in-up w-full">
                <h3 className="text-2xl font-bold text-green-500 mb-2">Session Complete!</h3>
                <p className="text-gray-500 mb-6">Well done staying focused.</p>
                <Button fullWidth onClick={handleFinish} className="bg-green-500 hover:bg-green-600 text-white">
                    <CheckCircle className="mr-2" size={20} /> Complete Habit
                </Button>
            </div>
        ) : (
            <>
                <div className="flex gap-4 mb-8">
                    <button 
                        onClick={() => setIsActive(!isActive)}
                        className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl transition-all shadow-lg ${isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                        {isActive ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                    </button>
                    <button 
                        onClick={() => { setIsActive(false); setTimeLeft(duration); }}
                        className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <RotateCcw size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-2 w-full">
                    {[5, 15, 25, 45].map(m => (
                        <button
                            key={m}
                            onClick={() => setPreset(m)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${duration === m * 60 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-50 dark:bg-gray-800 text-gray-500'}`}
                        >
                            {m}m
                        </button>
                    ))}
                </div>
            </>
        )}
      </div>
    </div>
  );
};
