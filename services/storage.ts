
import { AppData, DailyLog, Habit, UserProfile, Badge } from '../types';
import { APP_STORAGE_KEY, INITIAL_DATA, LEVELS, BADGES } from '../constants';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Helper to get today's date string YYYY-MM-DD
export const getTodayStr = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(APP_STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_DATA;
  } catch (e) {
    console.error("Failed to load data", e);
    return INITIAL_DATA;
  }
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const isValidAppData = (data: any): data is AppData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'profile' in data &&
    'habits' in data &&
    'logs' in data &&
    Array.isArray(data.habits)
  );
};

export const calculateLevel = (points: number): number => {
  let level = 1;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) {
        level = i + 1;
    } else {
        break;
    }
  }
  return level;
};

export const getLevelTitle = (points: number): string => {
   for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].min) return LEVELS[i].name;
  }
  return LEVELS[0].name;
};

export const calculateNextLevelProgress = (points: number): number => {
  for (let i = 0; i < LEVELS.length - 1; i++) {
    if (points >= LEVELS[i].min && points < LEVELS[i + 1].min) {
      const range = LEVELS[i + 1].min - LEVELS[i].min;
      const progress = points - LEVELS[i].min;
      return (progress / range) * 100;
    }
  }
  return 100; // Max level
};

export const calculateStreak = (logs: Record<string, DailyLog>, habit: Habit): number => {
  let streak = 0;
  const today = new Date(); // Start from today
  
  // Safety break after 365 days
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    
    const dayOfWeek = checkDate.getDay();
    const dateStr = checkDate.toISOString().split('T')[0];
    
    // If the habit is not scheduled for this day of the week, skip it (streak persists)
    if (habit.frequency && !habit.frequency.includes(dayOfWeek)) {
      continue;
    }

    const log = logs[dateStr];
    
    if (log && log.completedHabits.includes(habit.id)) {
      streak++;
    } else if (i === 0) {
      // If today (i=0) is not done, we don't break yet, just don't count it
    } else {
       // If it was a scheduled day and not completed, streak breaks
       break;
    }
  }
  return streak;
};

// Check for new badges
export const checkForNewBadges = (data: AppData): Badge[] => {
    const newBadges: Badge[] = [];
    const currentBadges = new Set(data.profile.unlockedBadges || []);

    BADGES.forEach(badge => {
        if (!currentBadges.has(badge.id)) {
            if (badge.condition(data)) {
                newBadges.push(badge);
            }
        }
    });

    return newBadges;
};

export const exportData = (data: AppData) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "loop_backup_" + getTodayStr() + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const exportToPDF = (data: AppData) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 122, 255); // Primary Blue
  doc.text("Loop Habit Tracker - Report", 14, 20);

  // Profile Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`User: ${data.profile.name}`, 14, 30);
  doc.text(`Level: ${getLevelTitle(data.profile.points)} (${data.profile.points} XP)`, 14, 36);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);

  // Habits Table
  doc.setFontSize(14);
  doc.text("Active Habits", 14, 55);
  
  const habitsData = data.habits.map(h => [
    h.title, 
    h.category || 'General',
    calculateStreak(data.logs, h) + ' days'
  ]);

  autoTable(doc, {
    startY: 60,
    head: [['Habit', 'Category', 'Current Streak']],
    body: habitsData,
    theme: 'grid',
    headStyles: { fillColor: [0, 122, 255] }
  });

  // Logs Summary (Last 14 entries)
  const lastY = (doc as any).lastAutoTable.finalY + 15;
  doc.text("Recent Activity Log", 14, lastY);

  const logsData = Object.entries(data.logs)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 14)
    .map(([date, log]) => [
      date,
      log.completedHabits.length,
      log.sleepHours + ' hrs'
    ]);

  autoTable(doc, {
    startY: lastY + 5,
    head: [['Date', 'Habits Completed', 'Sleep']],
    body: logsData,
    theme: 'striped'
  });

  doc.save(`loop_report_${getTodayStr()}.pdf`);
};

export const exportToExcel = (data: AppData) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Profile & Habits Summary
  const profileData = [
    { Label: "Name", Value: data.profile.name },
    { Label: "Points", Value: data.profile.points },
    { Label: "Level", Value: getLevelTitle(data.profile.points) },
    { Label: "Joined", Value: data.profile.joinedDate },
    { Label: "", Value: "" }, // Spacer
    { Label: "HABIT ID", Value: "HABIT TITLE" } // Header simulation
  ];
  
  data.habits.forEach(h => {
    profileData.push({ Label: h.id, Value: h.title });
  });

  const wsProfile = XLSX.utils.json_to_sheet(profileData);
  XLSX.utils.book_append_sheet(wb, wsProfile, "Profile");

  // Sheet 2: Daily Logs
  const logRows = Object.entries(data.logs).map(([date, log]) => {
    const row: any = {
      Date: date,
      SleepHours: log.sleepHours,
      TotalCompleted: log.completedHabits.length
    };
    
    // Add columns for each habit boolean
    data.habits.forEach(h => {
      row[h.title] = log.completedHabits.includes(h.id) ? "DONE" : "";
    });

    return row;
  });

  // Sort by date descending
  logRows.sort((a, b) => b.Date.localeCompare(a.Date));

  const wsLogs = XLSX.utils.json_to_sheet(logRows);
  XLSX.utils.book_append_sheet(wb, wsLogs, "Activity Logs");

  XLSX.writeFile(wb, `loop_data_${getTodayStr()}.xlsx`);
};
