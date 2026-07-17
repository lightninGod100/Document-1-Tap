// src/hooks/useSortFilter.ts

import { useMemo, useState, useCallback } from 'react';
import {
  Document,
  SortConfig,
  FilterConfig,
  SortField,
  SortDirection,
  DEFAULT_SORT_CONFIG,
  DEFAULT_FILTER_CONFIG,
} from '../types';
import { useCategories } from '../contexts/CategoryContext';

// ============================================
// HOOK RETURN TYPE
// ============================================
interface UseSortFilterReturn {
  // Processed documents (filtered + sorted)
  filteredDocuments: Document[];

  // Current configurations
  sortConfig: SortConfig;
  filterConfig: FilterConfig;

  // Setters
  setSortField: (field: SortField, direction: SortDirection | null) => void;
  setFilterValue: (filterKey: keyof FilterConfig, value: FilterConfig[keyof FilterConfig]) => void;

  // Actions
  clearAll: () => void;
  applyDefaults: () => void;

  // State indicators
  isDefault: boolean;
  activeFilterCount: number;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================
export function useSortFilter(
  documents: Document[],
  initialSortConfig: SortConfig = DEFAULT_SORT_CONFIG,
  initialFilterConfig: FilterConfig = DEFAULT_FILTER_CONFIG
): UseSortFilterReturn {
  const { categories } = useCategories();

  // State
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSortConfig);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(initialFilterConfig);

  // ============================================
  // HELPER: Get category name for sorting
  // ============================================
  const getCategoryName = useCallback((categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Uncategorized';
  }, [categories]);

  // ============================================
  // FILTER LOGIC
  // ============================================
  const applyFilters = useCallback((docs: Document[]): Document[] => {
    return docs.filter((doc) => {
      // Filter: Document Attached (has fileUri)
      if (filterConfig.documentAttached !== 'all') {
        const hasFile = !!doc.fileUri;
        if (filterConfig.documentAttached === 'yes' && !hasFile) return false;
        if (filterConfig.documentAttached === 'no' && hasFile) return false;
      }

      // Filter: Notes Attached (has notes)
      if (filterConfig.notesAttached !== 'all') {
        const hasNotes = !!doc.notes && doc.notes.trim().length > 0;
        if (filterConfig.notesAttached === 'yes' && !hasNotes) return false;
        if (filterConfig.notesAttached === 'no' && hasNotes) return false;
      }

      // Filter: Document Number (has documentNumber)
      if (filterConfig.documentNo !== 'all') {
        const hasDocNum = !!doc.documentNumber && doc.documentNumber.trim().length > 0;
        if (filterConfig.documentNo === 'yes' && !hasDocNum) return false;
        if (filterConfig.documentNo === 'no' && hasDocNum) return false;
      }

      return true;
    });
  }, [filterConfig]);

  // ============================================
  // SORT LOGIC (Multi-level)
  // ============================================
  const applySorting = useCallback((docs: Document[]): Document[] => {
    if (sortConfig.criteria.length === 0) {
      return docs;
    }

    return [...docs].sort((a, b) => {
      // Iterate through sort criteria in priority order
      for (const criterion of sortConfig.criteria) {
        let comparison = 0;

        switch (criterion.field) {
          case 'name':
            comparison = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
            break;
          case 'createdAt':
            comparison = a.createdAt - b.createdAt;
            break;
          case 'category':
            comparison = getCategoryName(a.categoryId).toLowerCase()
              .localeCompare(getCategoryName(b.categoryId).toLowerCase());
            break;
        }

        // Apply direction
        if (criterion.direction === 'desc') {
          comparison = -comparison;
        }

        // If not equal, return this comparison result
        if (comparison !== 0) {
          return comparison;
        }
        // If equal, continue to next criterion (tie-breaker)
      }

      return 0;
    });
  }, [sortConfig, getCategoryName]);

  // ============================================
  // COMBINED: Filter then Sort
  // ============================================
  const filteredDocuments = useMemo(() => {
    const filtered = applyFilters(documents);
    return applySorting(filtered);
  }, [documents, applyFilters, applySorting]);

  // ============================================
  // SETTER: Sort Field
  // Handles multi-level sort priority tracking
  // ============================================
  // MODIFIED: Single field sort only (replaces previous selection)
  const setSortField = useCallback((field: SortField, direction: SortDirection | null) => {
    setSortConfig(() => {
      // If direction is null, deselect and return to default
      if (direction === null) {
        return DEFAULT_SORT_CONFIG;
      }

      // Replace with single criterion (not append)
      return {
        criteria: [{ field, direction }],
      };
    });
  }, []);

  // ============================================
  // SETTER: Filter Value
  // ============================================
  const setFilterValue = useCallback(
    (filterKey: keyof FilterConfig, value: FilterConfig[keyof FilterConfig]) => {
      setFilterConfig((prev) => ({
        ...prev,
        [filterKey]: value,
      }));
    },
    []
  );

  // ============================================
  // ACTION: Clear All (remove all selections)
  // ============================================
  // MODIFIED: Reset to default sort instead of empty
  const clearAll = useCallback(() => {
    setSortConfig(DEFAULT_SORT_CONFIG);
    setFilterConfig(DEFAULT_FILTER_CONFIG);
  }, []);

  // ============================================
  // ACTION: Apply Defaults
  // ============================================
  const applyDefaults = useCallback(() => {
    setSortConfig(DEFAULT_SORT_CONFIG);
    setFilterConfig(DEFAULT_FILTER_CONFIG);
  }, []);

  // ============================================
  // STATE: Check if current config equals default
  // ============================================
  const isDefault = useMemo(() => {
    const sortIsDefault =
      sortConfig.criteria.length === 1 &&
      sortConfig.criteria[0].field === 'createdAt' &&
      sortConfig.criteria[0].direction === 'desc';

    const filterIsDefault =
      filterConfig.documentAttached === 'all' &&
      filterConfig.notesAttached === 'all' &&
      filterConfig.documentNo === 'all';

    return sortIsDefault && filterIsDefault;
  }, [sortConfig, filterConfig]);

  // ============================================
  // STATE: Count active filters (non-default)
  // ============================================
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterConfig.documentAttached !== 'all') count++;
    if (filterConfig.notesAttached !== 'all') count++;
    if (filterConfig.documentNo !== 'all') count++;
    return count;
  }, [filterConfig]);

  return {
    filteredDocuments,
    sortConfig,
    filterConfig,
    setSortField,
    setFilterValue,
    clearAll,
    applyDefaults,
    isDefault,
    activeFilterCount,
  };
}