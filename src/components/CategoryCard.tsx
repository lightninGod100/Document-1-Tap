// src/components/CategoryCard.tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Badge, Text, useTheme } from 'react-native-paper';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  onLongPress?: () => void;
}

export function CategoryCard({ category, onPress, onLongPress }: CategoryCardProps) {
  const theme = useTheme();

  // Calculate square card size (screen width / 3 - spacing)
  const screenWidth = Dimensions.get('window').width;
  const cardSize = (screenWidth - 48) / 3; // 48 = padding (16*2) + gaps (8*2)

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: cardSize,
          height: cardSize,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      // ADDED: Long press handler (only for custom categories)
      onLongPress={!category.isPredefined ? onLongPress : undefined}
      delayLongPress={500}
    >
      {/* Category Icon */}
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={category.icon as any}
          size={40}
          color={category.color}
        />
      </View>

      {/* Category Name */}
      <Text
        variant="bodyMedium"
        style={[styles.categoryName, { color: theme.colors.onSurface }]}
        numberOfLines={1}
      >
        {category.name}
      </Text>

      {/* Document Count Badge */}
      {category.documentCount > 0 && (
        <Badge
          style={[styles.badge, { backgroundColor: category.color }]}
          size={20}
        >
          {String(category.documentCount)}
        </Badge>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 4,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    marginBottom: 8,
  },
  categoryName: {
    textAlign: 'center',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 10,
  },
});