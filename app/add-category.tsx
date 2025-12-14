// app/add-category.tsx

import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export default function AddCategoryScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header with back and save buttons */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Add Category" />
        <Appbar.Action icon="check" onPress={() => {}} />
      </Appbar.Header>

      {/* Placeholder content */}
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.placeholderText}>
          📁
        </Text>
        <Text variant="titleLarge" style={styles.placeholderText}>
          Add Category Form
        </Text>
        <Text variant="bodyMedium" style={styles.placeholderSubtext}>
          Coming Soon
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    textAlign: 'center',
    marginBottom: 12,
  },
  placeholderSubtext: {
    textAlign: 'center',
    opacity: 0.6,
  },
});