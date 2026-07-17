import { Document } from '../../src/types';
import { StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { DocumentListScreen } from '../../src/components/DocumentListScreen';
import { useDocuments } from '../../src/contexts/DocumentContext';
import { useRouter } from 'expo-router';


export default function StarredScreen() {
  const { getStarredDocuments, toggleStar } = useDocuments();
  const starredDocuments = getStarredDocuments();
  const router = useRouter();

  const handleDocumentPress = (doc: Document) => {
    router.push({ pathname: `/document/${doc.id}`, params: { source: 'starred' } });
  };

  return (
    <DocumentListScreen
      documents={starredDocuments}
      searchPlaceholder="Search starred..."
      onDocumentPress={handleDocumentPress}
      onStarPress={(doc) => toggleStar(doc.id)}
      renderHeader={(openFilters) => (
        <Appbar.Header>
          <Appbar.Content title="Starred" titleStyle={styles.headerTitle} />
          <Appbar.Action icon="filter-variant" onPress={openFilters} />
        </Appbar.Header>
      )}
    />
  );
}

const styles = StyleSheet.create({
   headerTitle: {
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});