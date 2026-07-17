import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar } from 'react-native-paper';

interface DocumentSearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (query: string) => void;
}

export function DocumentSearchBar({
  placeholder,
  value,
  onChangeText,
}: DocumentSearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        style={styles.searchbar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    padding: 17,
    paddingBottom: 0,
    paddingTop:10
  },
  searchbar: {
    elevation: 0,
    height: 52,
  },
});
