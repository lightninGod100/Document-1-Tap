// app/auth/lock-screen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Animated, BackHandler } from 'react-native';
import { Text, Button, useTheme, ActivityIndicator } from 'react-native-paper';
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

type AuthMode = 'biometric' | 'pin';

export default function LockScreen() {
  const theme = useTheme();
  const { unlock, hasBiometrics, biometricTypeName } = useAuth();

  // State
  const [mode, setMode] = useState<AuthMode>(hasBiometrics ? 'biometric' : 'pin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  
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

  // ============ Initial Setup ============
  useEffect(() => {
    checkLockout();
    
    // Auto-trigger biometric on mount if available
    if (hasBiometrics) {
      // Small delay to let screen render first
      const timer = setTimeout(() => {
        handleBiometricAuth();
      }, 500);
      return () => clearTimeout(timer);
    }
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

  // ============ Biometric Authentication ============
  const handleBiometricAuth = async () => {
    if (isProcessing || isLockedOut) return;

    try {
      setIsProcessing(true);
      setError(false);
      setErrorMessage('');

      const result = await authenticateWithBiometric();

      if (result.success) {
        await resetFailedAttempts();
        unlock();
      } else {
        // Biometric failed or cancelled - show PIN option
        // Don't count as failed attempt (user might have cancelled)
        if (result.error === 'user_cancel' || result.error === 'system_cancel') {
          // User cancelled - just switch to PIN mode
          setMode('pin');
        } else {
          // Actual failure
          setErrorMessage(`${biometricTypeName} failed. Use PIN instead.`);
          setMode('pin');
        }
      }
    } catch (err) {
      console.error('Biometric auth error:', err);
      setMode('pin');
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

  // ============ Switch to PIN Mode ============
  const switchToPinMode = () => {
    setMode('pin');
    setError(false);
    setErrorMessage('');
    setPin('');
  };

  // ============ Retry Biometric ============
  const retryBiometric = () => {
    setMode('biometric');
    setError(false);
    setErrorMessage('');
    setPin('');
    handleBiometricAuth();
  };

  // ============ Get Biometric Icon ============
  const getBiometricIcon = (): string => {
    if (biometricTypeName === 'Face ID') {
      return 'face-recognition';
    }
    return 'fingerprint';
  };

  // ============ Render Biometric Mode ============
  const renderBiometricMode = () => (
    <View style={styles.biometricContainer}>
      {/* Biometric Icon */}
      <View style={[styles.biometricIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons
          name={getBiometricIcon() as any}
          size={64}
          color={theme.colors.primary}
        />
      </View>

      {/* Instructions */}
      <Text variant="titleMedium" style={[styles.biometricTitle, { color: theme.colors.onBackground }]}>
        {isProcessing ? 'Authenticating...' : `Use ${biometricTypeName}`}
      </Text>
      
      <Text variant="bodyMedium" style={[styles.biometricSubtitle, { color: theme.colors.onSurfaceVariant }]}>
        {isProcessing 
          ? 'Please wait...' 
          : `Tap below to authenticate with ${biometricTypeName}`
        }
      </Text>

      {/* Retry Biometric Button */}
      {!isProcessing && (
        <Button
          mode="contained"
          onPress={handleBiometricAuth}
          style={styles.biometricButton}
          icon={getBiometricIcon()}
        >
          Use {biometricTypeName}
        </Button>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 24 }} />
      )}

      {/* Switch to PIN */}
      <Button
        mode="text"
        onPress={switchToPinMode}
        style={styles.switchButton}
        disabled={isProcessing}
      >
        Use PIN instead
      </Button>
    </View>
  );

  // ============ Render PIN Mode ============
  const renderPinMode = () => (
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

      {/* Switch to Biometric (if available) */}
      {hasBiometrics && !isLockedOut && (
        <Button
          mode="text"
          onPress={retryBiometric}
          style={styles.switchButton}
          disabled={isProcessing}
          icon={getBiometricIcon()}
        >
          Use {biometricTypeName}
        </Button>
      )}
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
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {mode === 'biometric' ? 'Unlock to access your documents' : 'Enter your PIN'}
        </Text>
      </View>

      {/* Auth Content */}
      <View style={styles.content}>
        {mode === 'biometric' ? renderBiometricMode() : renderPinMode()}
      </View>

      {/* Error Message */}
      {errorMessage && !isLockedOut ? (
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
    marginBottom: 4,
  },
  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Biometric Mode
  biometricContainer: {
    alignItems: 'center',
  },
  biometricIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  biometricTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  biometricSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  biometricButton: {
    marginTop: 8,
    minWidth: 200,
  },
  // PIN Mode
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
  // Switch Button
  switchButton: {
    marginTop: 24,
  },
  // Error
  errorContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
