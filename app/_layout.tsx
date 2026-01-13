// app/_layout.tsx

import { Slot } from 'expo-router';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { PaperProvider, ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { CategoryProvider } from '../src/contexts/CategoryContext';
import { DocumentProvider } from '../src/contexts/DocumentContext';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext'; // ADDED

// Auth Screens
import PinSetupScreen from './auth/pin-setup'; // ADDED
import LockScreen from './auth/lock-screen'; // ADDED

// Theme
import { darkTheme, lightTheme } from '../src/theme/theme';

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
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
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
        </PaperProvider>
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