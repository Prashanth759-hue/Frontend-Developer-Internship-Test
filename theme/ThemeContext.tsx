import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ColorScheme } from './colors';

export type ThemeMode = 'light' | 'dark';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

interface ThemeContextType {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  /** Flips between light and dark — this is the only theme control the app exposes. */
  toggleMode: () => void;
  isDark: boolean;
}

const THEME_STORAGE_KEY = '@vahan360_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  colorScheme: 'light',
  colors: Colors.light,
  setMode: () => {},
  toggleMode: () => {},
  isDark: false,
});

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Default theme is always 'light' on first install — no system/auto option.
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [loaded, setLoaded] = useState(false);

  // Restore the user's saved theme choice on app start.
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setModeState(saved);
      }
      setLoaded(true);
    });
  }, []);

  // Persist the theme choice whenever the user changes it.
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const colorScheme: ColorScheme = mode;
  const isDark = mode === 'dark';
  const colors: ThemeColors = isDark ? Colors.dark : Colors.light;

  // Avoid a flash of the wrong theme while AsyncStorage loads.
  if (!loaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colorScheme,
        colors,
        setMode,
        toggleMode,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);