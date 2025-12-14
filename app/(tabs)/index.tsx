// app/(tabs)/index.tsx

import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      {/* App Header */}
      <Appbar.Header>
        <Appbar.Content title="Document 1 Tap" />
        <Appbar.Action icon="cog-outline" onPress={() => {}} />
      </Appbar.Header>

      {/* Empty State */}
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.emptyText}>
          📂
        </Text>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No categories yet
        </Text>
        <Text variant="bodySmall" style={styles.emptySubtext}>
          Categories will appear here
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
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.6,
  },
});