// src/components/FileSelectionSheet.tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, Text, TouchableRipple } from 'react-native-paper';

// Define the file source options
export type FileSourceType = 'camera' | 'gallery' | 'pdf';

interface FileSelectionSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectSource: (source: FileSourceType) => void;
}

// Configuration for each option
const FILE_OPTIONS: {
  type: FileSourceType;
  icon: string;
  label: string;
  color: string;
}[] = [
  {
    type: 'camera',
    icon: 'camera',
    label: 'Take Photo',
    color: '#2196F3', // Blue
  },
  {
    type: 'gallery',
    icon: 'image',
    label: 'Choose from Gallery',
    color: '#4CAF50', // Green
  },
  {
    type: 'pdf',
    icon: 'file-pdf-box',
    label: 'Select PDF',
    color: '#F44336', // Red
  },
];

export function FileSelectionSheet({
  visible,
  onDismiss,
  onSelectSource,
}: FileSelectionSheetProps) {
  
  // Handle option selection
  const handleSelect = (source: FileSourceType) => {
    onDismiss();
    // Small delay to let modal close before triggering picker
    setTimeout(() => {
      onSelectSource(source);
    }, 100);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        {/* Header */}
        <Text variant="titleMedium" style={styles.header}>
          Add File
        </Text>

        {/* Options List */}
        <View style={styles.optionsList}>
          {FILE_OPTIONS.map((option) => (
            <TouchableRipple
              key={option.type}
              onPress={() => handleSelect(option.type)}
              style={styles.optionRow}
            >
              <View style={styles.optionContent}>
                {/* Icon Container */}
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: option.color },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>

                {/* Label */}
                <Text variant="bodyLarge" style={styles.optionLabel}>
                  {option.label}
                </Text>

                {/* Chevron */}
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#9E9E9E"
                />
              </View>
            </TouchableRipple>
          ))}
        </View>

        {/* Cancel Button */}
        <TouchableRipple
          onPress={onDismiss}
          style={styles.cancelButton}
        >
          <Text variant="bodyLarge" style={styles.cancelText}>
            Cancel
          </Text>
        </TouchableRipple>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    // Position at bottom
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  header: {
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLabel: {
    color: '#000000',
    flex: 1,
  },
  cancelButton: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  cancelText: {
    color: '#F44336',
    textAlign: 'center',
    fontWeight: '500',
  },
});