// src/components/SortFilterSheet.tsx

import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  Text,
  Button,
  RadioButton,
  useTheme,
  Divider,
} from 'react-native-paper';
import {
  SortConfig,
  FilterConfig,
  SortField,
  SortDirection,
  FilterValue,
} from '../types';

// ============================================
// CONSTANTS
// ============================================
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.6; // 50% of screen

// ============================================
// PROPS INTERFACE
// ============================================
interface SortFilterSheetProps {
  visible: boolean;
  onDismiss: () => void;
  
  // Sort state & handlers
  sortConfig: SortConfig;
  onSortChange: (field: SortField, direction: SortDirection | null) => void;
  
  // Filter state & handlers
  filterConfig: FilterConfig;
  onFilterChange: (key: keyof FilterConfig, value: FilterValue) => void;
  
  // Actions
  onClear: () => void;
  onApply: () => void;
}

// ============================================
// SORT ROW COMPONENT
// ============================================
interface SortRowProps {
  label: string;
  field: SortField;
  sortConfig: SortConfig;
  onSortChange: (field: SortField, direction: SortDirection | null) => void;
}

function SortRow({ label, field, sortConfig, onSortChange }: SortRowProps) {
  const theme = useTheme();
  
  // Find current direction for this field
  const currentCriterion = sortConfig.criteria.find((c) => c.field === field);
  const currentDirection = currentCriterion?.direction || null;

  // MODIFIED: Simplified handler
  const handleSelect = (direction: SortDirection) => {
    if (currentDirection === direction) {
      // Deselect if same option clicked
      onSortChange(field, null);
    } else {
      // Select new direction
      onSortChange(field, direction);
    }
  };

  return (
    <View style={styles.sortRow}>
      <Text variant="bodyLarge" style={styles.rowLabel}>
        {label}
      </Text>
      <View style={styles.radioGroup}>
        {/* Asc Radio - MODIFIED: Single onPress handler */}
        <Pressable
          style={styles.radioOption}
          onPress={() => handleSelect('asc')}
        >
          <View
            style={[
              styles.radioOuter,
              { borderColor: theme.colors.primary },
            ]}
          >
            {currentDirection === 'asc' && (
              <View
                style={[
                  styles.radioInner,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
            )}
          </View>
          <Text variant="bodyMedium" style={styles.radioLabel}>Asc</Text>
        </Pressable>

        {/* Desc Radio - MODIFIED: Single onPress handler */}
        <Pressable
          style={styles.radioOption}
          onPress={() => handleSelect('desc')}
        >
          <View
            style={[
              styles.radioOuter,
              { borderColor: theme.colors.primary },
            ]}
          >
            {currentDirection === 'desc' && (
              <View
                style={[
                  styles.radioInner,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
            )}
          </View>
          <Text variant="bodyMedium" style={styles.radioLabel}>Desc</Text>
        </Pressable>
      </View>
    </View>
  );
}
// ============================================
// FILTER ROW COMPONENT (Segmented Control)
// ============================================
interface FilterRowProps {
  label: string;
  filterKey: keyof FilterConfig;
  filterConfig: FilterConfig;
  onFilterChange: (key: keyof FilterConfig, value: FilterValue) => void;
}

function FilterRow({ label, filterKey, filterConfig, onFilterChange }: FilterRowProps) {
  const theme = useTheme();
  const currentValue = filterConfig[filterKey];

  const options: { value: FilterValue; label: string }[] = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'all', label: 'All' },
  ];

  return (
    <View style={styles.filterRow}>
      <Text variant="bodyLarge" style={styles.rowLabel}>
        {label}
      </Text>
      <View style={styles.segmentedControl}>
        {options.map((option) => {
          const isSelected = currentValue === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.segmentButton,
                isSelected && {
                  backgroundColor: theme.colors.primary,
                },
                !isSelected && {
                  backgroundColor: theme.colors.surfaceVariant,
                },
              ]}
              onPress={() => onFilterChange(filterKey, option.value)}
            >
              <Text
                variant="labelLarge"
                style={[
                  styles.segmentText,
                  isSelected && { color: theme.colors.onPrimary },
                  !isSelected && { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function SortFilterSheet({
  visible,
  onDismiss,
  sortConfig,
  onSortChange,
  filterConfig,
  onFilterChange,
  onClear,
  onApply,
}: SortFilterSheetProps) {
  const theme = useTheme();

  const handleApply = () => {
    onApply();
    onDismiss();
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      {/* Backdrop with dim effect */}
      <Pressable
        style={styles.backdrop}
        onPress={onDismiss}
      >
        <View style={styles.backdropInner} />
      </Pressable>

      {/* Bottom Sheet */}
      <View
        style={[
          styles.sheet,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        {/* Handle indicator */}
        <View style={styles.handleContainer}>
          <View
            style={[
              styles.handle,
              { backgroundColor: theme.colors.outlineVariant },
            ]}
          />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Sort Section */}
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Sort By
          </Text>

          <SortRow
            label="Name"
            field="name"
            sortConfig={sortConfig}
            onSortChange={onSortChange}
          />
          <SortRow
            label="Date Created"
            field="createdAt"
            sortConfig={sortConfig}
            onSortChange={onSortChange}
          />
          <SortRow
            label="Category"
            field="category"
            sortConfig={sortConfig}
            onSortChange={onSortChange}
          />

          <Divider style={styles.divider} />

          {/* Filter Section */}
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Filters
          </Text>

          <FilterRow
            label="Document Attached"
            filterKey="documentAttached"
            filterConfig={filterConfig}
            onFilterChange={onFilterChange}
          />
          <FilterRow
            label="Notes Attached"
            filterKey="notesAttached"
            filterConfig={filterConfig}
            onFilterChange={onFilterChange}
          />
          <FilterRow
            label="Document No"
            filterKey="documentNo"
            filterConfig={filterConfig}
            onFilterChange={onFilterChange}
          />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="text"
            onPress={handleClear}
            style={styles.clearButton}
          >
            Clear
          </Button>
          <Button
            mode="contained"
            onPress={handleApply}
            style={styles.applyButton}
          >
            Apply
          </Button>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  // Sort Row Styles
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: {
    flex: 1,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  // Filter Row Styles
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  segmentText: {
    fontWeight: '500',
  },
  // Divider
  divider: {
    marginVertical: 16,
  },
  // Action Buttons
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  clearButton: {
    marginRight: 8,
  },
  applyButton: {
    minWidth: 80,
  },
  // ADDED: Custom radio button styles
// ADDED: Custom radio button styles
radioOuter: {
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 2,
  justifyContent: 'center',
  alignItems: 'center',
},
radioInner: {
  width: 10,
  height: 10,
  borderRadius: 5,
},
radioLabel: {
  marginLeft: 4,
},
});