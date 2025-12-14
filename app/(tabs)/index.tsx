// app/(tabs)/index.tsx

import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { CategoryCard } from '../../src/components/CategoryCard';
import { useCategories } from '../../src/contexts/CategoryContext';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, isLoading } = useCategories(); // ADDED: Load categories from context

  return (
    <View style={styles.container}>
      {/* App Header */}
      <Appbar.Header>
        <Appbar.Content title="Document 1 Tap" />
        {/* MODIFIED: Replaced cog-outline with folder-plus */}
        <Appbar.Action 
          icon="folder-plus" 
          onPress={() => router.push('/add-category')} 
        />
      </Appbar.Header>

      {/* MODIFIED: Replaced empty state with FlatList grid */}
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() => {
              // TODO: Navigate to category detail screen (Phase 5)
              console.log('Category pressed:', item.name);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={3} // ADDED: 3 columns for square grid
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    padding: 12,
  },
  row: {
    justifyContent: 'flex-start', // Align cards to left
  },
});