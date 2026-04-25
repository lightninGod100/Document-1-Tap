// src/utils/clearData.ts

// ADDED: New utility for Phase 11C - Clear All Data feature

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, Paths } from 'expo-file-system';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from './constants';

// Storage keys - kept in sync with DocumentContext & CategoryContext
// IMPORTANT: We use removeItem on these specific keys ONLY.
// AsyncStorage.clear() would wipe theme prefs, lockout state, etc.
const DOCUMENTS_STORAGE_KEY = '@document1tap_documents';
const CATEGORIES_STORAGE_KEY = '@document1tap_categories';
const DOCUMENTS_SUBDIR = 'documents';

/**
 * Clears all user documents and categories.
 * Preserves: PIN (SecureStore), theme prefs, lockout state, failed attempts.
 *
 * Order of operations:
 *   1. Remove AsyncStorage metadata keys (atomic, cheap)
 *   2. Delete documents subdir (best-effort, log errors)
 *   3. Re-seed default categories so app has valid initial state
 *
 * Even if step 2 fails partially, app state stays consistent because
 * metadata is already gone — orphaned files become unreferenced (small leak).
 */
export const clearAllAppData = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // Step 1: Remove metadata from AsyncStorage (surgical - only these 2 keys)
    await AsyncStorage.multiRemove([
      DOCUMENTS_STORAGE_KEY,
      CATEGORIES_STORAGE_KEY,
    ]);

    // Step 2: Best-effort delete of documents subdir
    try {
      const documentsDir = new Directory(Paths.document, DOCUMENTS_SUBDIR);
      if (documentsDir.exists) {
        documentsDir.delete();
      }
    } catch (fileError) {
      // Don't fail the whole operation - metadata is already cleared
      console.error('Failed to delete documents directory:', fileError);
    }

    // Step 3: Re-seed default categories (matches CategoryContext.loadCategories logic)
    const seededCategories: Category[] = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      documentCount: 0,
      createdAt: Date.now(),
    }));
    await AsyncStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(seededCategories)
    );

    return { success: true };
  } catch (error) {
    console.error('clearAllAppData failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};