// src/contexts/DocumentContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Directory, Paths } from 'expo-file-system';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Document } from '../types';

// Storage key for AsyncStorage
const DOCUMENTS_STORAGE_KEY = '@document1tap_documents';

// Directory for storing document files
const DOCUMENTS_SUBDIR = 'documents';

// Define what methods/data the context provides
interface DocumentContextType {
  documents: Document[];
  isLoading: boolean;
  addDocument: (
    document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'documentNumberMasked'>
  ) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  getDocumentsByCategory: (categoryId: string) => Document[];
  getStarredDocuments: () => Document[];
  toggleStar: (id: string) => Promise<void>;
}

// Create the context
const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

// Helper: Generate masked document number (e.g., "1234 5678 9012" → "XXXX XXXX 9012")
const maskDocumentNumber = (number: string): string => {
  const cleaned = number.replace(/\s/g, ''); // Remove spaces
  if (cleaned.length <= 4) return number; // Too short to mask
  
  const lastFour = cleaned.slice(-4);
  const maskedPart = cleaned.slice(0, -4).replace(/./g, 'X');
  
  // Re-add spaces every 4 characters for readability
  const combined = maskedPart + lastFour;
  return combined.replace(/(.{4})/g, '$1 ').trim();
};

// Helper: Copy file to app's document directory
// NEW: Helper using SDK 54 API
const copyFileToAppDirectory = async (
    sourceUri: string, 
    fileType: 'image' | 'pdf'
  ): Promise<string> => {
    // Create documents subdirectory inside Paths.document
    const documentsDir = new Directory(Paths.document, DOCUMENTS_SUBDIR);
    
    // Create directory if it doesn't exist
    if (!documentsDir.exists) {
      documentsDir.create();
    }
  
    // Generate unique filename
    const extension = fileType === 'pdf' ? 'pdf' : 'jpg';
    const filename = `doc_${Date.now()}.${extension}`;
    
    // Create source file reference
    const sourceFile = new File(sourceUri);
    
    // Create destination file reference
    const destinationFile = new File(documentsDir, filename);
    
    // Copy file
    sourceFile.copy(destinationFile);
  
    return destinationFile.uri;
  };


// Provider component
export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load documents from AsyncStorage on app start
  useEffect(() => {
    loadDocuments();
  }, []);

  // Load documents from storage
  const loadDocuments = async () => {
    try {
      const stored = await AsyncStorage.getItem(DOCUMENTS_STORAGE_KEY);
      if (stored) {
        setDocuments(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save documents to AsyncStorage
  const saveDocuments = async (updatedDocuments: Document[]) => {
    try {
      await AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(updatedDocuments));
      setDocuments(updatedDocuments);
    } catch (error) {
      console.error('Failed to save documents:', error);
      throw error; // Re-throw so caller knows save failed
    }
  };

  // Add a new document
  const addDocument = async (
    documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'documentNumberMasked'>
  ): Promise<Document> => {
    let fileUri = documentData.fileUri;

    // If file exists, copy to app directory
    if (fileUri && documentData.fileType) {
      fileUri = await copyFileToAppDirectory(fileUri, documentData.fileType);
    }

    const now = Date.now();
    const newDocument: Document = {
      ...documentData,
      id: `doc_${now}`,
      fileUri,
      documentNumberMasked: documentData.documentNumber 
        ? maskDocumentNumber(documentData.documentNumber)
        : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...documents, newDocument];
    await saveDocuments(updated);

    return newDocument;
  };

  // Update an existing document
  const updateDocument = async (id: string, updates: Partial<Document>) => {
    const updated = documents.map((doc) => {
      if (doc.id !== id) return doc;

      // If document number changed, regenerate masked version
      const documentNumberMasked = updates.documentNumber
        ? maskDocumentNumber(updates.documentNumber)
        : doc.documentNumberMasked;

      return {
        ...doc,
        ...updates,
        documentNumberMasked,
        updatedAt: Date.now(),
      };
    });

    await saveDocuments(updated);
  };

  // Delete a document
  const deleteDocument = async (id: string) => {
    const docToDelete = documents.find((d) => d.id === id);

    // Delete the file from filesystem if it exists
    // Inside deleteDocument function
if (docToDelete?.fileUri) {
    try {
      const fileToDelete = new File(docToDelete.fileUri);
      if (fileToDelete.exists) {
        fileToDelete.delete();
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }

    const updated = documents.filter((doc) => doc.id !== id);
    await saveDocuments(updated);
  };

  // Get documents by category
  const getDocumentsByCategory = (categoryId: string): Document[] => {
    return documents.filter((doc) => doc.categoryId === categoryId);
  };

  // Get starred documents
  const getStarredDocuments = (): Document[] => {
    return documents.filter((doc) => doc.isStarred);
  };

  // Toggle star status
  const toggleStar = async (id: string) => {
    const updated = documents.map((doc) =>
      doc.id === id
        ? { ...doc, isStarred: !doc.isStarred, updatedAt: Date.now() }
        : doc
    );
    await saveDocuments(updated);
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        isLoading,
        addDocument,
        updateDocument,
        deleteDocument,
        getDocumentsByCategory,
        getStarredDocuments,
        toggleStar,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

// Custom hook to use the document context
export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within DocumentProvider');
  }
  return context;
}