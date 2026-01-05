// app/(tabs)/starred.tsx

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Searchbar } from 'react-native-paper';
import { DocumentList } from '../../src/components/DocumentList';
import { useDocuments} from '../../src/contexts/DocumentContext';

export default function StarredScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { getStarredDocuments,toggleStar } = useDocuments();

  // Get only starred documents
  const starredDocuments = getStarredDocuments();

  // TODO: Search filtering will be implemented in Phase 7

  return (
    <View style={styles.container}>
      {/* App Header */}
      <Appbar.Header>
        <Appbar.Content title="Starred" />
      </Appbar.Header>

      {/* Search Bar (visual only for now - Phase 7) */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search starred..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Document List with starred-specific empty state */}
      <DocumentList
        documents={starredDocuments}
        emptyIcon="star-outline"
        emptyTitle="No starred documents yet"
        emptySubtitle="Star documents for quick access"
        // onDocumentPress, onStarPress, onMenuPress, onCopyPress → Phase 6
        onStarPress={(doc) => toggleStar(doc.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 0,
  },
});