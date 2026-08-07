// app/_layout.tsx

import { Slot, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { useEffect } from 'react';

// Contexts
import { CategoryProvider } from '../src/contexts/CategoryContext';
import { DocumentProvider } from '../src/contexts/DocumentContext';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext'; // ADDED
import { ThemeProvider } from '../src/contexts/ThemeContext';

// Auth Screens
import PinSetupScreen from './auth/pin-setup'; // ADDED
import LockScreen from './auth/lock-screen'; // ADDED

function ShareIntentHandler() {
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();

  useEffect(() => {
    if (!hasShareIntent) return;

    const sharedFile = shareIntent.files?.find((file) => {
      const mimeType = file.mimeType?.toLowerCase() ?? '';
      const fileName = file.fileName?.toLowerCase() ?? '';
      return mimeType.startsWith('image/') ||
        mimeType === 'application/pdf' ||
        fileName.endsWith('.pdf');
    });

    if (sharedFile) {
      router.push({
        pathname: '/add-document',
        params: {
          sharedUri: sharedFile.path,
          sharedMimeType: sharedFile.mimeType ?? '',
          sharedName: sharedFile.fileName ?? '',
        },
      });
    }

    resetShareIntent();
  }, [hasShareIntent, resetShareIntent, router, shareIntent.files]);

  return null;
}

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
    <ShareIntentProvider>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <ThemeProvider>
            {/* ADDED: AuthProvider wraps everything */}
            <AuthProvider>
              <CategoryProvider>
                <DocumentProvider>
                  {/* ADDED: AuthGate controls access to main app */}
                  <AuthGate>
                    <ShareIntentHandler />
                    <Slot />
                  </AuthGate>
                </DocumentProvider>
              </CategoryProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ShareIntentProvider>
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