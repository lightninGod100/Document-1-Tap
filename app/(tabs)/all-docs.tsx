// app/(tabs)/all-docs.tsx

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Searchbar, Text } from 'react-native-paper';

export default function AllDocsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      {/* App Header */}
      <Appbar.Header>
        <Appbar.Content title="All Documents" />
      </Appbar.Header>

      {/* Search Bar (visual only for now) */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search documents..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Empty State */}
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.emptyText}>
          📄
        </Text>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No documents found
        </Text>
        <Text variant="bodySmall" style={styles.emptySubtext}>
          Start adding documents using the + button
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchbar: {
    elevation: 0,
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