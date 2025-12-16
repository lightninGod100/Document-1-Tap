// app/(tabs)/index.tsx

import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { CategoryCard } from '../../src/components/CategoryCard';
import { useCategories } from '../../src/contexts/CategoryContext';

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, isLoading } = useCategories();

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
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
        />
      )}
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