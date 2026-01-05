// app/(tabs)/all-docs.tsx

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Searchbar } from 'react-native-paper';
import { DocumentList } from '../../src/components/DocumentList';
import { useDocuments } from '../../src/contexts/DocumentContext';

export default function AllDocsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { documents, isLoading } = useDocuments(); // ADDED: Get documents from context

  // TODO: Search filtering will be implemented in Phase 7
  // For now, display all documents

  return (
    <View style={styles.container}>
      {/* App Header */}
      <Appbar.Header>
        <Appbar.Content title="All Documents" />
      </Appbar.Header>

      {/* Search Bar (visual only for now - Phase 7) */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search documents..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* MODIFIED: Document List replaces empty state */}
      <DocumentList
        documents={documents}
        emptyIcon="file-document-outline"
        emptyTitle="No documents found"
        emptySubtitle="Start adding documents using the + button"
        // onDocumentPress, onStarPress, onMenuPress, onCopyPress → Phase 6
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
    paddingBottom: 8, // MODIFIED: Reduced bottom padding since list has its own padding
  },
  searchbar: {
    elevation: 0,
  },
  // REMOVED: content, emptyText, emptySubtext styles (now handled by DocumentList)
});