// ADDED: Imports at top of file
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

// ADDED: Open PDF in external viewer
export async function openPdfInViewer(
  fileUri: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (Platform.OS === 'android') {
      // Android: Try Intent system first
      try {
        // Use legacy API for getContentUriAsync (SDK 54)
        const contentUri = await FileSystemLegacy.getContentUriAsync(fileUri);
        
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: 'application/pdf',
        });
        
        return { success: true };
      } catch (intentError: any) {
        console.error('Intent launcher error:', intentError);
        
        // Check if no PDF viewer is installed
        if (
          intentError?.message?.includes('No Activity found') ||
          intentError?.message?.includes('ActivityNotFoundException')
        ) {
          return {
            success: false,
            error: 'Install a PDF viewer to view document',
          };
        }
        
        // For other Intent errors, fallback to sharing
        console.log('Falling back to share sheet...');
        return await openWithShareSheet(fileUri, fileName);
      }
    } else {
      // iOS: Use share sheet (includes "Open In..." option)
      return await openWithShareSheet(fileUri, fileName);
    }
  } catch (error: any) {
    console.error('Open PDF error:', error);
    return {
      success: false,
      error: 'Failed to open PDF',
    };
  }
}

// ADDED: Helper function for share sheet fallback
async function openWithShareSheet(
  fileUri: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    return { success: false, error: 'Cannot open file on this device' };
  }

  try {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: `Open ${fileName}`,
    });
    return { success: true };
  } catch (error) {
    console.error('Share sheet error:', error);
    return { success: false, error: 'Failed to open PDF' };
  }
}