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
  
  // Actions
  unlock: () => void;
  lock: () => void;
  completeSetup: () => void;
  refreshAuthState: () => Promise<void>;
}

// ============ Context ============
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============ Constants ============
const BACKGROUND_GRACE_PERIOD_MS = 30 * 1000; // 30 seconds

// ============ Provider ============
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
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
      
      // If first launch, user needs to set up PIN first
      // If returning user, they need to authenticate
      // Either way, start as not authenticated
      setIsAuthenticated(false);
      
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setIsFirstLaunch(true);
      setIsAuthenticated(false);
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
  const unlock = useCallback(() => {
    setIsAuthenticated(true);
    backgroundTimeRef.current = null; // Reset background timer
  }, []);

  const lock = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const completeSetup = useCallback(() => {
    setIsFirstLaunch(false);
    setIsAuthenticated(true); // Auto-unlock after setup
    backgroundTimeRef.current = null;
  }, []);

  // ============ App State Handler (Background/Foreground) ============
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const previousState = appStateRef.current;
      
      // App going to background
      if (
        previousState === 'active' && 
        (nextAppState === 'inactive' || nextAppState === 'background')
      ) {
        backgroundTimeRef.current = Date.now();
      }
      
      // App coming to foreground
      if (
        (previousState === 'inactive' || previousState === 'background') && 
        nextAppState === 'active'
      ) {
        // Check if grace period has passed
        if (backgroundTimeRef.current !== null) {
          const timeInBackground = Date.now() - backgroundTimeRef.current;
          
          if (timeInBackground > BACKGROUND_GRACE_PERIOD_MS) {
            // Grace period exceeded - require re-authentication
            setIsAuthenticated(false);
          }
          // If within grace period, stay authenticated
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
    
    // Actions
    unlock,
    lock,
    completeSetup,
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
