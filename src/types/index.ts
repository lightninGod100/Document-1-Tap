// src/types/index.ts

// MODIFIED: Complete Document interface for Phase 4
export interface Document {
  id: string;                    // Unique identifier (e.g., "doc_1234567890")
  title: string;                 // Document name, max 40 chars, defaults to "Unknown"
  categoryId: string;            // ADDED: Links to category, defaults to "cat_uncategorized"
  documentNumber?: string;       // Optional (e.g., "1234 5678 9012")
  documentNumberMasked?: string; // Masked version (e.g., "XXXX XXXX 9012")
  notes?: string;                // ADDED: Optional description/notes
  fileUri?: string;              // MODIFIED: Now optional - local file path
  fileType?: 'image' | 'pdf';    // MODIFIED: Now optional - file type
  isStarred: boolean;            // ADDED: For starred tab, defaults to false
  createdAt: number;             // Timestamp when created
  updatedAt: number;             // Timestamp when last modified
}

// ADDED: Category structure - defines what data each category has
export interface Category {
  id: string;              // Unique identifier (e.g., "cat_government")
  name: string;            // Display name (e.g., "Government")
  icon: string;            // Material icon name (e.g., "file-document")
  color: string;           // Hex color for visual distinction (e.g., "#2196F3")
  isPredefined: boolean;   // true for default categories, false for custom
  documentCount: number;   // Number of documents in this category
  createdAt: number;       // Timestamp when created
}

// Navigation types - defines which screens exist and their parameters
export type RootStackParamList = {
  Home: undefined;                           // Home screen takes no parameters
  AddDocument: undefined;                    // Add document screen
  DocumentViewer: { documentId: string };    // Viewer needs document ID
  Settings: undefined;                       // Settings screen
  PINSetup: undefined;                       // First-time PIN setup
  AuthScreen: undefined;                     // Biometric/PIN authentication
};