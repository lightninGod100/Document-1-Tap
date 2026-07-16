import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { darkTheme, lightTheme } from '../theme/theme';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
}

const THEME_STORAGE_KEY = '@document_1_tap_theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((storedPreference) => {
        if (
          storedPreference === 'system' ||
          storedPreference === 'light' ||
          storedPreference === 'dark'
        ) {
          setPreferenceState(storedPreference);
        }
      })
      .catch((error) => console.error('Failed to load theme preference:', error));
  }, []);

  const setPreference = useCallback(async (nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  const resolvedScheme = preference === 'system' ? systemScheme : preference;
  const theme = resolvedScheme === 'dark' ? darkTheme : lightTheme;
  const value = useMemo(() => ({ preference, setPreference }), [preference, setPreference]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    Promise.all([
      NavigationBar.setButtonStyleAsync(resolvedScheme === 'dark' ? 'light' : 'dark'),
      NavigationBar.setBackgroundColorAsync(theme.colors.background),
    ]).catch((error) => console.error('Failed to update navigation bar theme:', error));
  }, [resolvedScheme, theme.colors.background]);

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={theme}>
        <StatusBar
          style={resolvedScheme === 'dark' ? 'light' : 'dark'}
          backgroundColor={theme.colors.background}
        />
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }

  return context;
}
