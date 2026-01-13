// src/utils/searchUtils.ts

import { Document, Category } from '../types';

/**
 * searchs documents based on search query.
 * Matches against: title, documentNumber, documentNumberMasked, and category name.
 * 
 * @param documents - Array of documents to search
 * @param searchQuery - User's search input
 * @param categories - Array of categories (for resolving category names)
 * @param skipCategoryMatch - If true, skips category name matching (useful in category-detail)
 * @returns searched array of documents
 */
export function searchDocuments(
  documents: Document[],
  searchQuery: string,
  categories: Category[],
  skipCategoryMatch: boolean = false
): Document[] {
  const query = searchQuery.trim().toLowerCase();

  // Empty query returns all documents
  if (!query) {
    return documents;
  }

  // Helper: Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name.toLowerCase() || '';
  };

  return documents.filter((doc) => {
    // Match against title (case-insensitive, contains)
    if (doc.title.toLowerCase().includes(query)) {
      return true;
    }

    // Match against document number (if exists)
    if (doc.documentNumber?.toLowerCase().includes(query)) {
      return true;
    }


    // Match against category name (unless skipped)
    if (!skipCategoryMatch) {
      const categoryName = getCategoryName(doc.categoryId);
      if (categoryName.includes(query)) {
        return true;
      }
    }

    return false;
  });
}