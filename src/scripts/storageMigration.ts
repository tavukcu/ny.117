import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL, uploadBytes, deleteObject, getMetadata } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAsTexiSuSnyhK17G49Qqz_6O7pMV9f42M",
  authDomain: "neyisek-6b8bc.firebaseapp.com",
  projectId: "neyisek-6b8bc",
  storageBucket: "neyisek-6b8bc.firebasestorage.app",
  messagingSenderId: "187489868178",
  appId: "1:187489868178:web:3f2ee1ca2cabfbbfbf094b",
  measurementId: "G-N5Q8RB9N9V"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export interface MigrationResult {
  folderName: string;
  totalFiles: number;
  migratedFiles: number;
  errors: string[];
  fileDetails: Array<{
    name: string;
    size: number;
    url: string;
    migrated: boolean;
  }>;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  folderCount: number;
  fileCount: number;
  totalSize: number;
}

export class StorageMigrationService {
  static async migrateAllStorageFolders(): Promise<MigrationResult[]> {
    const folders = ['images', 'avatars', 'restaurants', 'products', 'banners'];
    const results: MigrationResult[] = [];

    for (const folder of folders) {
      try {
        const result = await this.migrateStorageFolder(folder);
        results.push(result);
      } catch (error) {
        results.push({
          folderName: folder,
          totalFiles: 0,
          migratedFiles: 0,
          errors: [error instanceof Error ? error.message : String(error)],
          fileDetails: []
        });
      }
    }

    return results;
  }

  static async migrateEntireStorage(): Promise<MigrationResult[]> {
    try {
      const rootRef = ref(storage, '/');
      const result = await listAll(rootRef);
      
      const folders = result.prefixes.map(prefix => prefix.name);
      return await this.migrateAllStorageFolders();
    } catch (error) {
      throw new Error(`Entire storage migration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async migrateStorageFolder(folderName: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      folderName,
      totalFiles: 0,
      migratedFiles: 0,
      errors: [],
      fileDetails: []
    };

    try {
      const folderRef = ref(storage, folderName);
      const files = await listAll(folderRef);

      result.totalFiles = files.items.length;

      for (const file of files.items) {
        try {
          const url = await getDownloadURL(file);
          const metadata = await getMetadata(file);
          
          result.fileDetails.push({
            name: file.name,
            size: metadata.size || 0,
            url,
            migrated: true
          });
          
          result.migratedFiles++;
        } catch (error) {
          result.errors.push(`File ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
          result.fileDetails.push({
            name: file.name,
            size: 0,
            url: '',
            migrated: false
          });
        }
      }
    } catch (error) {
      result.errors.push(`Folder ${folderName}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  static async validateStorageMigration(): Promise<ValidationResult> {
    const validation: ValidationResult = {
      isValid: true,
      issues: [],
      folderCount: 0,
      fileCount: 0,
      totalSize: 0
    };

    try {
      const folders = ['images', 'avatars', 'restaurants', 'products', 'banners'];
      
      for (const folder of folders) {
        try {
          const folderRef = ref(storage, folder);
          const files = await listAll(folderRef);
          
          validation.folderCount++;
          validation.fileCount += files.items.length;
          
          for (const file of files.items) {
            try {
              const metadata = await getMetadata(file);
              validation.totalSize += metadata.size || 0;
            } catch (error) {
              validation.issues.push(`Cannot read metadata for ${file.fullPath}`);
              validation.isValid = false;
            }
          }
        } catch (error) {
          validation.issues.push(`Cannot access folder ${folder}: ${error instanceof Error ? error.message : String(error)}`);
          validation.isValid = false;
        }
      }
    } catch (error) {
      validation.issues.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
      validation.isValid = false;
    }

    return validation;
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 