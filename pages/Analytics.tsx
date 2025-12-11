
import React, { useState } from 'react';
import { AppData, Category } from '../types';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getHabitInsights } from '../services/geminiService';
import { Sparkles, Loader2 } from 'lucide-react';

interface AnalyticsProps {
  data: AppData;
}

export const Analytics: React.FC<AnalyticsProps> = ({ data }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const isDark = data.profile.theme === 'dark';

  // Prepare Chart Data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const log = data.logs[date];
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      completed: log ? log.completedHabits.length : 0,
      sleep: log ? log.sleepHours : 0
    };
  });

  // Category Breakdown Data
  const categoryCounts: Record<string, number> = {};
  data.habits.forEach(h => {
    const cat = h.category || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  
  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#34C759', '#5AC8FA'];

  const handleGetInsight = async () => {
    setLoadingInsight(true);
    const result = await getHabitInsights(data);
    setInsight(result);
    setLoadingInsight(false);
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-24">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white pt-2">Analytics</h1>

      {/* Habits Chart */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <h3 className="font-bold text-gray-900 dark:text-white mb-8 text-lg">Habit Consistency</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#9CA3AF' }} 
                dy={15}
              />
              <Tooltip 
                cursor={{ fill: isDark ? '#374151' : '#F3F4F6', radius: 12 }}
                contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.15)',
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#000000',
                    padding: '12px 16px',
                    fontWeight: 'bold'
                }}
              />
              <Bar 
                dataKey="completed" 
                fill={isDark ? '#FFFFFF' : '#000000'} 
                radius={[8, 8, 8, 8]} 
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <h3 className="font-bold text-gray-900 dark:text-white mb-8 text-lg">Habit Categories</h3>
        <div className="h-56 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={8}
                            dataKey="value"
                            stroke={isDark ? '#111827' : '#FFFFFF'}
                            strokeWidth={4}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                borderRadius: '16px', 
                                border: 'none', 
                                boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.15)',
                                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                color: isDark ? '#FFFFFF' : '#000000',
                                padding: '12px 16px',
                                fontWeight: 'bold'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-gray-400 text-sm font-medium">No habits to categorize yet.</p>
            )}
        </div>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
             {pieData.map((entry, index) => (
                 <div key={entry.name} className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                     <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                     {entry.name}
                 </div>
             ))}
        </div>
      </div>

      {/* Sleep Chart */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <h3 className="font-bold text-gray-900 dark:text-white mb-8 text-lg">Sleep Trends</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
               <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                dy={15}
              />
              <Tooltip 
                 contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.15)',
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#000000',
                    padding: '12px 16px',
                    fontWeight: 'bold'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sleep" 
                stroke="#5856D6" 
                strokeWidth={4} 
                dot={{ fill: '#5856D6', strokeWidth: 2, r: 5, stroke: '#FFF' }} 
                activeDot={{ r: 8, stroke: '#5856D6', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Coach */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-purple-900 dark:to-indigo-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-4">
            <Sparkles className="text-yellow-300 fill-yellow-300" size={24} />
            <h3 className="font-bold text-xl tracking-tight">Loop AI Coach</h3>
          </div>
          
          {insight ? (
            <div className="animate-fade-in">
              <p className="text-purple-50 font-medium leading-relaxed text-lg">{insight}</p>
              <button 
                onClick={handleGetInsight} 
                className="mt-6 text-xs font-bold uppercase tracking-widest text-purple-200 hover:text-white transition-colors"
              >
                Refresh Insight
              </button>
            </div>
          ) : (
            <div>
              <p className="text-purple-100 font-medium mb-6 text-lg">Get personalized insights based on your recent activity patterns.</p>
              <button 
                onClick={handleGetInsight}
                disabled={loadingInsight}
                className="bg-white text-purple-700 px-6 py-3 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2"
              >
                {loadingInsight ? <Loader2 className="animate-spin" size={18} /> : "Analyze My Habits"}
              </button>
            </div>
          )}
        </div>
        
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/50 rounded-full blur-2xl -ml-8 -mb-8"></div>
      </div>
      <div className="h-4" />
    </div>
  );
};
