// src/contexts/CategoryContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/constants';

// Storage key for AsyncStorage
const CATEGORIES_STORAGE_KEY = '@document1tap_categories';


// Define what methods/data the context provides
interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  addCategory: (category: Omit<Category, 'id' | 'documentCount' | 'createdAt'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategoryDocCount: (id: string, count: number) => Promise<void>;
  isCategoryNameTaken: (name: string) => boolean; // ADDED: Duplicate check
  // ADDED: Update category method signature
  updateCategory: (id: string, updates: Partial<Pick<Category, 'name' | 'icon'>>) => Promise<void>;
}

// Create the context
const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Provider component that wraps the app
export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories from AsyncStorage on app start
  useEffect(() => {
    loadCategories();
  }, []);

  // Load categories from storage or initialize defaults
  const loadCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);

      if (stored) {
        // Categories exist in storage, load them
        setCategories(JSON.parse(stored));
      } else {
        // First launch - initialize default categories
        const initialized = DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          documentCount: 0,
          createdAt: Date.now(),
        }));

        await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(initialized));
        setCategories(initialized);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      // ADDED: Initialize with defaults even if storage fails
      const initialized = DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        documentCount: 0,
        createdAt: Date.now(),
      }));
      setCategories(initialized);
    } finally {
      setIsLoading(false);
    }
  };

  // Save categories to AsyncStorage
  const saveCategories = async (updatedCategories: Category[]) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Failed to save categories:', error);
    }
  };

  // Add a new custom category
  const addCategory = async (category: Omit<Category, 'id' | 'documentCount' | 'createdAt'>) => {
    const newCategory: Category = {
      ...category,
      id: `cat_custom_${Date.now()}`,
      documentCount: 0,
      createdAt: Date.now(),
    };

    const updated = [...categories, newCategory];
    await saveCategories(updated);
  };

  // Delete a category (only if not predefined and has no documents)
  const deleteCategory = async (id: string) => {
    const category = categories.find((c) => c.id === id);

    if (category?.isPredefined || (category?.documentCount ?? 0) > 0) {
      return;
    }

    const updated = categories.filter((c) => c.id !== id);
    await saveCategories(updated);
  };

  // ADDED: Update an existing category (name and/or icon)
  const updateCategory = async (id: string, updates: Partial<Pick<Category, 'name' | 'icon'>>) => {
    const updated = categories.map((cat) =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    await saveCategories(updated);
  };
  // Update document count for a category
  const updateCategoryDocCount = async (id: string, count: number) => {
    const updated = categories.map((cat) =>
      cat.id === id ? { ...cat, documentCount: count } : cat
    );
    await saveCategories(updated);
  };
  // ADDED: Check if category name already exists (case-insensitive)
  const isCategoryNameTaken = (name: string): boolean => {
    const normalizedName = name.trim().toLowerCase();
    return categories.some(
      (cat) => cat.name.trim().toLowerCase() === normalizedName
    );
  };
  // CRITICAL: Must return JSX, not text
  return (
    <CategoryContext.Provider
      value={{
        categories,
        isLoading,
        addCategory,
        updateCategory,
        deleteCategory,
        updateCategoryDocCount,
        isCategoryNameTaken,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

// Custom hook to use the category context
export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoryProvider');
  }
  return context;
}