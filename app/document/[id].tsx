// app/document/[id].tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  BackHandler
} from 'react-native';
import {
  Appbar,
  Button,
  Chip,
  Dialog,
  Divider,
  Menu,
  Portal,
  Snackbar,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
// ADDED: Import authenticateForShare
import { authenticateForShare } from '../../src/utils/auth';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCategories } from '../../src/contexts/CategoryContext';
import { useDocuments } from '../../src/contexts/DocumentContext';
import { formatDocumentDate, getFormattedFileSize } from '../../src/utils/fileUtils';
import { openPdfInViewer } from '../../src/utils/openPdfViewer';
// Import the image zoom component
import { ImageZoom } from '@likashefqet/react-native-image-zoom';

export default function DocumentDetailScreen() {
  const router = useRouter();
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Context hooks
  const { documents, toggleStar, deleteDocument } = useDocuments();
  const { categories } = useCategories();

  // Find the document
  const document = documents.find((doc) => doc.id === id);

  // Local state
  const [fileSize, setFileSize] = useState<string>('');
  const [isNumberRevealed, setIsNumberRevealed] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Get category info
  const category = categories.find((c) => c.id === document?.categoryId);

  // Load file size on mount
  useEffect(() => {
    if (document?.fileUri) {
      getFormattedFileSize(document.fileUri).then(setFileSize);
    }
  }, [document?.fileUri]);

  // Handle case where document not found

  // ============================================
  // HANDLERS
  // ============================================
  const handleBack = useCallback(() => {
    if (source === 'all-docs') {
      router.navigate('/(tabs)/all-docs');
    } else if (source === 'starred') {
      router.navigate('/(tabs)/starred');
    } else {
      router.back();
    }
  }, [router, source]);

  // ADDED: Handle Android hardware back button
  // ADDED: Handle Android hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        subscription.remove(); // FIXED: Use subscription.remove() instead of removeEventListener
      };
    }, [handleBack])
  );

  if (!document) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialCommunityIcons
          name="file-alert-outline"
          size={64}
          color={theme.colors.error}
        />
        <Text variant="titleMedium" style={{ marginTop: 16 }}>
          Document not found
        </Text>
        <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 24 }}>
          Go Back
        </Button>
      </View>
    );
  }

  const handleToggleStar = async () => {
    await toggleStar(document.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEdit = () => {
    setMenuVisible(false);
    router.push({
      pathname: '/add-document',
      params: { id: document.id },
    });
  };

  const handleShare = async () => {
    setMenuVisible(false);

    if (!document.fileUri) {
      showSnackbar('No file to share');
      return;
    }
    // ADDED: Biometric authentication before sharing
    const authResult = await authenticateForShare();
    if (!authResult.success) {
      // User cancelled or auth failed - silently abort, stay on screen
      return;
    }
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      showSnackbar('Sharing is not available on this device');
      return;
    }

    try {
      await Sharing.shareAsync(document.fileUri, {
        mimeType: document.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg',
        dialogTitle: `Share ${document.title}`,
      });
    } catch (error) {
      console.error('Share error:', error);
      showSnackbar('Failed to share document');
    }
  };

  const handleDeletePress = () => {
    setMenuVisible(false);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    setDeleteDialogVisible(false);
    try {
      await deleteDocument(document.id);
      handleBack();
    } catch (error) {
      console.error('Delete error:', error);
      showSnackbar('Failed to delete document');
    }
  };

  const handleRevealNumber = () => {
    setIsNumberRevealed(!isNumberRevealed);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCopyNumber = async () => {
    if (document.documentNumber) {
      await Clipboard.setStringAsync(document.documentNumber);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // MODIFIED: Use new openPdfInViewer utility
  const handleOpenPDF = async () => {
    if (!document.fileUri) {
      showSnackbar('No file to open');
      return;
    }

    const result = await openPdfInViewer(document.fileUri, document.title);

    if (!result.success && result.error) {
      showSnackbar(result.error);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderHeader = () => (
    <Appbar.Header
      style={[styles.header, { backgroundColor: theme.colors.surface }]}
      elevated
    >
      <Appbar.BackAction onPress={handleBack} />
      <Appbar.Content
        title={document.title}
        titleStyle={styles.headerTitle}
        subtitle={fileSize || undefined}
        subtitleStyle={styles.headerSubtitle}
      />
      <Appbar.Action
        icon={document.isStarred ? 'star' : 'star-outline'}
        iconColor={document.isStarred ? '#FFC107' : theme.colors.onSurface}
        onPress={handleToggleStar}
      />
      <Appbar.Action icon="pencil-outline" onPress={handleEdit} />
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Appbar.Action
            icon="dots-horizontal"
            onPress={() => setMenuVisible(true)}
          />
        }
      >
        <Menu.Item
          leadingIcon="share-variant"
          onPress={handleShare}
          title="Share"
        />
        <Divider />
        <Menu.Item
          leadingIcon="delete-outline"
          onPress={handleDeletePress}
          title="Delete"
          titleStyle={{ color: theme.colors.error }}
        />
      </Menu>
    </Appbar.Header>
  );

  const renderImageViewer = () => (
    <View style={styles.imageContainer}>
      <ImageZoom
        uri={document.fileUri!}
        minScale={1}
        maxScale={5}
        doubleTapScale={2.5}
        style={styles.zoomableImage}
        resizeMode="contain"
      />
    </View>
  );

  const renderPdfCard = () => (
    <View style={styles.pdfContainer}>
      <Surface style={styles.pdfCard} elevation={1}>
        <View style={styles.pdfIconContainer}>
          <MaterialCommunityIcons
            name="file-pdf-box"
            size={48}
            color="#F44336"
          />
        </View>
        <View style={styles.pdfInfo}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Size: {fileSize || 'Unknown'}
          </Text>
          <Button
            mode="contained"
            onPress={handleOpenPDF}
            style={styles.openButton}
            buttonColor="#009688"
            textColor="#FFFFFF"
          >
            OPEN FILE
          </Button>
        </View>
      </Surface>
    </View>
  );
  const renderPlaceholder = () => (
    <View style={styles.placeholderContainer}>
      <Image
        source={require('../../assets/images/doc_placeholderr.jpg')}
        style={styles.placeholderImage}
        resizeMode="contain"
      />
    </View>
  );
  const renderMetadataRow = () => (
    <View style={styles.metadataRow}>
      <View style={styles.metadataChips}>
        {/* Category Chip */}
        <Chip
          mode="flat"
          style={[
            styles.categoryChip,
            { backgroundColor: `${category?.color || '#137fec'}15` },
          ]}
          textStyle={[
            styles.categoryChipText,
            { color: category?.color || '#137fec' },
          ]}
        >
          {category?.name || 'Uncategorized'}
        </Chip>

        {/* File Type Chip */}
        <Chip
          mode="flat"
          style={styles.fileTypeChip}
          textStyle={styles.fileTypeChipText}
        >
          {document.fileType === 'pdf' ? 'PDF' : 'Image'}
        </Chip>
      </View>

      {/* Date */}
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {formatDocumentDate(document.createdAt)}
      </Text>
    </View>
  );

  const renderDocumentIdSection = () => {
    const hasDocumentNumber = !!document.documentNumber;

    const displayNumber = !hasDocumentNumber
      ? 'No document ID added'
      : isNumberRevealed
        ? document.documentNumber
        : document.documentNumberMasked || '•••• •••• ••••';

    return (
      <View style={styles.section}>
        <Text variant="labelSmall" style={styles.sectionLabel}>
          DOCUMENT ID
        </Text>
        <Surface style={styles.documentIdCard} elevation={1}>
          <MaterialCommunityIcons
            name={hasDocumentNumber ? 'lock' : 'lock-open-outline'}
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            variant="bodyLarge"
            style={[
              styles.documentIdText,
              hasDocumentNumber
                ? { color: theme.colors.onSurface }
                : {
                  color: theme.colors.onSurfaceVariant,
                  fontStyle: 'italic',
                  fontFamily: undefined,  // Reset to default font
                  letterSpacing: 0,       // Remove letter spacing
                },
            ]}
          >
            {displayNumber}
          </Text>
          <View style={styles.documentIdActions}>
            <TouchableRipple
              onPress={hasDocumentNumber ? handleRevealNumber : undefined}
              style={[
                styles.documentIdButton,
                !hasDocumentNumber && styles.disabledButton,
              ]}
              borderless
              disabled={!hasDocumentNumber}
            >
              <MaterialCommunityIcons
                name={isNumberRevealed ? 'eye-off' : 'eye'}
                size={20}
                color={hasDocumentNumber
                  ? theme.colors.onSurfaceVariant
                  : theme.colors.surfaceDisabled}
              />
            </TouchableRipple>
            <TouchableRipple
              onPress={hasDocumentNumber ? handleCopyNumber : undefined}
              style={[
                styles.documentIdButton,
                hasDocumentNumber ? styles.copyButton : styles.disabledButton,
              ]}
              borderless
              disabled={!hasDocumentNumber}
            >
              <MaterialCommunityIcons
                name="content-copy"
                size={20}
                color={hasDocumentNumber
                  ? '#137fec'
                  : theme.colors.surfaceDisabled}
              />
            </TouchableRipple>
          </View>
        </Surface>
      </View>
    );
  };

  const renderNotesSection = () => {
    const hasNotes = !!document.notes;

    return (
      <View style={styles.section}>
        <Text variant="labelSmall" style={styles.sectionLabel}>
          NOTES
        </Text>
        <Text
          variant="bodyMedium"
          style={[
            styles.notesText,
            {
              color: theme.colors.onSurfaceVariant,
              fontStyle: hasNotes ? 'normal' : 'italic',
            },
          ]}
        >
          {hasNotes ? document.notes : 'No notes found'}
        </Text>
      </View>
    );
  };


  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image or PDF Viewer or Placeholder */}
        {!document.fileUri
          ? renderPlaceholder()
          : document.fileType === 'image'
            ? renderImageViewer()
            : renderPdfCard()}

        {/* Metadata Row */}
        <View style={styles.contentPadding}>
          {renderMetadataRow()}

          <Divider style={styles.divider} />

          {/* Document ID Section */}
          {renderDocumentIdSection()}

          {/* Notes Section */}
          {renderNotesSection()}
        </View>
      </ScrollView>




      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Icon icon="alert" color={theme.colors.error} />
          <Dialog.Title style={styles.dialogTitle}>Delete Document?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete &quot;{document.title}&quot;? This action cannot
              be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={confirmDelete}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{ marginBottom: insets.bottom + 80 }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    elevation: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24, // Space for bottom bar
  },
  contentPadding: {
    paddingHorizontal: 24,
  },

  // Image Viewer
  imageContainer: {
    width: '100%',
    aspectRatio: 1 / 1.41, // A4 ratio
    padding: 24,
  },
  zoomableImage: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },

  // PDF Card
  pdfContainer: {
    padding: 24,
  },
  pdfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  pdfIconContainer: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  pdfInfo: {
    flex: 1,
    gap: 8,
  },
  openButton: {
    borderRadius: 8,
  },

  // Metadata Row
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
  },
  metadataChips: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    height: 31,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fileTypeChip: {
    backgroundColor: '#2b2b2a',
    height: 31,

  },
  fileTypeChipText: {
    fontSize: 11,

    //color: '#64748B',
  },

  divider: {
    marginVertical: 16,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#64748B',
    marginBottom: 12,
  },

  // Document ID Card
  documentIdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    paddingLeft: 16,
    borderRadius: 12,
    gap: 12,
  },
  documentIdText: {
    flex: 1,
    fontFamily: 'monospace',
    letterSpacing: 2,
    fontSize: 16,
  },
  documentIdActions: {
    flexDirection: 'row',
    gap: 4,
  },
  documentIdButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButton: {
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
  },
  disabledButton: {
    opacity: 0.4,
  },
  // Notes
  notesText: {
    lineHeight: 22,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 32,
  },
  bottomBarButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bottomBarButtonContent: {
    alignItems: 'center',
    gap: 4,
  },
  bottomBarDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },

  // Dialog
  dialogTitle: {
    textAlign: 'center',
  },
  // Placeholder
  placeholderContainer: {
    width: '100%',
    aspectRatio: 1 / 1.41,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: '90%',
    height: '70%',
    borderRadius: 8,
  },

});