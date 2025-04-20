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