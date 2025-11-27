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
  
  // Navigation types - defines which screens exist and their parameters
  export type RootStackParamList = {
    Home: undefined;                           // Home screen takes no parameters
    AddDocument: undefined;                    // Add document screen
    DocumentViewer: { documentId: string };    // Viewer needs document ID
    Settings: undefined;                       // Settings screen
    PINSetup: undefined;                       // First-time PIN setup
    AuthScreen: undefined;                     // Biometric/PIN authentication
  };