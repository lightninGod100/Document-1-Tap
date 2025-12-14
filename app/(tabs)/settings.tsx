// app/(tabs)/settings.tsx

import { StyleSheet, View } from 'react-native';
import { Appbar, Divider, List } from 'react-native-paper';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      {/* App Header */}
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      {/* Settings List */}
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Theme"
          description="Light"
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        
        <Divider />
        
        <List.Subheader>Data</List.Subheader>
        <List.Item
          title="Clear All Data"
          description="Delete all documents and categories"
          left={(props) => <List.Icon {...props} icon="delete-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        
        <Divider />
        
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information-outline" />}
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});