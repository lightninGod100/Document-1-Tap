// src/components/CategoryPickerModal.tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Text, TouchableRipple } from 'react-native-paper';
import { Category } from '../types';

interface CategoryPickerModalProps {
  visible: boolean;
  categories: Category[];
  selectedCategoryId: string;
  onDismiss: () => void;
  onSelect: (categoryId: string) => void;
}

export function CategoryPickerModal({
  visible,
  categories,
  selectedCategoryId,
  onDismiss,
  onSelect,
}: CategoryPickerModalProps) {
  // Local state to track selection before confirming
  const [tempSelectedId, setTempSelectedId] = useState(selectedCategoryId);

  // Reset temp selection when modal opens
  useEffect(() => {
    if (visible) {
      setTempSelectedId(selectedCategoryId);
    }
  }, [visible, selectedCategoryId]);

  // Handle OK button press
  const handleConfirm = () => {
    onSelect(tempSelectedId);
    onDismiss();
  };

  // Handle Cancel button press
  const handleCancel = () => {
    setTempSelectedId(selectedCategoryId); // Reset to original
    onDismiss();
  };

  // Render each category row
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = item.id === tempSelectedId;

    return (
      <TouchableRipple
        onPress={() => setTempSelectedId(item.id)}
        style={styles.categoryRow}
      >
        <View style={styles.categoryRowContent}>
          {/* Checkbox/Radio indicator */}
          <View
            style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected,
            ]}
          >
            {isSelected && (
              <MaterialCommunityIcons
                name="check"
                size={16}
                color="#FFFFFF"
              />
            )}
          </View>

          {/* Category Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: item.color },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={20}
              color="#FFFFFF"
            />
          </View>

          {/* Category Name */}
          <Text variant="bodyLarge" style={styles.categoryName}>
            {item.name}
          </Text>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCancel}
        contentContainerStyle={styles.modalContainer}
      >
        {/* Header */}
        <Text variant="titleLarge" style={styles.header}>
          Categories
        </Text>

        {/* Category List */}
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="text"
            onPress={handleCancel}
            textColor="#009688"
            style={styles.cancelButton}
          >
            CANCEL
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            buttonColor="#009688"
            textColor="#FFFFFF"
            style={styles.okButton}
          >
            OK
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 32,
    borderRadius: 8,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  header: {
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  list: {
    flexGrow: 0,
  },
  categoryRow: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  categoryRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#009688',
    borderColor: '#009688',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    color: '#000000',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    marginRight: 8,
  },
  okButton: {
    borderRadius: 4,
    minWidth: 80,
  },
});