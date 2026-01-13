// app/auth/pin-setup.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { PinKeypad } from '../../src/components/PinKeypad';
import { useAuth } from '../../src/contexts/AuthContext';
import { storePIN} from '../../src/utils/auth';

type SetupStep = 'create' | 'confirm';

export default function PinSetupScreen() {
  const theme = useTheme();
  const { completeSetup } = useAuth();

  // State
  const [step, setStep] = useState<SetupStep>('create');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Shake animation for error
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

  // Handle PIN completion (when 4 digits entered)
  useEffect(() => {
    if (pin.length === 4) {
      handlePinComplete();
    }
  }, [pin]);

  const handlePinComplete = async () => {
    if (step === 'create') {
      // First PIN entered - move to confirm step
      setFirstPin(pin);
      setPin('');
      setStep('confirm');
      setError(false);
      setErrorMessage('');
    } else {
      // Confirm step - validate match
      if (pin === firstPin) {
        // PINs match - save and complete setup
        await savePinAndComplete();
      } else {
        // PINs don't match - show error and reset
        setError(true);
        setErrorMessage('PINs do not match. Please try again.');
        triggerShake();
        
        // Reset after short delay
        setTimeout(() => {
          setPin('');
          setFirstPin('');
          setStep('create');
          setError(false);
        }, 1500);
      }
    }
  };

  const savePinAndComplete = async () => {
    try {
      setIsProcessing(true);
      
      // Store PIN securely
      await storePIN(pin);
      
      // Mark setup as complete
      
      // Update auth context (this will navigate to main app)
      completeSetup();
      
    } catch (err) {
      console.error('Failed to save PIN:', err);
      setError(true);
      setErrorMessage('Failed to save PIN. Please try again.');
      setPin('');
      setFirstPin('');
      setStep('create');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get title and subtitle based on step
  const getStepContent = () => {
    if (step === 'create') {
      return {
        title: 'Create your PIN',
        subtitle: 'Enter a 4-digit PIN to secure your documents',
      };
    }
    return {
      title: 'Confirm your PIN',
      subtitle: 'Re-enter your PIN to confirm',
    };
  };

  const { title, subtitle } = getStepContent();

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header Section */}
      <View style={styles.header}>
        {/* App Icon */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={48}
            color={theme.colors.primary}
          />
        </View>

        {/* Title */}
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          {title}
        </Text>

        {/* Subtitle */}
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      </View>

      {/* PIN Keypad Section */}
      <Animated.View style={[styles.keypadContainer, { transform: [{ translateX: shakeAnim }] }]}>
        {isProcessing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
              Setting up your PIN...
            </Text>
          </View>
        ) : (
          <PinKeypad
            pin={pin}
            onPinChange={setPin}
            maxLength={4}
            error={error}
            disabled={isProcessing}
          />
        )}
      </Animated.View>

      {/* Error Message */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text variant="bodyMedium" style={{ color: theme.colors.error, textAlign: 'center' }}>
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View
          style={[
            styles.stepDot,
            { 
              backgroundColor: step === 'create' 
                ? theme.colors.primary 
                : theme.colors.outline 
            },
          ]}
        />
        <View
          style={[
            styles.stepDot,
            { 
              backgroundColor: step === 'confirm' 
                ? theme.colors.primary 
                : theme.colors.outline 
            },
          ]}
        />
      </View>

      {/* Footer Note */}
      <View style={styles.footer}>
        <MaterialCommunityIcons
          name="information-outline"
          size={16}
          color={theme.colors.onSurfaceVariant}
        />
        <Text variant="bodySmall" style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
          Your PIN is stored securely on this device
        </Text>
      </View>
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
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  // Keypad
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
  // Error
  errorContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  // Step Indicator
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
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 8,
  },
  footerText: {
    textAlign: 'center',
  },
});
