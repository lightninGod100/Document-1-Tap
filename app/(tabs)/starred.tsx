// app/(tabs)/starred.tsx

import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export default function StarredScreen() {
  return (
    <View style={styles.container}>
      {/* App Header */}
      <Appbar.Header>
        <Appbar.Content title="Starred" />
      </Appbar.Header>

      {/* Empty State */}
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.emptyText}>
          ⭐
        </Text>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No starred documents yet
        </Text>
        <Text variant="bodySmall" style={styles.emptySubtext}>
          Star documents for quick access
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