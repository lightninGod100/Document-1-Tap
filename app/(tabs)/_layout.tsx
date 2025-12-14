// app/(tabs)/_layout.tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        // Tab bar styling
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceDisabled,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          borderTopWidth: 1,
          height: 60 + insets.bottom, // ✅ MODIFIED - Adds space for system nav bar
          paddingBottom: insets.bottom + 18, // ✅ MODIFIED - Pushes content up
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        // Header styling (we'll hide these for now)
        headerShown: false,
      }}
    >
      {/* Categories Tab (Home/Default) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="folder-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* All Documents Tab */}
      <Tabs.Screen
        name="all-docs"
        options={{
          title: 'All Docs',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="file-document-multiple-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Starred Tab */}
      <Tabs.Screen
        name="starred"
        options={{
          title: 'Starred',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="star-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cog-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}