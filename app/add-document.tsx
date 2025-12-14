import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export default function AddDocumentScreen() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Add Document" />
                <Appbar.Action icon="check" onPress={() => { }} />
            </Appbar.Header>

           
            <View style={styles.content}>
                <Text variant="headlineMedium" style={styles.placeholderText}>
                    📝
                </Text>
                <Text variant="titleLarge" style={styles.placeholderText}>
                    Add Document - Coming Soon
                </Text>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    placeholderText: {
        textAlign: 'center',
        marginBottom: 12,
    },
});