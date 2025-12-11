import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { COLORS } from '@/utils/theme';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    colors: (typeof COLORS.light | typeof COLORS.dark) & { primary: string; secondary: string };
    toggleTheme: () => Promise<void>;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const { preferences, updatePreferences } = useUserPreferences();
    const [theme, setTheme] = useState<Theme>(preferences.darkMode ? 'dark' : 'light');

    useEffect(() => {
        // Sync with preferences when they change
        setTheme(preferences.darkMode ? 'dark' : 'light');
    }, [preferences.darkMode]);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        await updatePreferences({ darkMode: newTheme === 'dark' });
    };

    const colors = {
        primary: COLORS.primary,
        secondary: COLORS.secondary,
        ...(theme === 'dark' ? COLORS.dark : COLORS.light),
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            colors,
            toggleTheme,
            isDark: theme === 'dark',
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
