// src/types/index.ts

// Document structure - defines what data each document has
export interface Document {
  id: string;                    // Unique identifier (e.g., "doc_12345")
  title: string;                 // Document name (e.g., "Aadhaar Card")
  documentNumber?: string;       // Optional number (e.g., "1234 5678 9012")
  documentNumberMasked?: string; // Masked version (e.g., "XXXX XXXX 9012")
  fileUri: string;               // Local file path
  fileType: 'image' | 'pdf';     // File type
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