import React from 'react';
import { Tab } from '../types';
import { LayoutDashboard, BarChart2, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-background dark:bg-black text-gray-900 dark:text-gray-100 font-sans flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative transition-colors duration-300">
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {children}
      </main>
      
      <nav className="fixed bottom-0 w-full max-w-md bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 pb-6 z-50 transition-colors duration-300">
        <div className="flex justify-between items-center">
          <NavItem 
            icon={<LayoutDashboard size={24} />} 
            label="Today" 
            isActive={activeTab === Tab.DASHBOARD} 
            onClick={() => onTabChange(Tab.DASHBOARD)} 
          />
          <NavItem 
            icon={<BarChart2 size={24} />} 
            label="Analytics" 
            isActive={activeTab === Tab.ANALYTICS} 
            onClick={() => onTabChange(Tab.ANALYTICS)} 
          />
          <NavItem 
            icon={<User size={24} />} 
            label="Profile" 
            isActive={activeTab === Tab.PROFILE} 
            onClick={() => onTabChange(Tab.PROFILE)} 
          />
        </div>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  onClick: () => void 
}> = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'}`}
  >
    <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);