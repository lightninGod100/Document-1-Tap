import { Slot } from 'expo-router';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CategoryProvider } from '../src/contexts/CategoryContext'; // ADDED: Import CategoryProvider
import { darkTheme, lightTheme } from '../src/theme/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        {/* ADDED: Wrap Slot with CategoryProvider */}
        <CategoryProvider> 
          <Slot />
        </CategoryProvider>
         {/* ADDED: Close CategoryProvider */}
      </PaperProvider>
    </SafeAreaProvider>
  );
}