// app/category-detail.tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Searchbar, Text, useTheme } from 'react-native-paper';
import { DocumentList } from '../src/components/DocumentList';
import { useCategories } from '../src/contexts/CategoryContext';
import { useDocuments } from '../src/contexts/DocumentContext';
import { Document } from '../src/types';
// ADDED: Import for sort/filter
import { useSortFilter } from '../src/hooks/useSortFilter';
import { SortFilterSheet } from '../src/components/SortFilterSheet';
import { searchDocuments } from '../src/utils/searchUtils';



export default function CategoryDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Get categoryId from route params
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

  // Get category details and documents
  const { categories } = useCategories();
  const { getDocumentsByCategory, toggleStar } = useDocuments();

  // Find the category
  const category = categories.find((c) => c.id === categoryId);

  // Get documents for this category
  const categoryDocuments = categoryId ? getDocumentsByCategory(categoryId) : [];

  const searchedDocuments = searchDocuments(categoryDocuments, searchQuery, categories);
  // TODO: Search filtering will be implemented in Phase 7
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const {
    filteredDocuments,
    sortConfig,
    filterConfig,
    setSortField,
    setFilterValue,
    clearAll,
    applyDefaults,
  } = useSortFilter(searchedDocuments);
  // Handle case where category is not found
  if (!category) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Category Not Found" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge">This category does not exist.</Text>
        </View>
      </View>
    );
  }
  const handleDocumentPress = (doc: Document) => {
    router.push(`/document/${doc.id}`);
  };

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

  return (
    <View style={styles.container}>
      {/* Header with Category Icon + Name */}
      {/* MODIFIED: Added filter action */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <View style={styles.headerContent}>
          {/* Category Icon */}
          <View
            style={[
              styles.headerIcon,
              { backgroundColor: category.color },
            ]}
          >
            <MaterialCommunityIcons
              name={category.icon as any}
              size={20}
              color="#FFFFFF"
            />
          </View>
          {/* Category Name */}
          <Text variant="titleLarge" style={styles.headerTitle}>
            {category.name}
          </Text>
        </View>
        <Appbar.Action
          icon="filter-variant"
          onPress={() => setFilterSheetVisible(true)}
        />
      </Appbar.Header>

      {/* Search Bar (placeholder for Phase 7) */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={`Search in ${category.name}...`}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Document List */}
      <DocumentList
        documents={filteredDocuments}
        emptyIcon={emptyIcon}
        emptyTitle={emptyTitle}
        emptySubtitle={emptySubtitle}
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
  // Header styles
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontWeight: '600',
  },
  // Search styles
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 0,
  },
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});