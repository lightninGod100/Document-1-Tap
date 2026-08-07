// app/add-document.tsx

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Button,
    Dialog,
    HelperText,
    Portal,
    Snackbar,  // ADDED
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
import { useDocuments } from '../src/contexts/DocumentContext';
// MODIFIED: Add Image to React Native imports

// Constants for validation
const MAX_TITLE_LENGTH = 40;
const MAX_DOC_NUMBER_LENGTH = 50;
const DEFAULT_CATEGORY_ID = 'cat_uncategorized';

export default function AddDocumentScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { origin, id, sharedUri, sharedMimeType, sharedName } = useLocalSearchParams<{
        origin?: string;
        id?: string;
        sharedUri?: string;
        sharedMimeType?: string;
        sharedName?: string;
    }>();
    const { categories } = useCategories();
    const { documents, addDocument, updateDocument } = useDocuments();
    const documentToEdit = id ? documents.find((document) => document.id === id) : undefined;
    const isEditing = Boolean(id);

    // Form state
    const [title, setTitle] = useState(documentToEdit?.title ?? '');
    const [selectedCategoryId, setSelectedCategoryId] = useState(
        documentToEdit?.categoryId ?? DEFAULT_CATEGORY_ID
    );
    const [documentNumber, setDocumentNumber] = useState(documentToEdit?.documentNumber ?? '');
    const [notes, setNotes] = useState(documentToEdit?.notes ?? '');

    const sharedFile =
        !id && sharedUri
            ? {
                uri: sharedUri,
                type: sharedMimeType?.toLowerCase().startsWith('image/')
                    ? 'image' as const
                    : 'pdf' as const,
                name: sharedName || sharedUri.split('/').pop(),
            }
            : null;

    // File state (will be expanded in Phase 4B/4C)
    const [selectedFile, setSelectedFile] = useState<{
        uri: string;
        type: 'image' | 'pdf';
        name?: string;
    } | null>(
        documentToEdit?.fileUri && documentToEdit.fileType
            ? {
                uri: documentToEdit.fileUri,
                type: documentToEdit.fileType,
                name: documentToEdit.fileUri.split('/').pop(),
            }
            : sharedFile
    );

    // Modal visibility state
    const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
    const [fileSheetVisible, setFileSheetVisible] = useState(false);
    const [noFileWarningVisible, setNoFileWarningVisible] = useState(false);
    // ADDED: Loading state for save operation
    const [isSaving, setIsSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        visible: false,
        message: '',
        type: 'success',
    });

    // ADDED: Show success snackbar
    const showSuccess = (message: string) => {
        setSnackbar({ visible: true, message, type: 'success' });
    };

    // ADDED: Show error snackbar
    const showError = (message: string) => {
        setSnackbar({ visible: true, message, type: 'error' });
    };

    // ADDED: Hide snackbar
    const hideSnackbar = () => {
        setSnackbar(prev => ({ ...prev, visible: false }));
    };
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

    // REPLACED: Actual save logic with context integration
    const saveDocument = async () => {
        // Prevent double-tap
        if (isSaving) return;

        setIsSaving(true);

        try {
            const finalTitle = title.trim() || 'Unknown';

            const documentData = {
                title: finalTitle,
                categoryId: selectedCategoryId,
                documentNumber: documentNumber.trim() || undefined,
                notes: notes.trim() || undefined,
                fileUri: selectedFile?.uri,
                fileType: selectedFile?.type,
            };

            if (isEditing && id) {
                if (!documentToEdit) {
                    throw new Error(`Document ${id} was not found`);
                }
                await updateDocument(id, documentData);
            } else {
                await addDocument({
                    ...documentData,
                    isStarred: false,
                });
            }

            // Show success message
            showSuccess(isEditing ? 'Document updated successfully' : 'Document saved successfully');

            // Navigate back after short delay (let user see toast)
            setTimeout(() => {
                if (isEditing) {
                    router.back();
                } else if (origin) {
                    router.replace(origin);
                } else {
                    router.back();
                }
            }, 500);

        } catch (error) {
            console.error('Failed to save document:', error);
            showError('Failed to save document. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle "Continue" in warning dialog (save without file)
    const handleContinueWithoutFile = () => {
        setNoFileWarningVisible(false);
        saveDocument();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title={isEditing ? 'Edit Document' : 'New Document'} />
            </Appbar.Header>

            {/* Scrollable Form Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Title Field */}
                <View style={styles.fieldContainer}>
                    <Text
                        variant="bodyMedium"
                        style={[styles.fieldLabel, { color: theme.colors.onBackground }]}
                    >
                        Title
                    </Text>
                    <TextInput
                        value={title}
                        onChangeText={handleTitleChange}
                        mode="outlined"
                        placeholder="Enter document title"
                        maxLength={MAX_TITLE_LENGTH}
                        style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.tertiary}
                        textColor={theme.colors.onSurface}
                        placeholderTextColor={theme.colors.onSurfaceVariant}
                    />
                    <HelperText
                        type="info"
                        visible={true}
                        style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}
                    >
                        {`${title.length}/${MAX_TITLE_LENGTH} characters`}
                    </HelperText>
                </View>

                {/* Category Picker Field */}
                <View style={styles.fieldContainer}>
                    <Text
                        variant="bodyMedium"
                        style={[styles.fieldLabel, { color: theme.colors.onBackground }]}
                    >
                        Category
                    </Text>
                    <TouchableRipple
                        onPress={() => setCategoryPickerVisible(true)}
                        style={[
                            styles.pickerButton,
                            {
                                borderColor: theme.colors.outline,
                                backgroundColor: theme.colors.surface,
                            },
                        ]}
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
                            <Text
                                variant="bodyLarge"
                                style={[styles.pickerText, { color: theme.colors.onSurface }]}
                            >
                                {selectedCategory?.name || 'Select Category'}
                            </Text>

                            {/* Chevron */}
                            <MaterialCommunityIcons
                                name="chevron-down"
                                size={24}
                                color={theme.colors.onSurfaceVariant}
                            />
                        </View>
                    </TouchableRipple>
                </View>
                {/* Document Number Field */}
                <View style={styles.fieldContainer}>
                    <Text
                        variant="bodyMedium"
                        style={[styles.fieldLabel, { color: theme.colors.onBackground }]}
                    >
                        Document Number{' '}
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>(Optional)</Text>
                    </Text>
                    <TextInput
                        value={documentNumber}
                        onChangeText={handleDocNumberChange}
                        mode="outlined"
                        placeholder="e.g., 1234 5678 9012"
                        maxLength={MAX_DOC_NUMBER_LENGTH}
                        style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.tertiary}
                        textColor={theme.colors.onSurface}
                        placeholderTextColor={theme.colors.onSurfaceVariant}
                    />
                </View>

                {/* Notes Field */}
                <View style={styles.fieldContainer}>
                    <Text
                        variant="bodyMedium"
                        style={[styles.fieldLabel, { color: theme.colors.onBackground }]}
                    >
                        Notes{' '}
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>(Optional)</Text>
                    </Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        mode="outlined"
                        placeholder="Add any additional notes..."
                        multiline
                        numberOfLines={3}
                        style={[
                            styles.textInput,
                            styles.notesInput,
                            { backgroundColor: theme.colors.surface },
                        ]}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.tertiary}
                        textColor={theme.colors.onSurface}
                        placeholderTextColor={theme.colors.onSurfaceVariant}
                    />
                </View>

                {/* File Selection Section */}
                <View style={styles.fieldContainer}>
                    <Text
                        variant="bodyMedium"
                        style={[styles.fieldLabel, { color: theme.colors.onBackground }]}
                    >
                        Attachment
                    </Text>

                    {/* Add File Button (shown when no file selected) */}
                    {!selectedFile && (
                        <TouchableRipple
                            onPress={() => setFileSheetVisible(true)}
                            style={[
                                styles.addFileButton,
                                {
                                    borderColor: theme.colors.tertiary,
                                    backgroundColor: theme.colors.surfaceVariant,
                                },
                            ]}
                        >
                            <View style={styles.addFileContent}>
                                <MaterialCommunityIcons
                                    name="plus"
                                    size={24}
                                    color={theme.colors.tertiary}
                                />
                                <Text
                                    variant="bodyLarge"
                                    style={[styles.addFileText, { color: theme.colors.tertiary }]}
                                >
                                    Add File
                                </Text>
                            </View>
                        </TouchableRipple>
                    )}

                    {/* File Preview (shown when file is selected) */}
                    {selectedFile && (
                        <View
                            style={[
                                styles.filePreviewContainer,
                                { borderColor: theme.colors.outline },
                            ]}
                        >
                            <View
                                style={[
                                    styles.filePreview,
                                    { backgroundColor: theme.colors.surfaceVariant },
                                ]}
                            >
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
                                        style={[
                                            styles.fileName,
                                            { color: theme.colors.onSurface },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {selectedFile.name || 'Selected file'}
                                    </Text>
                                    <Text
                                        variant="bodySmall"
                                        style={[
                                            styles.fileType,
                                            { color: theme.colors.onSurfaceVariant },
                                        ]}
                                    >
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
                                style={[
                                    styles.changeFileButton,
                                    { borderTopColor: theme.colors.outline },
                                ]}
                            >
                                <Text
                                    variant="bodyMedium"
                                    style={[
                                        styles.changeFileText,
                                        { color: theme.colors.tertiary },
                                    ]}
                                >
                                    Change File
                                </Text>
                            </TouchableRipple>
                        </View>
                    )}
                    {/* Image Preview - Only shown for images */}
                    {selectedFile && selectedFile.type === 'image' && (
                        <View
                            style={[
                                styles.imagePreviewContainer,
                                {
                                    borderColor: theme.colors.outline,
                                    backgroundColor: theme.colors.surfaceVariant,
                                },
                            ]}
                        >
                            <Image
                                source={{ uri: selectedFile.uri }}
                                style={styles.imagePreview}
                                resizeMode="contain"
                            />
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Save Button */}
            <View
                style={[
                    styles.bottomContainer,
                    {
                        borderTopColor: theme.colors.outline,
                        backgroundColor: theme.colors.surface,
                    },
                ]}
            >
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                    contentStyle={styles.saveButtonContent}
                    buttonColor="#009688"
                    textColor="#FFFFFF"
                    loading={isSaving}
                    disabled={isSaving}
                    theme={{
                        colors: {
                            surfaceDisabled: '#009688',
                            onSurfaceDisabled: '#FFFFFF',
                        },
                    }}
                >
                    {isSaving ? 'Saving...' : isEditing ? 'Update Document' : 'Save Document'}
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
                            You have not attached any document file. Do you want to save without a file?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            onPress={() => setNoFileWarningVisible(false)}
                            textColor={theme.colors.onSurfaceVariant}
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
            <Snackbar
                visible={snackbar.visible}
                onDismiss={hideSnackbar}
                duration={3000}
                style={{
                    backgroundColor: snackbar.type === 'success' ? '#4CAF50' : '#F44336',
                }}
                action={{
                    label: 'OK',
                    textColor: '#FFFFFF',
                    onPress: hideSnackbar,
                }}
            >
                {snackbar.message}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        fontWeight: '500',
        marginBottom: 8,
    },
    textInput: {},
    notesInput: {
        minHeight: 80,
    },
    helperText: {},
    // Category Picker styles
    pickerButton: {
        borderWidth: 1,
        borderRadius: 4,
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
    },
    // Add File Button styles
    addFileButton: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 8,
    },
    addFileContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
    },
    addFileText: {
        fontWeight: '500',
        marginLeft: 8,
    },
    // File Preview styles
    filePreviewContainer: {
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    filePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
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
        fontWeight: '500',
    },
    fileType: {
        marginTop: 2,
    },
    removeFileButton: {
        padding: 4,
    },
    changeFileButton: {
        paddingVertical: 10,
        borderTopWidth: 1,
    },
    changeFileText: {
        textAlign: 'center',
        fontWeight: '500',
    },
    // Bottom Save Button styles
    bottomContainer: {
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
    },
    saveButton: {
        borderRadius: 8,
    },
    saveButtonContent: {
        paddingVertical: 8,
    },
    saveButtonLabel: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    // Dialog styles
    dialogTitle: {
        textAlign: 'center',
    },
    dialogContent: {
        textAlign: 'center',
    },
    // Image Preview styles (NEW)
    imagePreviewContainer: {
        marginTop: 12,
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: 120,
    },
});