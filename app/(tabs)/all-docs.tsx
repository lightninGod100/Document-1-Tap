// app/(tabs)/all-docs.tsx
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
// ADD this import
import { searchDocuments } from '../../src/utils/searchUtils';
import { useCategories } from '../../src/contexts/CategoryContext';

export default function AllDocsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { documents, isLoading, toggleStar } = useDocuments(); // ADDED: Get documents from context
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const router = useRouter();
  const { categories } = useCategories();
  const searchedDocuments = searchDocuments(documents, searchQuery, categories);

  const {
    filteredDocuments,
    sortConfig,
    filterConfig,
    setSortField,
    setFilterValue,
    clearAll,
    applyDefaults,
    activeFilterCount,
  } = useSortFilter(searchedDocuments);
  // TODO: Search filtering will be implemented in Phase 7
  // For now, display all documents

  // ADD: Filter documents based on search query

  // Determine empty state messaging
  const isSearchActive = searchQuery.trim().length > 0;
  const hasNoResults = filteredDocuments.length === 0;

  // Dynamic empty state props
  const emptyIcon = hasNoResults && isSearchActive ? "file-search-outline" : "file-document-outline";
  const emptyTitle = hasNoResults && isSearchActive
    ? `No results for "${searchQuery}"`
    : "No documents found";
  const emptySubtitle = hasNoResults && isSearchActive
    ? "Try a different search term"
    : "Start adding documents using the + button";


  const handleDocumentPress = (doc: Document) => {
    router.push({ pathname: `/document/${doc.id}`, params: { source: 'all-docs' } });
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      {/* App Header - MODIFIED: Added filter action */}
      <Appbar.Header>
        <Appbar.Content title="All Documents" />
        <Appbar.Action
          icon="filter-variant"
          onPress={() => setFilterSheetVisible(true)}
        />
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
      {/* MODIFIED: Use filteredDocuments instead of documents */}
      
      <DocumentList
        documents={filteredDocuments}
        emptyIcon={emptyIcon}
        emptyTitle={emptyTitle}
        emptySubtitle={emptySubtitle}
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
    paddingBottom: 8, // MODIFIED: Reduced bottom padding since list has its own padding
  },
  searchbar: {
    elevation: 0,
  },
  placeholderText :{
    color: 'black'
  }
  // REMOVED: content, emptyText, emptySubtext styles (now handled by DocumentList)
});