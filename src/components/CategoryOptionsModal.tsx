// src/components/CategoryOptionsModal.tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { Category } from '../types';

interface CategoryOptionsModalProps {
  visible: boolean;
  category: Category | null;
  onDismiss: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CategoryOptionsModal({
  visible,
  category,
  onDismiss,
  onEdit,
  onDelete,
}: CategoryOptionsModalProps) {
  const theme = useTheme();

  if (!category) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        {/* Category Name Header */}
        <Text variant="titleMedium" style={styles.header}>
          {category.name}
        </Text>

        {/* Edit Option */}
        <TouchableRipple onPress={onEdit} style={styles.option}>
          <View style={styles.optionContent}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={24}
              color={theme.colors.onSurface}
            />
            <Text variant="bodyLarge" style={styles.optionText}>
              Edit Category
            </Text>
          </View>
        </TouchableRipple>

        {/* Delete Option */}
        <TouchableRipple onPress={onDelete} style={styles.option}>
          <View style={styles.optionContent}>
            <MaterialCommunityIcons
              name="delete-outline"
              size={24}
              color={theme.colors.error}
            />
            <Text
              variant="bodyLarge"
              style={[styles.optionText, { color: theme.colors.error }]}
            >
              Delete Category
            </Text>
          </View>
        </TouchableRipple>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 40,
    borderRadius: 16,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  header: {
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 16,
  },
});