// src/utils/constants.ts

import { Category } from '../types';

// Default categories that are initialized on first app launch
export const DEFAULT_CATEGORIES: Omit<Category, 'documentCount' | 'createdAt'>[] = [
  {
    id: 'cat_government',
    name: 'Government',
    icon: 'file-document',        // Government documents icon
    color: '#2196F3',              // Blue - represents official/government
    isPredefined: true,
  },
  {
    id: 'cat_bank',
    name: 'Bank',
    icon: 'bank',                  // Bank building icon
    color: '#4CAF50',              // Green - represents money/finance
    isPredefined: true,
  },
  {
    id: 'cat_cards',
    name: 'Cards',
    icon: 'credit-card',           // Credit/debit card icon
    color: '#FF9800',              // Orange - stands out for cards
    isPredefined: true,
  },
  {
    id: 'cat_vehicle',
    name: 'Vehicle',
    icon: 'car',                   // Car icon
    color: '#F44336',              // Red - common for vehicle-related
    isPredefined: true,
  },
  {
    id: 'cat_uncategorized',
    name: 'Uncategorized',
    icon: 'folder',                // Generic folder icon
    color: '#9E9E9E',              // Grey - neutral for misc items
    isPredefined: true,
  },
];

export const CUSTOM_CATEGORY_COLOR='#9C27B0';
export const CATEGORY_ICONS:string[]=[
  'folder',           // Default icon (first in list)
  'file-document',
  'bank',
  'credit-card',
  'car',
  'airplane',
  'hospital-box',
  'school',
  'home',
  'briefcase',
  'certificate',
  'shield-lock',
  'account',
  'cellphone',
  'cash',
  'ticket-outline',
  'heart-pulse',
  'gavel',
  'receipt',
  'passport',
];