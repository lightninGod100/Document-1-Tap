import React, {useState} from 'react';
import {PaperProvider} from 'react-native-paper';
import {Stack} from 'expo-router';
import {lightTheme, darkTheme} from '../src/theme/theme';

export default function RootLayout(){
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return(
      <PaperProvider theme={theme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
        </Stack>
      </PaperProvider>
  );
}