import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Light theme values from the category screen design.
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#EC5265',
    secondary: '#667085',
    tertiary: '#3FBF9A',
    error: '#D32F2F',
    background: '#F3F5F8',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F5F8',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#161B22',
    onSurface: '#161B22',
    onSurfaceVariant: '#667085',
    outline: 'rgba(16,24,40,0.14)',
    outlineVariant: 'rgba(16,24,40,0.08)',
  },
};

// Dark theme values from the category screen design.
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#EC5265',
    secondary: '#8A92A1',
    tertiary: '#3FBF9A',
    error: '#EF5350',
    background: '#000000',
    surface: '#181C24',
    surfaceVariant: '#1C2129',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#EAEEF5',
    onSurface: '#EAEEF5',
    onSurfaceVariant: '#8A92A1',
    outline: 'rgba(255,255,255,0.13)',
    outlineVariant: 'rgba(255,255,255,0.07)',
  },
};