// src/components/DocumentCard.tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { Document } from '../types';

// ============================================
// PROPS INTERFACE
// ============================================
interface DocumentCardProps {
  document: Document;
  categoryName: string;        // Resolved from categoryId by parent
  onPress?: () => void;        // Tap card → view details (Phase 6)
  onStarPress?: () => void;    // Star icon press (Phase 6)
  onMenuPress?: () => void;    // 3-dot menu press (Phase 6)
  onCopyPress?: () => void;    // Copy number press (Phase 6)
}

// ============================================
// HELPER: Format date as "Added: Jan 5, 2025"
// ============================================
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `Added: ${month} ${day}, ${year}`;
};

// ============================================
// THUMBNAIL CONSTANTS
// ============================================
const THUMBNAIL_WIDTH = 64;
const THUMBNAIL_HEIGHT = 80;

// ============================================
// COMPONENT
// ============================================
export function DocumentCard({
  document,
  categoryName,
  onPress,
  onStarPress,
  onMenuPress,
  onCopyPress,
}: DocumentCardProps) {
  const theme = useTheme();

  // Determine what to show in thumbnail area
  const renderThumbnail = () => {
    // Case 1: Has image file → show actual thumbnail
    if (document.fileUri && document.fileType === 'image') {
      return (
        <Image
          source={{ uri: document.fileUri }}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
      );
    }

    // Case 2: Has PDF file → show PDF icon
    if (document.fileUri && document.fileType === 'pdf') {
      return (
        <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons
            name="file-pdf-box"
            size={36}
            color="#D32F2F" // Red for PDF
          />
        </View>
      );
    }

    // Case 3: No file → show default document icon
    return (
      <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons
          name="file-document-outline"
          size={36}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
    );
  };

  // Determine document number display
  const documentNumberDisplay = document.documentNumberMasked || 'No document number';
  const hasDocumentNumber = !!document.documentNumberMasked;

  return (
    <Surface
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface },
      ]}
      elevation={1}
    >
      <TouchableRipple
        onPress={onPress}
        style={styles.cardContent}
        borderless
      >
        <View>
          {/* ============================================ */}
          {/* ROW 1: Thumbnail + Info + Actions */}
          {/* ============================================ */}
          <View style={styles.mainRow}>
            {/* Thumbnail */}
            <View style={styles.thumbnailContainer}>
              {renderThumbnail()}
            </View>

            {/* Document Info (Title, Category, Date) */}
            <View style={styles.infoContainer}>
              <Text
                variant="titleMedium"
                style={[styles.title, { color: theme.colors.onSurface }]}
                numberOfLines={1}
              >
                {document.title}
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={1}
              >
                Category: {categoryName}
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
              >
                {formatDate(document.createdAt)}
              </Text>
            </View>

            {/* Action Icons (Star + Menu) */}
            <View style={styles.actionsContainer}>
              {/* Star Icon */}
              <TouchableRipple
                onPress={onStarPress}
                borderless
                style={styles.iconButton}
              >
                <MaterialCommunityIcons
                  name={document.isStarred ? 'star' : 'star-outline'}
                  size={24}
                  color={document.isStarred ? '#FFC107' : theme.colors.onSurfaceVariant}
                />
              </TouchableRipple>

              {/* 3-dot Menu Icon */}
              <TouchableRipple
                onPress={onMenuPress}
                borderless
                style={styles.iconButton}
              >
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableRipple>
            </View>
          </View>

          {/* ============================================ */}
          {/* ROW 2: Document Number + Copy */}
          {/* ============================================ */}
          <View style={styles.bottomRow}>
            {/* Masked Document Number */}
            <Text
              variant="bodyMedium"
              style={[
                styles.documentNumber,
                {
                  color: hasDocumentNumber
                    ? theme.colors.onSurface
                    : theme.colors.onSurfaceVariant,
                  fontStyle: hasDocumentNumber ? 'normal' : 'italic',
                },
              ]}
              numberOfLines={1}
            >
              {documentNumberDisplay}
            </Text>

            {/* Copy Icon */}
            <TouchableRipple
              onPress={onCopyPress}
              borderless
              style={styles.iconButton}
              disabled={!hasDocumentNumber}
            >
              <MaterialCommunityIcons
                name="content-copy"
                size={20}
                color={
                  hasDocumentNumber
                    ? theme.colors.onSurfaceVariant
                    : theme.colors.surfaceDisabled
                }
              />
            </TouchableRipple>
          </View>
        </View>
      </TouchableRipple>
    </Surface>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    paddingTop: 12,
    paddingLeft: 16,
    paddingBottom: 8,
    paddingRight: 8

  },
  // Row 1: Main content
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  // Thumbnail
  thumbnailContainer: {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 14,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  // Info section
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 5,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    marginTop: 2,
  },
  // Actions (star + menu)
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 8,
    marginRight:-2
  },
  iconButton: {
    padding: 4,
    borderRadius: 20,
  },
  // Row 2: Document number
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 1,
    paddingTop: 3,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingLeft: 4
  },
  documentNumber: {
    flex: 1,
    fontFamily: 'monospace',
    letterSpacing: 5
  },
});