import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Light Theme - Professional blue color scheme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976D2',           // Primary blue
    secondary: '#424242',         // Dark gray
    tertiary: '#4CAF50',          // Success green
    error: '#D32F2F',             // Error red
    background: '#F5F5F5',        // Light gray background
    surface: '#FFFFFF',           // White cards/surfaces
    onPrimary: '#FFFFFF',         // Text on primary color
    onSecondary: '#FFFFFF',       // Text on secondary color
    onBackground: '#212121',      // Text on background
    onSurface: '#212121',         // Text on surface
  },
};

// Dark Theme - Professional dark blue scheme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9',           // Light blue for dark mode
    secondary: '#B0BEC5',         // Light gray
    tertiary: '#81C784',          // Light green
    error: '#EF5350',             // Light red
    background: '#121212',        // Almost black
    surface: '#1E1E1E',           // Dark gray cards
    onPrimary: '#000000',         // Text on primary (black for contrast)
    onSecondary: '#000000',       // Text on secondary
    onBackground: '#FFFFFF',      // White text on dark background
    onSurface: '#FFFFFF',         // White text on dark surfaces
  },
};