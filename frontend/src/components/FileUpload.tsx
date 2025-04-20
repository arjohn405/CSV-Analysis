'use client';

import { useState, useCallback } from 'react';
import { uploadCSV } from '@/services/api';
import { useCSV } from '@/context/CSVContext';
import { ArrowUpTrayIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onSuccess?: () => void;
}

export default function FileUpload({ onSuccess }: FileUploadProps) {
  const { refreshFiles } = useCSV();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    setSuccess(null);
    
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Only CSV files are allowed');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a CSV file to upload');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      await uploadCSV(file);
      
      setSuccess(`File ${file.name} uploaded successfully!`);
      setFile(null);
      
      // Reset the file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Refresh the file list
      await refreshFiles();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Error uploading file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleUpload} className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : file 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <label htmlFor="csv-file" className="block cursor-pointer">
            {file ? (
              <>
                <CheckCircleIcon className="h-10 w-10 mx-auto text-green-500 mb-2" />
                <span className="block font-medium text-green-700 mb-1">
                  {file.name}
                </span>
                <span className="text-xs text-green-600 block">
                  {(file.size / 1024).toFixed(2)} KB • Ready to upload
                </span>
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className={`h-10 w-10 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={`block font-medium mb-1 ${isDragging ? 'text-blue-700' : 'text-gray-700'}`}>
                  {isDragging ? 'Drop your CSV file here' : 'Click to select or drop a CSV file'}
                </span>
                <span className="text-xs text-gray-500 block">
                  Only CSV files are supported (*.csv)
                </span>
              </>
            )}
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start">
            <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm flex items-start">
            <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        
        <button
          type="submit"
          disabled={!file || uploading}
          className={`w-full py-2 px-4 rounded-md font-medium flex items-center justify-center transition-colors ${
            !file || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
          }`}
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              Upload CSV
            </>
          )}
        </button>
      </form>
    </div>
  );
} 