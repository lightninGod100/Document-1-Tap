// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  hasPINSetup,
  isBiometricAvailable,
  getBiometricTypeName,
} from '../utils/auth';

// ============ Types ============
interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isFirstLaunch: boolean;
  isLoading: boolean;
  hasBiometrics: boolean;
  biometricTypeName: string;
  requiresPinEntry: boolean; // ADDED: Whether PIN screen should show after biometric
  
  // Actions
  unlock: () => void;
  lock: () => void;
  completeSetup: () => void;
  completeBiometricAuth: (needsPin: boolean) => void; // ADDED: Called after OS biometric
  refreshAuthState: () => Promise<void>;
}

// ============ Context ============
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============ Constants ============
const GRACE_PERIOD_MS = 30 * 1000; // 30 seconds - no auth needed
const FULL_REAUTH_PERIOD_MS = 120 * 1000; // 120 seconds - biometric + PIN needed

// ============ Provider ============
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresPinEntry, setRequiresPinEntry] = useState(true); // ADDED: Default true for cold start
  
  // Biometric state
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [biometricTypeName, setBiometricTypeName] = useState('Biometric');
  
  // Track when app went to background
  const backgroundTimeRef = useRef<number | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ============ Initialize Auth State ============
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if setup is complete (PIN exists)
      const setupComplete = await hasPINSetup();
      setIsFirstLaunch(!setupComplete);
      
      // Check biometric availability
      const biometricsAvailable = await isBiometricAvailable();
      setHasBiometrics(biometricsAvailable);
      
      if (biometricsAvailable) {
        const typeName = await getBiometricTypeName();
        setBiometricTypeName(typeName);
      }
      
      // Cold start - always require full auth (biometric + PIN)
      setIsAuthenticated(false);
      setRequiresPinEntry(true); // ADDED: Cold start always needs PIN
      
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setIsFirstLaunch(true);
      setIsAuthenticated(false);
      setRequiresPinEntry(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============ Refresh Auth State (for re-checking biometrics) ============
  const refreshAuthState = useCallback(async () => {
    const biometricsAvailable = await isBiometricAvailable();
    setHasBiometrics(biometricsAvailable);
    
    if (biometricsAvailable) {
      const typeName = await getBiometricTypeName();
      setBiometricTypeName(typeName);
    }
  }, []);

  // ============ Auth Actions ============
  
  /**
   * Full unlock - called when all required auth is complete
   */
  const unlock = useCallback(() => {
    setIsAuthenticated(true);
    setRequiresPinEntry(false);
    backgroundTimeRef.current = null; // Reset background timer
  }, []);

  /**
   * Lock the app - requires re-authentication
   */
  const lock = useCallback(() => {
    setIsAuthenticated(false);
    setRequiresPinEntry(true);
  }, []);

  /**
   * Complete first-time setup - auto unlock after PIN creation
   */
  const completeSetup = useCallback(() => {
    setIsFirstLaunch(false);
    setIsAuthenticated(true);
    setRequiresPinEntry(false);
    backgroundTimeRef.current = null;
  }, []);

  /**
   * ADDED: Called after OS biometric succeeds
   * @param needsPin - whether PIN entry is still required
   */
  const completeBiometricAuth = useCallback((needsPin: boolean) => {
    if (needsPin) {
      // Biometric done, but still need PIN (>120s timeout or cold start)
      setRequiresPinEntry(true);
      // Don't set isAuthenticated yet - wait for PIN
    } else {
      // Biometric only was needed (30s-120s timeout)
      setIsAuthenticated(true);
      setRequiresPinEntry(false);
      backgroundTimeRef.current = null;
    }
  }, []);

  // ============ App State Handler (Background/Foreground) ============
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const previousState = appStateRef.current;
      
      // App going to background - record timestamp
      if (
        previousState === 'active' && 
        (nextAppState === 'inactive' || nextAppState === 'background')
      ) {
        backgroundTimeRef.current = Date.now();
      }
      
      // App coming to foreground - check timeout tier
      if (
        (previousState === 'inactive' || previousState === 'background') && 
        nextAppState === 'active'
      ) {
        if (backgroundTimeRef.current !== null) {
          const timeInBackground = Date.now() - backgroundTimeRef.current;
          
          // MODIFIED: Tiered timeout logic
          if (timeInBackground < GRACE_PERIOD_MS) {
            // < 30 seconds: No auth needed, stay authenticated
            // Do nothing - keep current auth state
          } else if (timeInBackground < FULL_REAUTH_PERIOD_MS) {
            // 30s - 120s: Biometric only (no PIN)
            setIsAuthenticated(false);
            setRequiresPinEntry(false); // KEY: No PIN needed
          } else {
            // > 120 seconds: Full re-auth (biometric + PIN)
            setIsAuthenticated(false);
            setRequiresPinEntry(true); // KEY: PIN required after biometric
          }
        }
        backgroundTimeRef.current = null;
      }
      
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // ============ Initialize on Mount ============
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ============ Context Value ============
  const value: AuthContextType = {
    // State
    isAuthenticated,
    isFirstLaunch,
    isLoading,
    hasBiometrics,
    biometricTypeName,
    requiresPinEntry, // ADDED
    
    // Actions
    unlock,
    lock,
    completeSetup,
    completeBiometricAuth, // ADDED
    refreshAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============ Hook ============
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}