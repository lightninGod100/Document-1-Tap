// app/(tabs)/index.tsx

import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { CategoryCard } from '../../src/components/CategoryCard';
import { useCategories } from '../../src/contexts/CategoryContext';
// ADDED: Import useState
import { useState } from 'react';
// ADDED: Import CategoryOptionsModal
import { CategoryOptionsModal } from '../../src/components/CategoryOptionsModal';
// ADDED: Import Category type
import { Category } from '../../src/types';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, isLoading } = useCategories();
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  //Handle long-press on category card
  const handleLongPress = (category: Category) => {
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
  const handleDelete = () => {
    setOptionsModalVisible(false);
    //to add delete confoiramtion dialog
    console.log('Delete Category', selectedCategory?.name);
  }

  return (
    <View style={styles.container}>
      {/* App Header */}
      <Appbar.Header>
        <Appbar.Content title="Document 1 Tap" />
        <Appbar.Action
          icon="folder-plus"
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
              onPress={() => {
                console.log('Category pressed:', item.name);
              }}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
        />
      )}
      // ADDED: Category options modal
      <CategoryOptionsModal
        visible={optionsModalVisible}
        category={selectedCategory}
        onDismiss={() => setOptionsModalVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gridContainer: {
    padding: 12,
  },
  row: {
    justifyContent: 'flex-start',
  },
});