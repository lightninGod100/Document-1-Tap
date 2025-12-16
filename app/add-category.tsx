// app/add-category.tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  HelperText,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { IconPickerModal } from '../src/components/IconPickerModal';
import { useCategories } from '../src/contexts/CategoryContext';
import { CUSTOM_CATEGORY_COLOR } from '../src/utils/constants';

const MAX_NAME_LENGTH = 14;

export default function AddCategoryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { addCategory, isCategoryNameTaken } = useCategories();

  // Form state
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [iconPickerVisible, setIconPickerVisible] = useState(false);

  // Validation state
  const [nameError, setNameError] = useState('');

  const validateName = (value: string): boolean => {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      setNameError('Category name is required');
      return false;
    }

    if (isCategoryNameTaken(trimmed)) {
      setNameError('Category name already exists');
      return false;
    }

    setNameError('');
    return true;
  };

  const handleNameChange = (value: string) => {
    if (value.length <= MAX_NAME_LENGTH) {
      setName(value);
      if (nameError && value.trim().length > 0) {
        const trimmed = value.trim();
        if (isCategoryNameTaken(trimmed)) {
          setNameError('Category name already exists');
        } else {
          setNameError('');
        }
      }
    }
  };

  const handleSave = async () => {
    if (!validateName(name)) {
      return;
    }

    await addCategory({
      name: name.trim(),
      icon: selectedIcon,
      color: CUSTOM_CATEGORY_COLOR,
      isPredefined: false,
    });

    router.back();
  };

  const isSaveDisabled = name.trim().length === 0;

  return (
    <View style={styles.container}>
      {/* MODIFIED: Header - removed save action */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Add Category" />
      </Appbar.Header>

      {/* Form Content */}
      <View style={styles.content}>
        {/* ADDED: Icon Section Card (moved to top) */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={styles.cardLabel}>
            Icon
          </Text>

          {/* ADDED: Dashed circle icon picker */}
          <TouchableRipple
            onPress={() => setIconPickerVisible(true)}
            style={styles.iconCircleWrapper}
            borderless
          >
            <View
              style={[
                styles.iconCircle,
                { borderColor: theme.colors.outline },
              ]}
            >
              <MaterialCommunityIcons
                name={selectedIcon as any}
                size={48}
                color={CUSTOM_CATEGORY_COLOR}
              />
              <Text
                variant="bodySmall"
                style={[styles.tapHint, { color: theme.colors.onSurfaceVariant }]}
              >
                Tap to select
              </Text>
            </View>
          </TouchableRipple>
        </View>

        {/* MODIFIED: Name Section Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={styles.cardLabel}>
            Category Name
          </Text>
          <TextInput
            value={name}
            onChangeText={handleNameChange}
            mode="outlined"
            maxLength={MAX_NAME_LENGTH}
            error={!!nameError}
            placeholder="e.g., Insurance"
            style={styles.input}
          />
          <HelperText type="error" visible={!!nameError}>
            {nameError}
          </HelperText>
        </View>
      </View>

      {/* ADDED: Bottom Save Button */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={handleSave}
          disabled={isSaveDisabled}
          style={[styles.saveButton, { backgroundColor: '#03A9F4' }]}
          contentStyle={styles.saveButtonContent}
          labelStyle={{ color: '#000000' }} 
          
        >
          Save Category
        </Button>
      </View>

      {/* Icon Picker Modal */}
      <IconPickerModal
        visible={iconPickerVisible}
        selectedIcon={selectedIcon}
        onDismiss={() => setIconPickerVisible(false)}
        onSelect={setSelectedIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  // ADDED: Card styles
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardLabel: {
    fontWeight: '600',
    marginBottom: 16,
  },
  // ADDED: Dashed circle styles
  iconCircleWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapHint: {
    marginTop: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  // ADDED: Bottom button styles
  bottomContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    borderRadius: 12,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
});