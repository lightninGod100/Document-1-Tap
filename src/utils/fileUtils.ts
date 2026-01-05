// src/utils/fileUtils.ts

import { File } from 'expo-file-system';

/**
 * Format file size from bytes to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.2 MB", "500 KB", "2.5 GB")
 */
export function formatFileSize(bytes: number | undefined | null): string {
  if (bytes === undefined || bytes === null || bytes === 0) {
    return 'Unknown size';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // Format: 1 decimal place for KB+, no decimals for bytes
  if (unitIndex === 0) {
    return `${size} ${units[unitIndex]}`;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Get file info including size using SDK 54 File API
 * @param fileUri - Local file URI
 * @returns Object with file size in bytes, or null if error
 */
export async function getFileInfo(fileUri: string): Promise<{
  size: number;
  exists: boolean;
} | null> {
  try {
    // MODIFIED: Use new SDK 54 File class API
    const file = new File(fileUri);
    
    if (!file.exists) {
      return null;
    }

    return {
      size: file.size || 0,
      exists: true,
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
}

/**
 * Get formatted file size for a given URI
 * @param fileUri - Local file URI
 * @returns Formatted size string or 'Unknown size' if error
 */
export async function getFormattedFileSize(fileUri: string): Promise<string> {
  const info = await getFileInfo(fileUri);
  if (!info) {
    return 'Unknown size';
  }
  return formatFileSize(info.size);
}

/**
 * Format date to readable string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string (e.g., "Added Oct 24, 2023")
 */
export function formatDocumentDate(timestamp: number): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return `Added ${date.toLocaleDateString('en-US', options)}`;
}