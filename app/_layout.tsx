// app/_layout.tsx

import { Slot } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { CategoryProvider } from '../src/contexts/CategoryContext';
import { DocumentProvider } from '../src/contexts/DocumentContext';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext'; // ADDED
import { ThemeProvider } from '../src/contexts/ThemeContext';

// Auth Screens
import PinSetupScreen from './auth/pin-setup'; // ADDED
import LockScreen from './auth/lock-screen'; // ADDED

// ============ Auth Gate Component ============
// ADDED: This component handles conditional rendering based on auth state
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isFirstLaunch, isLoading } = useAuth();
  const theme = useTheme();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // First launch - show PIN setup
  if (isFirstLaunch) {
    return <PinSetupScreen />;
  }

  // Not authenticated - show lock screen
  if (!isAuthenticated) {
    return <LockScreen />;
  }

  // Authenticated - show main app
  return <>{children}</>;
}

// ============ Main Layout ============
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          {/* ADDED: AuthProvider wraps everything */}
          <AuthProvider>
            <CategoryProvider>
              <DocumentProvider>
                {/* ADDED: AuthGate controls access to main app */}
                <AuthGate>
                  <Slot />
                </AuthGate>
              </DocumentProvider>
            </CategoryProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ============ Styles ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});