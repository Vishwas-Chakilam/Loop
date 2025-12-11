
import React, { useState, useRef } from 'react';
import { AppData, UserProfile } from '../types';
import { exportData, exportToPDF, exportToExcel, isValidAppData, getLevelTitle } from '../services/storage';
import { Button } from '../components/Button';
import { Download, Trash2, Edit2, FileText, Sheet, Github, Linkedin, Mail, Code, Terminal, Palette, Globe, Moon, Sun, Bell, Upload, Lock, Trophy } from 'lucide-react';
import { AVATARS, BADGES, AVATAR_LEVELS } from '../constants';

interface ProfileProps {
  data: AppData;
  onUpdateData: (newData: AppData) => void;
  onReset: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ data, onUpdateData, onReset }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(data.profile.name);
  const [editAvatar, setEditAvatar] = useState(data.profile.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveProfile = () => {
    const updated: UserProfile = {
      ...data.profile,
      name: editName,
      avatar: editAvatar
    };
    onUpdateData({ ...data, profile: updated });
    setIsEditing(false);
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will delete all your progress.")) {
      localStorage.clear();
      onReset();
    }
  };

  const toggleTheme = () => {
    const newTheme = data.profile.theme === 'dark' ? 'light' : 'dark';
    onUpdateData({
        ...data,
        profile: { ...data.profile, theme: newTheme }
    });
  };

  const requestNotificationPermission = async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification("Notifications Enabled", { body: "You will now receive daily reminders." });
      } else {
        alert("Notifications were denied. Please enable them in your browser settings.");
      }
    } else if (Notification.permission === 'granted') {
      new Notification("Test Notification", { body: "Notifications are working!" });
    } else {
      alert("Notifications are blocked. Please check your browser settings.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const parsed = JSON.parse(json);
        
        if (isValidAppData(parsed)) {
            if (parsed.habits.length > 0 && !parsed.habits[0].frequency) {
                parsed.habits = parsed.habits.map((h: any) => ({
                    ...h,
                    category: 'Health',
                    frequency: [0, 1, 2, 3, 4, 5, 6]
                }));
            }
            if (!parsed.profile.unlockedBadges) {
                parsed.profile.unlockedBadges = [];
            }

            if (confirm("This will overwrite your current data with the imported file. Are you sure?")) {
                onUpdateData(parsed);
                alert("Data imported successfully!");
            }
        } else {
            alert("Invalid backup file format. Please use a valid Loop JSON backup.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse the file.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset
  };

  const unlockedBadgesSet = new Set(data.profile.unlockedBadges || []);

  return (
    <div className="p-6 space-y-10 animate-fade-in pb-32">
      <div className="flex justify-between items-center pt-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Profile</h1>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-yellow-400 transition-colors shadow-sm border border-gray-100 dark:border-gray-700"
        >
          {data.profile.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center relative transition-colors">
        <button 
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-6 right-6 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
            <Edit2 size={16} />
        </button>

        {isEditing ? (
            <div className="w-full space-y-6 animate-fade-in">
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {AVATARS.map(a => {
                        const requiredLevel = AVATAR_LEVELS[a] || 0;
                        const isLocked = data.profile.level < requiredLevel;
                        return (
                            <button 
                                key={a} 
                                onClick={() => !isLocked && setEditAvatar(a)} 
                                disabled={isLocked}
                                className={`text-3xl p-3 rounded-2xl flex items-center justify-center relative transition-all ${editAvatar === a ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500' : 'bg-gray-50 dark:bg-gray-800'} ${isLocked ? 'opacity-50' : ''}`}
                            >
                                {a}
                                {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-2xl"><Lock size={12} className="text-gray-600" /></div>}
                            </button>
                        )
                    })}
                </div>
                <input 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-center text-2xl font-bold border-b-2 border-gray-100 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:border-black dark:focus:border-white outline-none pb-2 transition-colors"
                    placeholder="Your Name"
                />
                <Button onClick={saveProfile} fullWidth size="lg">Save Changes</Button>
            </div>
        ) : (
            <>
                <div className="h-28 w-28 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-6xl mb-5 shadow-inner border border-gray-100 dark:border-gray-700">
                {data.profile.avatar}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{data.profile.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{data.profile.email || 'No email connected'}</p>
                
                <div className="flex gap-4 mt-8 w-full">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-center transition-colors">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Level {data.profile.level}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{getLevelTitle(data.profile.points)}</div>
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-center transition-colors">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">XP Points</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.profile.points}</div>
                    </div>
                </div>
            </>
        )}
      </div>

      {/* Achievements Section */}
      <div>
         <div className="flex items-center gap-2 mb-4 px-2">
            <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Trophy className="text-yellow-600 dark:text-yellow-400" size={18} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Achievements</h3>
         </div>
         <div className="grid grid-cols-2 gap-4">
            {BADGES.map(badge => {
                const isUnlocked = unlockedBadgesSet.has(badge.id);
                return (
                    <div 
                        key={badge.id}
                        className={`p-5 rounded-2xl border transition-all duration-300 ${isUnlocked ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm' : 'bg-gray-50 dark:bg-gray-800/50 border-transparent opacity-60 grayscale'}`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-3xl">{badge.icon}</div>
                            {isUnlocked ? (
                                <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">EARNED</span>
                            ) : (
                                <Lock size={16} className="text-gray-400" />
                            )}
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{badge.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug font-medium">{badge.description}</p>
                    </div>
                )
            })}
         </div>
      </div>

      {/* Settings Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white px-2">Settings</h3>
        
        <button 
          onClick={requestNotificationPermission}
          className="w-full flex items-center gap-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
        >
          <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Bell size={22} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 dark:text-white">Notifications</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Enable daily habit reminders</div>
          </div>
        </button>
      </div>

      {/* Export & Data Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white px-2">Data & Privacy</h3>
        
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => exportToPDF(data)}
                className="flex flex-col items-center justify-center p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-100 dark:hover:border-red-900/30 transition-all group"
            >
                <FileText size={28} className="text-red-500 dark:text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Export PDF</span>
            </button>
            <button 
                onClick={() => exportToExcel(data)}
                className="flex flex-col items-center justify-center p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-100 dark:hover:border-green-900/30 transition-all group"
            >
                <Sheet size={28} className="text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Export Excel</span>
            </button>
        </div>

        <button 
          onClick={() => exportData(data)}
          className="w-full flex items-center gap-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
        >
          <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Download size={22} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 dark:text-white">Backup JSON</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Download raw data backup</div>
          </div>
        </button>

        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
        />
        
        <button 
          onClick={handleImportClick}
          className="w-full flex items-center gap-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors text-left group"
        >
          <div className="h-12 w-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload size={22} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 dark:text-white">Import JSON</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Restore from backup file</div>
          </div>
        </button>

         <button 
          onClick={handleReset}
          className="w-full flex items-center gap-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group"
        >
          <div className="h-12 w-12 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trash2 size={22} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-red-600 dark:text-red-400">Reset App</div>
            <div className="text-xs text-red-400 dark:text-red-500/80 font-medium mt-0.5">Clear all data and start over</div>
          </div>
        </button>
      </div>

      {/* Developer Card */}
      <div className="pt-2 pb-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white px-2 mb-4">About Developer</h3>
        <div className="bg-gradient-to-br from-gray-900 to-black dark:from-gray-800 dark:to-gray-900 text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden border border-gray-800">
            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg border-2 border-white/20">
                        VC
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold tracking-tight">Vishwas Chakilam</h4>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Full Stack Developer</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Interests</p>
                        <div className="flex gap-4 text-gray-300">
                             <div className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"><Code size={20} /></div>
                             <div className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"><Terminal size={20} /></div>
                             <div className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"><Palette size={20} /></div>
                             <div className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"><Globe size={20} /></div>
                        </div>
                    </div>

                    <div>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Connect</p>
                         <div className="flex gap-4">
                            <a href="https://linkedin.com/in/vishwas-chakilam" target="_blank" rel="noopener noreferrer" className="h-12 w-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg">
                                <Linkedin size={20} />
                            </a>
                            <a href="https://github.com/vishwas-chakilam" target="_blank" rel="noopener noreferrer" className="h-12 w-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg">
                                <Github size={20} />
                            </a>
                            <a href="mailto:work.vishwas1@gmail.com" className="h-12 w-12 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg">
                                <Mail size={20} />
                            </a>
                            <a href="https://leetcode.com/u/Vishwas-1/" target="_blank" rel="noopener noreferrer" className="h-12 w-12 bg-yellow-600 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg" title="LeetCode">
                                <Code size={20} />
                            </a>
                         </div>
                    </div>
                </div>
            </div>

            {/* Decorative BG */}
            <div className="absolute top-[-20%] right-[-10%] w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 dark:text-gray-600 pt-4 font-medium">
        Loop v2.0 • Designed & Built with Passion
      </div>
    </div>
  );
};
