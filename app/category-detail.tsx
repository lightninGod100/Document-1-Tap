import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { DocumentListScreen } from '../src/components/DocumentListScreen';
import { useCategories } from '../src/contexts/CategoryContext';
import { useDocuments } from '../src/contexts/DocumentContext';
import { Document } from '../src/types';
export default function CategoryDetailScreen() {
  const router = useRouter();

  // Get categoryId from route params
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

  // Get category details and documents
  const { categories } = useCategories();
  const { getDocumentsByCategory, toggleStar } = useDocuments();

  // Find the category
  const category = categories.find((c) => c.id === categoryId);

  // Get documents for this category
  const categoryDocuments = categoryId ? getDocumentsByCategory(categoryId) : [];

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

  return (
    <DocumentListScreen
      stateKey={`category-${category.id}`}
      documents={categoryDocuments}
      searchPlaceholder={`Search in ${category.name}...`}
      onDocumentPress={handleDocumentPress}
      onStarPress={(doc) => toggleStar(doc.id)}
      renderHeader={(openFilters) => (
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: category.color }]}>
              <MaterialCommunityIcons
                name={category.icon as any}
                size={20}
                color="#FFFFFF"
              />
            </View>
            <Text variant="titleLarge" style={styles.headerTitle}>
              {category.name}
            </Text>
          </View>
          <Appbar.Action icon="filter-variant" onPress={openFilters} />
        </Appbar.Header>
      )}
    />
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
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});