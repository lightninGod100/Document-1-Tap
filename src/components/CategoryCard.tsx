// src/components/CategoryCard.tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  onLongPress?: () => void;
}

export function CategoryCard({ category, onPress, onLongPress }: CategoryCardProps) {
  const theme = useTheme();
  const iconBackground = `${category.color}1F`;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          borderTopColor: category.color,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      // ADDED: Long press handler (only for custom categories)
      onLongPress={onLongPress}
      delayLongPress={500}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBackground }]}>
        <MaterialCommunityIcons
          name={category.icon as any}
          size={21}
          color={category.color}
        />
      </View>

      <Text
        variant="bodyMedium"
        style={[styles.categoryName, { color: theme.colors.onSurface }]}
        numberOfLines={1}
      >
        {category.name}
      </Text>

      <Text style={[styles.documentCount, { color: theme.colors.onSurfaceVariant }]}>
        {category.documentCount} {category.documentCount === 1 ? 'doc' : 'docs'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48.5%',
    height: 100,
    borderRadius: 7,
    borderWidth: 1,
    borderTopWidth: 3,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryName: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,
  },
  documentCount: {
    fontSize: 12,
    lineHeight: 15,
  },
});