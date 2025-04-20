'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUploadedFiles, FileInfo } from '@/services/api';

interface CSVContextType {
  files: FileInfo[];
  selectedFileId: string | null;
  loading: boolean;
  error: string | null;
  refreshFiles: () => Promise<void>;
  selectFile: (fileId: string) => void;
  clearSelectedFile: () => void;
}

const CSVContext = createContext<CSVContextType | undefined>(undefined);

export function CSVProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUploadedFiles();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectFile = (fileId: string) => {
    if (!fileId) {
      console.error("Cannot select file: No file ID provided");
      return;
    }
    
    // Check if the file ID exists in our files list
    const fileExists = files.some(file => file.file_id === fileId);
    
    if (!fileExists && files.length > 0) {
      console.warn(`File ID ${fileId} was not found in the current files list. Available files:`, 
        files.map(f => ({ id: f.file_id, name: f.filename })));
    }
    
    console.log(`Selecting file ID: ${fileId}`);
    setSelectedFileId(fileId);
  };

  const clearSelectedFile = () => {
    setSelectedFileId(null);
  };

  useEffect(() => {
    refreshFiles();
  }, []);

  return (
    <CSVContext.Provider
      value={{
        files,
        selectedFileId,
        loading,
        error,
        refreshFiles,
        selectFile,
        clearSelectedFile
      }}
    >
      {children}
    </CSVContext.Provider>
  );
}

export function useCSV() {
  const context = useContext(CSVContext);
  if (context === undefined) {
    throw new Error('useCSV must be used within a CSVProvider');
  }
  return context;
} 