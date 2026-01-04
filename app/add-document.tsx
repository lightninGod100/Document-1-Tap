// app/add-document.tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Button,
    Dialog,
    HelperText,
    Portal,
    Text,
    TextInput,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';
import { CategoryPickerModal } from '../src/components/CategoryPickerModal';
import { FileSelectionSheet, FileSourceType } from '../src/components/FileSelectionSheet';
import { useCategories } from '../src/contexts/CategoryContext';
// MODIFIED: Add pickFromGallery to import
// MODIFIED: Add pickPDF to import
import { captureFromCamera, pickFromGallery, pickPDF } from '../src/utils/filePickers';
// Constants for validation
const MAX_TITLE_LENGTH = 40;
const MAX_DOC_NUMBER_LENGTH = 50;
const DEFAULT_CATEGORY_ID = 'cat_uncategorized';

export default function AddDocumentScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { categories } = useCategories();

    // Form state
    const [title, setTitle] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(DEFAULT_CATEGORY_ID);
    const [documentNumber, setDocumentNumber] = useState('');
    const [notes, setNotes] = useState('');

    // File state (will be expanded in Phase 4B/4C)
    const [selectedFile, setSelectedFile] = useState<{
        uri: string;
        type: 'image' | 'pdf';
        name?: string;
    } | null>(null);

    // Modal visibility state
    const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
    const [fileSheetVisible, setFileSheetVisible] = useState(false);
    const [noFileWarningVisible, setNoFileWarningVisible] = useState(false);

    // Get selected category details for display
    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

    // Handle title input with validation
    const handleTitleChange = (value: string) => {
        if (value.length <= MAX_TITLE_LENGTH) {
            setTitle(value);
        }
    };

    // Handle document number input with validation
    const handleDocNumberChange = (value: string) => {
        if (value.length <= MAX_DOC_NUMBER_LENGTH) {
            setDocumentNumber(value);
        }
    };

    const handleFileSourceSelect = async (source: FileSourceType) => {
        if (source === 'camera') {
            const result = await captureFromCamera();
            
            if (result.success && result.file) {
                setSelectedFile({
                    uri: result.file.uri,
                    type: result.file.type,
                    name: result.file.name,
                });
            }
            
        } else if (source === 'gallery') {
            const result = await pickFromGallery();
            
            if (result.success && result.file) {
                setSelectedFile({
                    uri: result.file.uri,
                    type: result.file.type,
                    name: result.file.name,
                });
            }
            
        } else if (source === 'pdf') {
            // ADDED: PDF picker implementation
            const result = await pickPDF();
            
            if (result.success && result.file) {
                setSelectedFile({
                    uri: result.file.uri,
                    type: result.file.type,
                    name: result.file.name,
                });
            }
        }
    };

    // Remove selected file
    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    // Handle save button press
    const handleSave = () => {
        // If no file attached, show warning dialog
        if (!selectedFile) {
            setNoFileWarningVisible(true);
            return;
        }

        // Proceed with save
        saveDocument();
    };

    // Actual save logic (will be expanded in Phase 4D)
    const saveDocument = () => {
        const finalTitle = title.trim() || 'Unknown';

        // TODO: Implement actual save in Phase 4D
        console.log('Saving document:', {
            title: finalTitle,
            categoryId: selectedCategoryId,
            documentNumber: documentNumber.trim() || undefined,
            notes: notes.trim() || undefined,
            file: selectedFile,
        });

        // Navigate back
        router.back();
    };

    // Handle "Continue" in warning dialog (save without file)
    const handleContinueWithoutFile = () => {
        setNoFileWarningVisible(false);
        saveDocument();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="New Document" />
            </Appbar.Header>

            {/* Scrollable Form Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Title Field */}
                <View style={styles.fieldContainer}>
                    <Text variant="bodyMedium" style={styles.fieldLabel}>
                        Title
                    </Text>
                    <TextInput
                        value={title}
                        onChangeText={handleTitleChange}
                        mode="outlined"
                        placeholder="Enter document title"
                        maxLength={MAX_TITLE_LENGTH}
                        style={styles.textInput}
                        outlineColor="#E0E0E0"
                        activeOutlineColor="#009688"
                        textColor="#000000"           // ADDED - black text
                        placeholderTextColor="#9E9E9E"
                    />
                    <HelperText type="info" visible={true} style={styles.helperText}>
                        {`${title.length}/${MAX_TITLE_LENGTH} characters`}
                    </HelperText>
                </View>

                {/* Category Picker Field */}
                <View style={styles.fieldContainer}>
                    <Text variant="bodyMedium" style={styles.fieldLabel}>
                        Category
                    </Text>
                    <TouchableRipple
                        onPress={() => setCategoryPickerVisible(true)}
                        style={[styles.pickerButton, { borderColor: '#E0E0E0' }]}
                    >
                        <View style={styles.pickerContent}>
                            {/* Category Icon */}
                            <View
                                style={[
                                    styles.categoryIcon,
                                    { backgroundColor: selectedCategory?.color || '#9E9E9E' },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name={(selectedCategory?.icon as any) || 'folder'}
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </View>

                            {/* Category Name */}
                            <Text variant="bodyLarge" style={styles.pickerText}>
                                {selectedCategory?.name || 'Select Category'}
                            </Text>

                            {/* Chevron */}
                            <MaterialCommunityIcons
                                name="chevron-down"
                                size={24}
                                color="#757575"
                            />
                        </View>
                    </TouchableRipple>
                </View>
                {/* Document Number Field */}
                <View style={styles.fieldContainer}>
                    <Text variant="bodyMedium" style={styles.fieldLabel}>
                        Document Number <Text style={styles.optionalText}>(Optional)</Text>
                    </Text>
                    <TextInput
                        value={documentNumber}
                        onChangeText={handleDocNumberChange}
                        mode="outlined"
                        placeholder="e.g., 1234 5678 9012"
                        maxLength={MAX_DOC_NUMBER_LENGTH}
                        style={styles.textInput}
                        outlineColor="#E0E0E0"
                        activeOutlineColor="#009688"
                        textColor="#000000"           // ADDED
                        placeholderTextColor="#9E9E9E"
                    />
                </View>

                {/* Notes Field */}
                <View style={styles.fieldContainer}>
                    <Text variant="bodyMedium" style={styles.fieldLabel}>
                        Notes <Text style={styles.optionalText}>(Optional)</Text>
                    </Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        mode="outlined"
                        placeholder="Add any additional notes..."
                        multiline
                        numberOfLines={3}
                        style={[styles.textInput, styles.notesInput]}
                        outlineColor="#E0E0E0"
                        activeOutlineColor="#009688"
                        textColor="#000000"           // ADDED
                        placeholderTextColor="#9E9E9E"
                    />
                </View>

                {/* File Selection Section */}
                <View style={styles.fieldContainer}>
                    <Text variant="bodyMedium" style={styles.fieldLabel}>
                        Attachment
                    </Text>

                    {/* Add File Button (shown when no file selected) */}
                    {!selectedFile && (
                        <TouchableRipple
                            onPress={() => setFileSheetVisible(true)}
                            style={styles.addFileButton}
                        >
                            <View style={styles.addFileContent}>
                                <MaterialCommunityIcons
                                    name="plus"
                                    size={24}
                                    color="#009688"
                                />
                                <Text variant="bodyLarge" style={styles.addFileText}>
                                    Add File
                                </Text>
                            </View>
                        </TouchableRipple>
                    )}

                    {/* File Preview (shown when file is selected) */}
                    {selectedFile && (
                        <View style={styles.filePreviewContainer}>
                            <View style={styles.filePreview}>
                                {/* File Icon */}
                                <View
                                    style={[
                                        styles.fileIconContainer,
                                        {
                                            backgroundColor:
                                                selectedFile.type === 'pdf' ? '#F44336' : '#2196F3',
                                        },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={selectedFile.type === 'pdf' ? 'file-pdf-box' : 'image'}
                                        size={28}
                                        color="#FFFFFF"
                                    />
                                </View>

                                {/* File Info */}
                                <View style={styles.fileInfo}>
                                    <Text
                                        variant="bodyMedium"
                                        style={styles.fileName}
                                        numberOfLines={1}
                                    >
                                        {selectedFile.name || 'Selected file'}
                                    </Text>
                                    <Text variant="bodySmall" style={styles.fileType}>
                                        {selectedFile.type === 'pdf' ? 'PDF Document' : 'Image'}
                                    </Text>
                                </View>

                                {/* Remove Button */}
                                <TouchableRipple
                                    onPress={handleRemoveFile}
                                    style={styles.removeFileButton}
                                    borderless
                                >
                                    <MaterialCommunityIcons
                                        name="close-circle"
                                        size={24}
                                        color="#F44336"
                                    />
                                </TouchableRipple>
                            </View>

                            {/* Change File Button */}
                            <TouchableRipple
                                onPress={() => setFileSheetVisible(true)}
                                style={styles.changeFileButton}
                            >
                                <Text variant="bodyMedium" style={styles.changeFileText}>
                                    Change File
                                </Text>
                            </TouchableRipple>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Save Button */}
            <View style={styles.bottomContainer}>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                    contentStyle={styles.saveButtonContent}
                    buttonColor="#009688"
                    textColor="#FFFFFF"
                >
                    Save Document
                </Button>
            </View>

            {/* Category Picker Modal */}
            <CategoryPickerModal
                visible={categoryPickerVisible}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onDismiss={() => setCategoryPickerVisible(false)}
                onSelect={setSelectedCategoryId}
            />

            {/* File Selection Bottom Sheet */}
            <FileSelectionSheet
                visible={fileSheetVisible}
                onDismiss={() => setFileSheetVisible(false)}
                onSelectSource={handleFileSourceSelect}
            />

            {/* No File Warning Dialog */}
            <Portal>
                <Dialog
                    visible={noFileWarningVisible}
                    onDismiss={() => setNoFileWarningVisible(false)}
                >
                    <Dialog.Icon icon="alert-circle-outline" color="#FF9800" />
                    <Dialog.Title style={styles.dialogTitle}>
                        No File Attached
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={styles.dialogContent}>
                            You haven't attached any document file. Do you want to save without a file?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            onPress={() => setNoFileWarningVisible(false)}
                            textColor="#757575"
                        >
                            Cancel
                        </Button>
                        <Button
                            onPress={handleContinueWithoutFile}
                            textColor="#009688"
                        >
                            Continue
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    fieldLabel: {
        color: '#000000',
        fontWeight: '500',
        marginBottom: 8,
    },
    optionalText: {
        color: '#9E9E9E',
        fontWeight: '400',
    },
    textInput: {
        backgroundColor: '#FAFAFA',
    },
    notesInput: {
        minHeight: 80,
    },
    helperText: {
        color: '#9E9E9E',
    },
    // Category Picker styles
    pickerButton: {
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
    },
    pickerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    categoryIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    pickerText: {
        flex: 1,
        color: '#000000',
    },
    // Add File Button styles
    addFileButton: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#009688',
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    addFileContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
    },
    addFileText: {
        color: '#009688',
        fontWeight: '500',
        marginLeft: 8,
    },
    // File Preview styles
    filePreviewContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    filePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FAFAFA',
    },
    fileIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        color: '#000000',
        fontWeight: '500',
    },
    fileType: {
        color: '#757575',
        marginTop: 2,
    },
    removeFileButton: {
        padding: 4,
    },
    changeFileButton: {
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    changeFileText: {
        color: '#009688',
        textAlign: 'center',
        fontWeight: '500',
    },
    // Bottom Save Button styles
    bottomContainer: {
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
    },
    saveButton: {
        borderRadius: 8,
    },
    saveButtonContent: {
        paddingVertical: 8,
    },
    // Dialog styles
    dialogTitle: {
        textAlign: 'center',
    },
    dialogContent: {
        textAlign: 'center',
    },
});