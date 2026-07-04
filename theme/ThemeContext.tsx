import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ColorScheme } from './colors';

type ThemeMode = 'light' | 'dark' | 'auto';

type ThemeColors = typeof Colors.light | typeof Colors.dark;

interface ThemeContextType {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const THEME_STORAGE_KEY = '@vahan360_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  colorScheme: 'light',
  colors: Colors.light,
  setMode: () => {},
  isDark: false,
});

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme();

  // Default theme is 'light' (not 'auto') per product requirement.
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [loaded, setLoaded] = useState(false);

  // Restore the user's saved theme choice on app start.
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'auto') {
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

  const colorScheme: ColorScheme =
    mode === 'auto'
      ? ((systemScheme ?? 'light') as ColorScheme)
      : mode;

  const isDark = colorScheme === 'dark';

  const colors: ThemeColors = isDark
    ? Colors.dark
    : Colors.light;

  // Avoid a flash of the wrong theme while AsyncStorage loads.
  if (!loaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colorScheme,
        colors,
        setMode,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);