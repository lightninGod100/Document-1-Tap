// src/components/DocumentList.tsx

import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Document } from '../types';
import { useCategories } from '../contexts/CategoryContext';
import { DocumentCard } from './DocumentCard';

// ============================================
// PROPS INTERFACE
// ============================================
interface DocumentListProps {
  documents: Document[];                          // Pre-filtered list from parent
  emptyIcon?: string;                             // Icon for empty state
  emptyTitle?: string;                            // Empty state title
  emptySubtitle?: string;                         // Empty state subtitle
  onDocumentPress?: (doc: Document) => void;      // Tap card (Phase 6)
  onStarPress?: (doc: Document) => void;          // Star toggle (Phase 6)
  onMenuPress?: (doc: Document) => void;          // 3-dot menu (Phase 6)
  onCopyPress?: (doc: Document) => void;          // Copy number (Phase 6)
}

// ============================================
// COMPONENT
// ============================================
export function DocumentList({
  documents,
  emptyIcon = 'file-document-outline',
  emptyTitle = 'No documents found',
  emptySubtitle = 'Start adding documents using the + button',
  onDocumentPress,
  onStarPress,
  onMenuPress,
  onCopyPress,
}: DocumentListProps) {
  const theme = useTheme();
  const { categories } = useCategories();


  // ============================================
  // HELPER: Resolve categoryId → categoryName
  // ============================================
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  // ============================================
  // RENDER: Empty State
  // ============================================
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name={emptyIcon as any}
        size={64}
        color={theme.colors.onSurfaceVariant}
        style={styles.emptyIcon}
      />
      <Text
        variant="titleMedium"
        style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
      >
        {emptyTitle}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        {emptySubtitle}
      </Text>
    </View>
  );

  // ============================================
  // RENDER: Document Card Item
  // ============================================
  const renderDocumentItem = ({ item }: { item: Document }) => (
    <DocumentCard
      document={item}
      categoryName={getCategoryName(item.categoryId)}
      onPress={onDocumentPress ? () => onDocumentPress(item) : undefined}
      onStarPress={onStarPress ? () => onStarPress(item) : undefined}
      onMenuPress={onMenuPress ? () => onMenuPress(item) : undefined}
      onCopyPress={onCopyPress ? () => onCopyPress(item) : undefined}
    />
  );

  // ============================================
  // RENDER: Main List
  // ============================================
  return (
    <FlatList
      data={documents}
      keyExtractor={(item) => item.id}
      renderItem={renderDocumentItem}
      ListEmptyComponent={renderEmptyState}
      contentContainerStyle={[
        styles.listContent,
        // Center empty state if list is empty
        documents.length === 0 && styles.emptyListContent,
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
});