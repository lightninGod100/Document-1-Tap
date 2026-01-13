// src/components/PinKeypad.tsx

import React from 'react';
import { StyleSheet, View, Pressable, Vibration } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface PinKeypadProps {
  pin: string;
  onPinChange: (pin: string) => void;
  maxLength?: number;
  disabled?: boolean;
  error?: boolean; // For shake animation trigger
}

export function PinKeypad({ 
  pin, 
  onPinChange, 
  maxLength = 4,
  disabled = false,
  error = false,
}: PinKeypadProps) {
  const theme = useTheme();

  // Handle number press
  const handleNumberPress = (num: string) => {
    if (disabled || pin.length >= maxLength) return;
    
    // Light haptic feedback
    Vibration.vibrate(10);
    
    onPinChange(pin + num);
  };

  // Handle backspace
  const handleBackspace = () => {
    if (disabled || pin.length === 0) return;
    
    Vibration.vibrate(10);
    onPinChange(pin.slice(0, -1));
  };

  // Render PIN dots
  const renderPinDots = () => {
    const dots = [];
    for (let i = 0; i < maxLength; i++) {
      const isFilled = i < pin.length;
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: isFilled 
                ? (error ? theme.colors.error : theme.colors.primary)
                : 'transparent',
              borderColor: error 
                ? theme.colors.error 
                : theme.colors.outline,
            },
          ]}
        />
      );
    }
    return dots;
  };

  // Render a single key button
  const renderKey = (value: string | 'backspace' | 'empty', index: number) => {
    if (value === 'empty') {
      return <View key={index} style={styles.key} />;
    }

    const isBackspace = value === 'backspace';
    
    return (
      <Pressable
        key={index}
        style={({ pressed }) => [
          styles.key,
          {
            backgroundColor: pressed 
              ? theme.colors.surfaceVariant 
              : 'transparent',
          },
        ]}
        onPress={() => isBackspace ? handleBackspace() : handleNumberPress(value)}
        disabled={disabled}
        android_ripple={{ color: theme.colors.surfaceVariant, borderless: true }}
      >
        {isBackspace ? (
          <MaterialCommunityIcons
            name="backspace-outline"
            size={28}
            color={disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurface}
          />
        ) : (
          <Text
            variant="headlineMedium"
            style={[
              styles.keyText,
              { color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurface },
            ]}
          >
            {value}
          </Text>
        )}
      </Pressable>
    );
  };

  // Keypad layout: 1-9, empty, 0, backspace
  const keys: (string | 'backspace' | 'empty')[] = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'empty', '0', 'backspace',
  ];

  return (
    <View style={styles.container}>
      {/* PIN Dots Display */}
      <View style={styles.dotsContainer}>
        {renderPinDots()}
      </View>

      {/* Numeric Keypad */}
      <View style={styles.keypad}>
        {keys.map((key, index) => renderKey(key, index))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  // PIN Dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  // Keypad
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 280,
  },
  key: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    margin: 4,
  },
  keyText: {
    fontWeight: '500',
  },
});