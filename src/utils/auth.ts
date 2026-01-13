// src/utils/auth.ts

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const BIOMETRIC_ENABLED_KEY = '@doc1tap_biometric_available';
const SECURE_PIN_KEY = 'doc1tap_user_pin';

// ============ PIN Management ============

/**
 * Store PIN securely (encrypted)
 * @returns true if successful, false if failed
 */
export const storePIN = async (pin: string): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(SECURE_PIN_KEY, pin);
    return true;
  } catch (error) {
    console.error('Failed to store PIN:', error);
    return false;
  }
};

/**
 * Retrieve stored PIN
 * @returns PIN string, or null if not found or error
 */
export const getPIN = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(SECURE_PIN_KEY);
  } catch (error) {
    console.error('Failed to retrieve PIN:', error);
    return null;
  }
};

/**
 * Validate PIN against stored value
 * @returns true if match, false if no match or error
 */
export const validatePIN = async (inputPIN: string): Promise<boolean> => {
  try {
    const storedPIN = await getPIN();
    return storedPIN !== null && storedPIN === inputPIN;
  } catch (error) {
    console.error('Failed to validate PIN:', error);
    return false;
  }
};

/**
 * Check if PIN exists (setup completed)
 */
export const hasPINSetup = async (): Promise<boolean> => {
  const pin = await getPIN();
  return pin !== null;
};

// ============ Biometric Management ============

/**
 * Check if device has biometric hardware
 */
export const hasBiometricHardware = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  return hasHardware;
};

/**
 * Check if biometrics are enrolled (user has set up fingerprint/face)
 */
export const isBiometricEnrolled = async (): Promise<boolean> => {
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return isEnrolled;
};

/**
 * Get available biometric types (fingerprint, facial, iris)
 */
export const getBiometricTypes = async (): Promise<LocalAuthentication.AuthenticationType[]> => {
  return await LocalAuthentication.supportedAuthenticationTypesAsync();
};

/**
 * Check if biometrics are fully available (hardware + enrolled)
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  const hasHardware = await hasBiometricHardware();
  const isEnrolled = await isBiometricEnrolled();
  return hasHardware && isEnrolled;
};

/**
 * Get human-readable biometric type name
 */
export const getBiometricTypeName = async (): Promise<string> => {
  const types = await getBiometricTypes();
  
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }
  return 'Biometric';
};

/**
 * Prompt biometric authentication
 */
export const authenticateWithBiometric = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access Document 1 Tap',
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: true, // We handle PIN fallback ourselves
      cancelLabel: 'Cancel',
    });

   // ... existing code ...
   return {
    success: result.success,
    error: result.success ? undefined : result.error,
  };
// ... existing code ...
  } catch (error) {
    return {
      success: false,
      error: 'Biometric authentication failed',
    };
  }
};

// ============ Lockout Management ============

const LOCKOUT_KEY = '@doc1tap_lockout_until';
const FAILED_ATTEMPTS_KEY = '@doc1tap_failed_attempts';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

/**
 * Get current failed attempt count
 */
export const getFailedAttempts = async (): Promise<number> => {
  const value = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
  return value ? parseInt(value, 10) : 0;
};

/**
 * Increment failed attempts and check for lockout
 */
export const recordFailedAttempt = async (): Promise<{
  isLockedOut: boolean;
  attemptsRemaining: number;
  lockoutEndTime?: number;
}> => {
  const currentAttempts = await getFailedAttempts();
  const newAttempts = currentAttempts + 1;
  
  await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, newAttempts.toString());
  
  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockoutEndTime = Date.now() + LOCKOUT_DURATION_MS;
    await AsyncStorage.setItem(LOCKOUT_KEY, lockoutEndTime.toString());
    
    return {
      isLockedOut: true,
      attemptsRemaining: 0,
      lockoutEndTime,
    };
  }
  
  return {
    isLockedOut: false,
    attemptsRemaining: MAX_FAILED_ATTEMPTS - newAttempts,
  };
};

/**
 * Check if currently locked out
 */
export const checkLockoutStatus = async (): Promise<{
  isLockedOut: boolean;
  remainingSeconds: number;
}> => {
  const lockoutUntil = await AsyncStorage.getItem(LOCKOUT_KEY);
  
  if (!lockoutUntil) {
    return { isLockedOut: false, remainingSeconds: 0 };
  }
  
  const lockoutTime = parseInt(lockoutUntil, 10);
  const now = Date.now();
  
  if (now >= lockoutTime) {
    // Lockout expired, clear it
    await clearLockout();
    return { isLockedOut: false, remainingSeconds: 0 };
  }
  
  return {
    isLockedOut: true,
    remainingSeconds: Math.ceil((lockoutTime - now) / 1000),
  };
};

/**
 * Clear lockout and reset failed attempts
 */
export const clearLockout = async (): Promise<void> => {
  await AsyncStorage.multiRemove([LOCKOUT_KEY, FAILED_ATTEMPTS_KEY]);
};

/**
 * Reset failed attempts on successful auth
 */
export const resetFailedAttempts = async (): Promise<void> => {
  await AsyncStorage.removeItem(FAILED_ATTEMPTS_KEY);
};