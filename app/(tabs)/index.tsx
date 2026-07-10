// app/(tabs)/index.tsx

import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text, Dialog, Button, Portal, Snackbar, useTheme } from 'react-native-paper';
import { CategoryCard } from '../../src/components/CategoryCard';
import { useCategories } from '../../src/contexts/CategoryContext';
// ADDED: Import useState
import React, { useState } from 'react';

// ADDED: Import CategoryOptionsModal
import { CategoryOptionsModal } from '../../src/components/CategoryOptionsModal';
// ADDED: Import Category type
import { Category } from '../../src/types';

export default function CategoriesScreen() {
  const router = useRouter();
  const theme = useTheme();
  // MODIFIED: Added deleteCategory
  const { categories, isLoading, deleteCategory } = useCategories();
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  // ADDED: State for delete confirmation dialog
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  // ADDED: Snackbar state for predefined category message
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  //Handle long-press on category card
  // MODIFIED: Show snackbar for predefined, options for custom
  const handleLongPress = (category: Category) => {
    if (category.isPredefined) {
      setSnackbarVisible(true);
      return;
    }
    setSelectedCategory(category);
    setOptionsModalVisible(true);
  };

  // handle edit option
  const handleEdit = () => {
    setOptionsModalVisible(false);
    if (selectedCategory) {
      router.push({
        pathname: '/add-category',
        params: { mode: 'edit', categoryId: selectedCategory.id },
      });
    }
  };

  //handle delete
  // MODIFIED: Show delete confirmation dialog
  const handleDelete = () => {
    setOptionsModalVisible(false);
    // Small delay to let options modal close first
    setTimeout(() => {
      setDeleteDialogVisible(true);
    }, 200);
  };
  // ADDED: Confirm and execute delete
  const confirmDelete = async () => {
    if (!selectedCategory) return;

    // TODO: When DocumentContext exists, move documents to Uncategorized here

    try {
      await deleteCategory(selectedCategory.id);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
    setDeleteDialogVisible(false);
    setSelectedCategory(null);
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Appbar.Content
          title="Categories"
          titleStyle={[styles.headerTitle, { color: theme.colors.onBackground }]}
        />
        <Appbar.Action
          icon="folder-plus"
          color={theme.colors.onSurface}
          style={[
            styles.headerAction,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
          onPress={() => router.push('/add-category')}
        />
      </Appbar.Header>

      {/* ADDED: Conditional rendering based on isLoading */}
      {isLoading ? (
        // Show loading state
        <View style={styles.content}>
          <Text variant="bodyLarge">Loading categories...</Text>
        </View>
      ) : (
        // Show categories grid
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onPress={() => router.push({ pathname: '/category-detail', params: { categoryId: item.id } })}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}

      <CategoryOptionsModal
        visible={optionsModalVisible}
        category={selectedCategory}
        onDismiss={() => setOptionsModalVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {/* ADDED: Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Category</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {selectedCategory && selectedCategory.documentCount > 0
                ? `This category has ${selectedCategory.documentCount} document(s). They will be moved to Uncategorized. Delete anyway?`
                : `Delete "${selectedCategory?.name}"?`}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDelete} textColor="#F44336">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {/* ADDED: Snackbar for predefined category message */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {"Predefined categories can't be modified"}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 78,
    paddingHorizontal: 8,
    elevation: 1,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 14,
  },
  row: {
    justifyContent: 'space-between',
  },
});