import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';

export type ThemeMode = 'light' | 'dark' | 'herbal';

type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  colors: typeof colors.light & { radius: number };
};

const THEME_STORAGE_KEY = 'ip_sakti_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  colors: { ...colors.light, radius: colors.radius },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    void AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'herbal') {
        setThemeState(stored);
      } else if (systemScheme === 'dark') {
        setThemeState('dark');
      }
    });
  }, [systemScheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    const next: ThemeMode = theme === 'light' ? 'dark' : theme === 'dark' ? 'herbal' : 'light';
    setTheme(next);
  };

  const currentPalette =
    theme === 'dark'
      ? colors.dark
      : theme === 'herbal'
        ? colors.herbal
        : colors.light;

  const resolvedColors = {
    ...currentPalette,
    radius: colors.radius,
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, colors: resolvedColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColors() {
  const context = useContext(ThemeContext);
  if (context && context.colors) {
    return context.colors;
  }
  return { ...colors.light, radius: colors.radius };
}
