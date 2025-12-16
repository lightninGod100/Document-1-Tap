// src/components/IconPickerModal.tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, useTheme } from 'react-native-paper';
import { CATEGORY_ICONS } from '../utils/constants';

interface IconPickerModalProps {
  visible: boolean;
  selectedIcon: string;
  onDismiss: () => void;
  onSelect: (icon: string) => void;
}

export function IconPickerModal({
  visible,
  selectedIcon,
  onDismiss,
  onSelect,
}: IconPickerModalProps) {
  const theme = useTheme();

  const handleIconPress = (icon: string) => {
    onSelect(icon);
    onDismiss();
  };

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
        {/* Header */}
        <Text variant="titleLarge" style={styles.title}>
          Select Icon
        </Text>

        {/* Icon Grid */}
        <FlatList
          data={CATEGORY_ICONS}
          numColumns={5}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => {
            const isSelected = item === selectedIcon;
            return (
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                    borderColor: isSelected
                      ? theme.colors.primary
                      : 'transparent',
                  },
                ]}
                onPress={() => handleIconPress(item)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={item as any}
                  size={28}
                  color={
                    isSelected
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                />
              </TouchableOpacity>
            );
          }}
        />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    borderRadius: 16,
    padding: 16,
    maxHeight: '60%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  gridContainer: {
    alignItems: 'center',
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderWidth: 2,
  },
});