import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import React, { ReactNode, useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Snackbar, Text, useTheme } from 'react-native-paper';
import { useCategories } from '../contexts/CategoryContext';
import { useDocuments } from '../contexts/DocumentContext';
import { useSortFilter } from '../hooks/useSortFilter';
import { Document, FilterConfig, SortConfig } from '../types';
import { searchDocuments } from '../utils/searchUtils';
import { DocumentList } from './DocumentList';
import { DocumentSearchBar } from './DocumentSearchBar';
import { SortFilterSheet } from './SortFilterSheet';

interface PreservedListState {
  searchQuery: string;
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
}

const preservedListStates = new Map<string, PreservedListState>();

interface DocumentListScreenProps {
  stateKey: string;
  documents: Document[];
  searchPlaceholder: string;
  renderHeader: (openFilters: () => void) => ReactNode;
  onDocumentPress: (document: Document) => void;
  onStarPress: (document: Document) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export function DocumentListScreen({
  stateKey,
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
  const { deleteDocument } = useDocuments();
  const preservedState = preservedListStates.get(stateKey);
  const [searchQuery, setSearchQuery] = useState(preservedState?.searchQuery ?? '');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const preserveFiltersOnBlur = useRef(false);

  const searchedDocuments = searchDocuments(documents, searchQuery, categories);
  const {
    filteredDocuments,
    sortConfig,
    filterConfig,
    setSortField,
    setFilterValue,
    clearAll,
  } = useSortFilter(
    searchedDocuments,
    preservedState?.sortConfig,
    preservedState?.filterConfig
  );

  useFocusEffect(
    useCallback(() => {
      preserveFiltersOnBlur.current = false;

      return () => {
        if (!preserveFiltersOnBlur.current) {
          preservedListStates.delete(stateKey);
          clearAll();
          setSearchQuery('');
          setFilterSheetVisible(false);
        }
      };
    }, [clearAll, stateKey])
  );

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

  const handleDocumentPress = (document: Document) => {
    preserveFiltersOnBlur.current = true;
    preservedListStates.set(stateKey, { searchQuery, sortConfig, filterConfig });
    onDocumentPress(document);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    const documentId = documentToDelete.id;
    setDocumentToDelete(null);

    try {
      await deleteDocument(documentId);
    } catch (error) {
      console.error('Delete error:', error);
      setSnackbarMessage('Failed to delete document');
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
        onDocumentPress={handleDocumentPress}
        onStarPress={onStarPress}
        onMenuPress={setDocumentToDelete}
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

      <Portal>
        <Dialog
          visible={documentToDelete !== null}
          onDismiss={() => setDocumentToDelete(null)}
        >
          <Dialog.Icon icon="alert" color={theme.colors.error} />
          <Dialog.Title style={styles.dialogTitle}>Delete Document?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete &quot;{documentToDelete?.title}&quot;? This action
              cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDocumentToDelete(null)}>Cancel</Button>
            <Button textColor={theme.colors.error} onPress={confirmDelete}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  dialogTitle: {
    textAlign: 'center',
  },
});
