import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';
import { useCategories } from '../contexts/CategoryContext';
import { useSortFilter } from '../hooks/useSortFilter';
import { Document } from '../types';
import { searchDocuments } from '../utils/searchUtils';
import { DocumentList } from './DocumentList';
import { DocumentSearchBar } from './DocumentSearchBar';
import { SortFilterSheet } from './SortFilterSheet';

interface DocumentListScreenProps {
  documents: Document[];
  searchPlaceholder: string;
  renderHeader: (openFilters: () => void) => ReactNode;
  onDocumentPress: (document: Document) => void;
  onStarPress: (document: Document) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export function DocumentListScreen({
  documents,
  searchPlaceholder,
  renderHeader,
  onDocumentPress,
  onStarPress,
  emptyTitle = 'No documents found',
  emptySubtitle = 'Start adding documents using the + button',
}: DocumentListScreenProps) {
  const theme = useTheme();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const searchedDocuments = searchDocuments(documents, searchQuery, categories);
  const {
    filteredDocuments,
    sortConfig,
    filterConfig,
    setSortField,
    setFilterValue,
    clearAll,
  } = useSortFilter(searchedDocuments);

  const isSearchActive = searchQuery.trim().length > 0;
  const hasNoResults = filteredDocuments.length === 0;
  const resolvedEmptyIcon =
    hasNoResults && isSearchActive ? 'file-search-outline' : 'file-document-outline';
  const resolvedEmptyTitle =
    hasNoResults && isSearchActive ? `No results for "${searchQuery}"` : emptyTitle;
  const resolvedEmptySubtitle =
    hasNoResults && isSearchActive ? 'Try a different search term' : emptySubtitle;

  const handleCopyPress = async (document: Document) => {
    if (!document.documentNumber) return;

    try {
      await Clipboard.setStringAsync(document.documentNumber);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Copy document ID error:', error);
      setSnackbarMessage('Failed to copy document ID');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader(() => setFilterSheetVisible(true))}

      <DocumentSearchBar
        placeholder={searchPlaceholder}
        onChangeText={setSearchQuery}
        value={searchQuery}
      />

      <DocumentList
        documents={filteredDocuments}
        emptyIcon={resolvedEmptyIcon}
        emptyTitle={resolvedEmptyTitle}
        emptySubtitle={resolvedEmptySubtitle}
        onDocumentPress={onDocumentPress}
        onStarPress={onStarPress}
        onCopyPress={handleCopyPress}
      />

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

      <Snackbar
        visible={snackbarMessage.length > 0}
        onDismiss={() => setSnackbarMessage('')}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
