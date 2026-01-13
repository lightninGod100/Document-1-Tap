// app/(tabs)/starred.tsx
// ADD this import at the top
import { Document } from '../../src/types';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Searchbar } from 'react-native-paper';
import { DocumentList } from '../../src/components/DocumentList';
import { useDocuments } from '../../src/contexts/DocumentContext';
import { useRouter } from 'expo-router';
// ADDED: Import for sort/filter
import { useSortFilter } from '../../src/hooks/useSortFilter';
import { SortFilterSheet } from '../../src/components/SortFilterSheet';

export default function StarredScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { getStarredDocuments, toggleStar } = useDocuments();

  // Get only starred documents
  const starredDocuments = getStarredDocuments();
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const router = useRouter();
  // ADDED: Sort/Filter hook (pass starred documents)
  const {
    filteredDocuments,
    sortConfig,
    filterConfig,
    setSortField,
    setFilterValue,
    clearAll,
    applyDefaults,
  } = useSortFilter(starredDocuments);
  // TODO: Search filtering will be implemented in Phase 7
  const handleDocumentPress = (doc: Document) => {
    router.push({ pathname: `/document/${doc.id}`, params: { source: 'starred' } });
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      {/* App Header - MODIFIED: Added filter action */}
      <Appbar.Header>
        <Appbar.Content title="Starred" />
        <Appbar.Action
          icon="filter-variant"
          onPress={() => setFilterSheetVisible(true)}
        />
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
        documents={filteredDocuments}
        emptyIcon="star-outline"
        emptyTitle="No starred documents yet"
        emptySubtitle="Star documents for quick access"
        // onDocumentPress, onStarPress, onMenuPress, onCopyPress → Phase 6
        onDocumentPress={handleDocumentPress}
        onStarPress={(doc) => toggleStar(doc.id)}
      />
      {/* ADDED: Sort/Filter Bottom Sheet */}
      <SortFilterSheet
        visible={filterSheetVisible}
        onDismiss={() => setFilterSheetVisible(false)}
        sortConfig={sortConfig}
        onSortChange={setSortField}
        filterConfig={filterConfig}
        onFilterChange={setFilterValue}
        onClear={clearAll}
        onApply={() => setFilterSheetVisible(false)}
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