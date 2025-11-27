import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

export default function HomeScreen() {

  const theme = useTheme();

  return (
    <View style={[styles.container,{backgroundColor: theme.colors.background}]}>
      <Text variant="headlineLarge" style={{ color: theme.colors.onBackground }}>
        Document 1 Tap
      </Text >
      <Text variant="bodyLarge" style={{color: theme.colors.onBackground,marginTop: 20}}>
        Phase 1 Completed
      </Text>
      <Button 
        mode="contained" 
        onPress={() => alert('Theme Works')}
        style = {{ marginTop: 30 }}
      >
        Test Button
      </Button>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});