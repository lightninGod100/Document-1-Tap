// src/utils/filePickers.ts

import * as ImagePicker from 'expo-image-picker';
// ADDED: Import document picker
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

// Types for picker results
export interface PickedFile {
  uri: string;
  type: 'image' | 'pdf';
  name: string;
  size?: number; // in bytes
}

export interface PickerResult {
  success: boolean;
  file?: PickedFile;
  error?: string;
}

// Constants
const IMAGE_QUALITY = 0.8;
// ADDED: PDF size limit (20MB in bytes)
const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const MAX_PDF_SIZE_MB = 20;
/**
 * Launch camera to capture a document photo
 * - Back camera only
 * - JPEG output at 0.8 quality
 */
export async function captureFromCamera(): Promise<PickerResult> {
  try {
    // Step 1: Request camera permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Camera access is needed to capture documents. Please enable it in Settings.',
        [{ text: 'OK' }]
      );
      return { success: false, error: 'Camera permission denied' };
    }

    // Step 2: Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: IMAGE_QUALITY,
      cameraType: ImagePicker.CameraType.back,
      exif: false,
    });

    // Step 3: Handle cancellation
    if (result.canceled) {
      return { success: false, error: 'User cancelled' };
    }

    // Step 4: Extract image info
    const asset = result.assets[0];
    const fileName = `camera_${Date.now()}.jpg`;

    return {
      success: true,
      file: {
        uri: asset.uri,
        type: 'image',
        name: fileName,
        size: asset.fileSize,
      },
    };

  } catch (error) {
    console.error('Camera capture error:', error);
    return { 
      success: false, 
      error: 'Failed to capture photo. Please try again.' 
    };
  }
}

// ADDED: Gallery picker function
/**
 * Pick an image from device gallery
 * - Any image format (converted to JPEG by iOS if HEIC)
 * - 0.8 quality output
 */
export async function pickFromGallery(): Promise<PickerResult> {
  try {
    // Step 1: Request media library permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Photo library access is needed to select documents. Please enable it in Settings.',
        [{ text: 'OK' }]
      );
      return { success: false, error: 'Gallery permission denied' };
    }

    // Step 2: Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: IMAGE_QUALITY,
      exif: false,
    });

    // Step 3: Handle cancellation
    if (result.canceled) {
      return { success: false, error: 'User cancelled' };
    }

    // Step 4: Extract image info
    const asset = result.assets[0];
    
    // Generate filename from original or create new
    const originalName = asset.fileName || `gallery_${Date.now()}.jpg`;
    // Ensure .jpg extension (in case HEIC was converted)
    const fileName = originalName.replace(/\.(heic|heif|png|webp)$/i, '.jpg');

    return {
      success: true,
      file: {
        uri: asset.uri,
        type: 'image',
        name: fileName,
        size: asset.fileSize,
      },
    };

  } catch (error) {
    console.error('Gallery picker error:', error);
    return { 
      success: false, 
      error: 'Failed to select image. Please try again.' 
    };
  }
}

// ADDED: PDF picker function
/**
 * Pick a PDF document from device
 * - PDF files only
 * - 20MB hard limit
 */
export async function pickPDF(): Promise<PickerResult> {
  try {
    // Step 1: Launch document picker (no permission needed for document picker)
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true, // Ensures we can access the file
    });

    // Step 2: Handle cancellation
    if (result.canceled) {
      return { success: false, error: 'User cancelled' };
    }

    // Step 3: Extract file info
    const asset = result.assets[0];
    const fileSize = asset.size || 0;

    // Step 4: Validate file size (20MB hard limit)
    if (fileSize > MAX_PDF_SIZE_BYTES) {
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
      Alert.alert(
        'File Too Large',
        `This PDF is ${fileSizeMB} MB.\n\nMaximum allowed size is ${MAX_PDF_SIZE_MB} MB. Please select a smaller file.`,
        [{ text: 'OK' }]
      );
      return { success: false, error: 'File too large' };
    }

    // Step 5: Return file info
    const fileName = asset.name || `document_${Date.now()}.pdf`;

    return {
      success: true,
      file: {
        uri: asset.uri,
        type: 'pdf',
        name: fileName,
        size: fileSize,
      },
    };

  } catch (error) {
    console.error('PDF picker error:', error);
    return { 
      success: false, 
      error: 'Failed to select PDF. Please try again.' 
    };
  }
}