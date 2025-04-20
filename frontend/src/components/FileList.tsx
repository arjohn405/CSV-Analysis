'use client';

import { useCSV } from '@/context/CSVContext';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  ChartBarIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useCallback } from 'react';

export default function FileList() {
  const { files, loading, error, selectFile, selectedFileId } = useCSV();

  const handleSelectFile = useCallback((fileId: string) => {
    selectFile(fileId);
    // Scroll to top on mobile when selecting a file
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectFile]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-3 px-4 py-4">
          <div className="h-12 bg-gray-100 rounded w-full"></div>
          <div className="h-12 bg-gray-100 rounded w-full"></div>
          <div className="h-12 bg-gray-100 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <DocumentMagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 mb-1">No CSV files yet</p>
        <p className="text-xs text-gray-400">Upload a file to get started</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {files.map((file) => (
        <div 
          key={file.file_id} 
          className={`p-4 hover:bg-gray-50 transition-colors ${selectedFileId === file.file_id ? 'bg-blue-50' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <DocumentTextIcon className={`h-5 w-5 mr-2 ${selectedFileId === file.file_id ? 'text-blue-500' : 'text-gray-400'}`} />
                <h3 className="text-sm font-medium text-gray-900 truncate">{file.filename}</h3>
                {selectedFileId === file.file_id && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Active
                  </span>
                )}
              </div>
              
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {file.upload_time}
                </div>
                <div className="flex items-center">
                  <ChartBarIcon className="h-3 w-3 mr-1" />
                  {file.row_count.toLocaleString()} rows × {file.column_count} columns
                </div>
                <div>
                  File size: {file.size}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleSelectFile(file.file_id)}
              className={`ml-4 flex-shrink-0 inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedFileId === file.file_id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300'
              }`}
            >
              {selectedFileId === file.file_id ? 'Selected' : (
                <>
                  Analyze
                  <ArrowRightIcon className="ml-1 h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 