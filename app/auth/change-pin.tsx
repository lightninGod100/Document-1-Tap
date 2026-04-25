// app/auth/change-pin.tsx

// ADDED: New screen for Phase 9D - Change PIN flow
// Reuses: PinKeypad component, validatePIN/storePIN utilities,
//         global lockout system (recordFailedAttempt, checkLockoutStatus, etc.)

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Appbar, Text, useTheme, ActivityIndicator, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { PinKeypad } from '../../src/components/PinKeypad';
import {
  validatePIN,
  storePIN,
  recordFailedAttempt,
  resetFailedAttempts,
  checkLockoutStatus,
  clearLockout,
} from '../../src/utils/auth';

// ============ Types ============
type ChangeStep = 'verify' | 'new' | 'confirm';

export default function ChangePinScreen() {
  const theme = useTheme();
  const router = useRouter();

  // ============ State ============
  const [step, setStep] = useState<ChangeStep>('verify');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  // Holds the verified current PIN in memory ONLY for the duration of this flow.
  // Used to enforce "new PIN must differ from current" without a second SecureStore read.
  const [currentVerifiedPin, setCurrentVerifiedPin] = useState('');

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  // Lockout state (mirrors lock-screen behavior — global lockout system)
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Snackbar for success
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Shake animation
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ============ Animation ============
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // ============ Lockout Check on Mount ============
  // If user already exhausted attempts elsewhere (e.g., main lock screen),
  // they'll see the lockout UI immediately here too.
  useEffect(() => {
    const init = async () => {
      const status = await checkLockoutStatus();
      if (status.isLockedOut) {
        setIsLockedOut(true);
        setLockoutSeconds(status.remainingSeconds);
      }
    };
    init();
  }, []);

  // ============ Lockout Countdown Timer ============
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

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

  // ============ Auto-trigger on PIN completion ============
  useEffect(() => {
    if (pin.length === 4 && !isProcessing && !isLockedOut) {
      handlePinComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  // ============ Step Handlers ============
  const handlePinComplete = async () => {
    if (step === 'verify') {
      await handleVerifyStep();
    } else if (step === 'new') {
      handleNewStep();
    } else {
      await handleConfirmStep();
    }
  };

  // Step 1: Verify current PIN
  const handleVerifyStep = async () => {
    try {
      setIsProcessing(true);
      setError(false);

      const isValid = await validatePIN(pin);

      if (isValid) {
        // Verified — reset global failure counter, advance to step 2
        await resetFailedAttempts();
        setCurrentVerifiedPin(pin); // Hold in memory for "must differ" check
        setPin('');
        setStep('new');
        setErrorMessage('');
      } else {
        // Wrong PIN — record failure against global lockout
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
            `Incorrect PIN. ${result.attemptsRemaining} attempt${
              result.attemptsRemaining !== 1 ? 's' : ''
            } remaining.`
          );
        }

        setTimeout(() => {
          setPin('');
          setError(false);
        }, 1000);
      }
    } catch (err) {
      console.error('Verify PIN error:', err);
      setErrorMessage('Verification failed. Please try again.');
      setPin('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Capture new PIN (no async, no storage)
  const handleNewStep = () => {
    if (pin === currentVerifiedPin) {
      // Reject — must differ from current
      setError(true);
      setErrorMessage('New PIN must be different from your current PIN.');
      triggerShake();
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 1500);
      return;
    }

    // Accept — move to confirm step
    setNewPin(pin);
    setPin('');
    setStep('confirm');
    setError(false);
    setErrorMessage('');
  };

  // Step 3: Confirm new PIN matches, persist, navigate back
  const handleConfirmStep = async () => {
    if (pin !== newPin) {
      // Mismatch — restart from step 'new' (verified PIN preserved)
      setError(true);
      setErrorMessage('PINs do not match. Please try again.');
      triggerShake();
      setTimeout(() => {
        setPin('');
        setNewPin('');
        setStep('new');
        setError(false);
      }, 1500);
      return;
    }

    // Match — persist new PIN
    try {
      setIsProcessing(true);
      const ok = await storePIN(newPin);
      if (!ok) {
        throw new Error('storePIN returned false');
      }

      // Show success snackbar, then navigate back after a short delay
      setSnackbarVisible(true);
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (err) {
      console.error('Failed to store new PIN:', err);
      setError(true);
      setErrorMessage('Failed to save new PIN. Please try again.');
      // Stay on confirm step; clear input so user can retry
      setPin('');
      triggerShake();
    } finally {
      setIsProcessing(false);
    }
  };

  // ============ Header Content ============
  const getStepContent = () => {
    if (step === 'verify') {
      return {
        title: 'Enter current PIN',
        subtitle: 'Verify your identity to change your PIN',
      };
    }
    if (step === 'new') {
      return {
        title: 'Enter new PIN',
        subtitle: 'Choose a new 4-digit PIN',
      };
    }
    return {
      title: 'Confirm new PIN',
      subtitle: 'Re-enter your new PIN to confirm',
    };
  };

  const { title, subtitle } = getStepContent();

  // ============ Step Dot Color ============
  const getDotColor = (dotStep: ChangeStep): string => {
    // Active step gets primary; completed steps also primary; future steps muted.
    const order: ChangeStep[] = ['verify', 'new', 'confirm'];
    return order.indexOf(dotStep) <= order.indexOf(step)
      ? theme.colors.primary
      : theme.colors.outline;
  };

  // ============ Render ============
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      {/* App Bar with back button */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} disabled={isProcessing} />
        <Appbar.Content title="Change PIN" />
      </Appbar.Header>

      {/* Header Section */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <MaterialCommunityIcons
            name="lock-reset"
            size={48}
            color={theme.colors.primary}
          />
        </View>

        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          {title}
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          {subtitle}
        </Text>
      </View>

      {/* Keypad / Lockout / Processing */}
      <Animated.View
        style={[styles.keypadContainer, { transform: [{ translateX: shakeAnim }] }]}
      >
        {isLockedOut ? (
          <View style={styles.lockoutContainer}>
            <MaterialCommunityIcons
              name="lock-clock"
              size={64}
              color={theme.colors.error}
            />
            <Text
              variant="titleMedium"
              style={[styles.lockoutTitle, { color: theme.colors.error }]}
            >
              Too many attempts
            </Text>
            <Text
              variant="bodyLarge"
              style={[
                styles.lockoutTimer,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Try again in {lockoutSeconds} second{lockoutSeconds !== 1 ? 's' : ''}
            </Text>
          </View>
        ) : isProcessing && step === 'confirm' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}
            >
              Saving new PIN...
            </Text>
          </View>
        ) : (
          <PinKeypad
            pin={pin}
            onPinChange={setPin}
            maxLength={4}
            error={error}
            disabled={isProcessing || isLockedOut}
          />
        )}
      </Animated.View>

      {/* Error message */}
      {errorMessage && !isLockedOut ? (
        <View style={styles.errorContainer}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.error, textAlign: 'center' }}
          >
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {/* Step Indicator (3 dots) */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, { backgroundColor: getDotColor('verify') }]} />
        <View style={[styles.stepDot, { backgroundColor: getDotColor('new') }]} />
        <View style={[styles.stepDot, { backgroundColor: getDotColor('confirm') }]} />
      </View>

      {/* Footer note */}
      <View style={styles.footer}>
        <MaterialCommunityIcons
          name="information-outline"
          size={16}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          variant="bodySmall"
          style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}
        >
          Your PIN is stored securely on this device
        </Text>
      </View>

      {/* Success Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1200}
        style={{ backgroundColor: theme.colors.inverseSurface }}
      >
        PIN changed successfully
      </Snackbar>
    </SafeAreaView>
  );
}

// ============ Styles ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  keypadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockoutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockoutTitle: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  lockoutTimer: {
    textAlign: 'center',
  },
  errorContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 8,
  },
  footerText: {
    textAlign: 'center',
  },
});