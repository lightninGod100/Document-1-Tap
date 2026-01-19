// app/auth/lock-screen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Animated, BackHandler } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { PinKeypad } from '../../src/components/PinKeypad';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  validatePIN,
  authenticateWithBiometric,
  recordFailedAttempt,
  checkLockoutStatus,
  clearLockout,
  resetFailedAttempts,
} from '../../src/utils/auth';

export default function LockScreen() {
  const theme = useTheme();
  const { unlock, requiresPinEntry, completeBiometricAuth } = useAuth();

  // State - PIN only (biometric handled by OS)
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [showPinEntry, setShowPinEntry] = useState(false); // Controls when to show PIN UI
  
  // Lockout state
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Shake animation
  const shakeAnim = useState(new Animated.Value(0))[0];

  // Trigger shake animation
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // ============ Check Lockout Status ============
  const checkLockout = useCallback(async () => {
    const status = await checkLockoutStatus();
    setIsLockedOut(status.isLockedOut);
    setLockoutSeconds(status.remainingSeconds);
    return status.isLockedOut;
  }, []);

  // ============ Lockout Countdown Timer ============
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLockedOut && lockoutSeconds > 0) {
      interval = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            clearLockout();
            setErrorMessage('');  
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLockedOut, lockoutSeconds]);

  // ============ Trigger OS Biometric on Mount ============
  useEffect(() => {
    const initAuth = async () => {
      await checkLockout();
      
      // Small delay to let screen render
      const timer = setTimeout(async () => {
        await handleBiometricAuth();
      }, 300);
      
      return () => clearTimeout(timer);
    };
    
    initAuth();
  }, []);

  // ============ Prevent Back Button (Android) ============
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Prevent going back from lock screen
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // ============ Handle PIN Completion ============
  useEffect(() => {
    if (pin.length === 4 && !isProcessing && !isLockedOut) {
      handlePinAuth();
    }
  }, [pin]);

  // ============ OS Biometric Authentication ============
  const handleBiometricAuth = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      const result = await authenticateWithBiometric();

      if (result.success) {
        // Biometric succeeded
        await resetFailedAttempts();
        
        if (requiresPinEntry) {
          // Need PIN after biometric (cold start or >120s)
          completeBiometricAuth(true);
          setShowPinEntry(true);
        } else {
          // Biometric only was needed (30s-120s timeout)
          completeBiometricAuth(false);
          unlock();
        }
      } else {
        // Biometric failed/cancelled by OS
        // OS already showed error - if PIN required, show PIN entry
        if (requiresPinEntry) {
          setShowPinEntry(true);
        } else {
          // For biometric-only flow, retry or stay on screen
          // User can trigger again by coming back to app
          setShowPinEntry(false);
        }
      }
    } catch (err) {
      console.error('Biometric auth error:', err);
      if (requiresPinEntry) {
        setShowPinEntry(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ============ PIN Authentication ============
  const handlePinAuth = async () => {
    if (isProcessing || isLockedOut) return;

    try {
      setIsProcessing(true);
      setError(false);

      const isValid = await validatePIN(pin);

      if (isValid) {
        await resetFailedAttempts();
        unlock();
      } else {
        // Wrong PIN
        const result = await recordFailedAttempt();
        
        setError(true);
        triggerShake();
        
        if (result.isLockedOut) {
          setIsLockedOut(true);
          setLockoutSeconds(30);
          setErrorMessage('Too many attempts. Please wait 30 seconds.');
        } else {
          setAttemptsRemaining(result.attemptsRemaining);
          setErrorMessage(
            `Incorrect PIN. ${result.attemptsRemaining} attempt${result.attemptsRemaining !== 1 ? 's' : ''} remaining.`
          );
        }
        
        // Reset PIN after short delay
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 1000);
      }
    } catch (err) {
      console.error('PIN auth error:', err);
      setErrorMessage('Authentication failed. Please try again.');
      setPin('');
    } finally {
      setIsProcessing(false);
    }
  };

  // ============ Render PIN Entry ============
  const renderPinEntry = () => (
    <View style={styles.pinContainer}>
      {/* Lockout State */}
      {isLockedOut ? (
        <View style={styles.lockoutContainer}>
          <MaterialCommunityIcons
            name="lock-clock"
            size={64}
            color={theme.colors.error}
          />
          <Text variant="titleMedium" style={[styles.lockoutTitle, { color: theme.colors.error }]}>
            Too many attempts
          </Text>
          <Text variant="bodyLarge" style={[styles.lockoutTimer, { color: theme.colors.onSurfaceVariant }]}>
            Try again in {lockoutSeconds} second{lockoutSeconds !== 1 ? 's' : ''}
          </Text>
        </View>
      ) : (
        <>
          {/* PIN Keypad */}
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <PinKeypad
              pin={pin}
              onPinChange={setPin}
              maxLength={4}
              error={error}
              disabled={isProcessing || isLockedOut}
            />
          </Animated.View>

          {/* Processing Indicator */}
          {isProcessing && (
            <ActivityIndicator 
              size="small" 
              color={theme.colors.primary} 
              style={{ marginTop: 16 }} 
            />
          )}
        </>
      )}
    </View>
  );

  // ============ Render Waiting for Biometric ============
  const renderWaitingForBiometric = () => (
    <View style={styles.waitingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text variant="bodyMedium" style={[styles.waitingText, { color: theme.colors.onSurfaceVariant }]}>
        Waiting for authentication...
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.appIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={32}
            color={theme.colors.primary}
          />
        </View>
        <Text variant="headlineSmall" style={[styles.appTitle, { color: theme.colors.onBackground }]}>
          Document 1 Tap
        </Text>
        
        {/* MODIFIED: New subtitle message */}
        {showPinEntry ? (
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            We're making sure it's you, not some imposter
          </Text>
        ) : (
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Unlock to access your documents
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {showPinEntry ? renderPinEntry() : renderWaitingForBiometric()}
      </View>

      {/* Error Message */}
      {errorMessage && !isLockedOut && showPinEntry ? (
        <View style={styles.errorContainer}>
          <Text variant="bodyMedium" style={{ color: theme.colors.error, textAlign: 'center' }}>
            {errorMessage}
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  appIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // PIN Container
  pinContainer: {
    alignItems: 'center',
  },
  // Lockout
  lockoutContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  lockoutTitle: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  lockoutTimer: {
    textAlign: 'center',
  },
  // Waiting for Biometric
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  waitingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  // Error
  errorContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});