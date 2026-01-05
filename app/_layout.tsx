import { Slot } from 'expo-router';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CategoryProvider } from '../src/contexts/CategoryContext'; // ADDED: Import CategoryProvider
import { darkTheme, lightTheme } from '../src/theme/theme';
import { DocumentProvider } from '../src/contexts/DocumentContext'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
      <CategoryProvider>
          <DocumentProvider>  
            <Slot />
          </DocumentProvider>  
        </CategoryProvider>
      </PaperProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}