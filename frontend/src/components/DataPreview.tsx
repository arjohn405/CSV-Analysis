'use client';

import { useState, useEffect } from 'react';
import { getFileMetadata, getFileStats, CSVMetadata, FileStats } from '@/services/api';
import { useCSV } from '@/context/CSVContext';
import { 
  TableCellsIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowsUpDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function DataPreview() {
  const { selectedFileId } = useCSV();
  const [metadata, setMetadata] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'stats'>('preview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFileId) {
      loadData(selectedFileId);
    } else {
      setMetadata(null);
      setStats(null);
    }
  }, [selectedFileId]);

  const loadData = async (fileId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const [metadataResult, statsResult] = await Promise.allSettled([
        getFileMetadata(fileId),
        getFileStats(fileId)
      ]);
      
      if (metadataResult.status === 'fulfilled') {
        setMetadata(metadataResult.value);
      } else {
        console.error('Error loading metadata:', metadataResult.reason);
        throw metadataResult.reason;
      }
      
      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value);
      } else {
        console.error('Error loading stats:', statsResult.reason);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      const errorMessage = err.userMessage || 
        'Failed to load data preview. Please check if the backend server is running.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-100 rounded w-1/3"></div>
          <div className="h-8 bg-gray-100 rounded w-32"></div>
        </div>
        <div className="h-80 bg-gray-100 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-lg p-6 text-center">
        <div className="flex flex-col items-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => selectedFileId && loadData(selectedFileId)}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return null;
  }

  const hasStats = stats && stats.columns && stats.columns.length > 0;
  const hasMissingValues = hasStats && stats.columns.some(col => col.missing > 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {viewMode === 'preview' ? 'Data Preview' : 'Column Statistics'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {metadata.filename} • {metadata.row_count.toLocaleString()} rows × {metadata.column_count} columns
          </p>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-0.5 flex text-sm">
          <button
            className={`px-3 py-1.5 rounded-md ${viewMode === 'preview' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600'}`}
            onClick={() => setViewMode('preview')}
          >
            <span className="flex items-center">
              <TableCellsIcon className="h-4 w-4 mr-1.5" />
              Preview
            </span>
          </button>
          <button
            className={`px-3 py-1.5 rounded-md ${viewMode === 'stats' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600'}`}
            onClick={() => setViewMode('stats')}
          >
            <span className="flex items-center">
              <InformationCircleIcon className="h-4 w-4 mr-1.5" />
              Statistics
            </span>
          </button>
        </div>
      </div>
      
      {/* Data Preview View */}
      {viewMode === 'preview' && (
        <>
          {hasMissingValues && (
            <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 p-3 rounded-md text-sm mb-4 flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
              <p>This dataset contains missing values in some columns. Switch to Statistics view to see details.</p>
            </div>
          )}
          
          <div className="border border-gray-200 rounded-lg overflow-x-auto">
            {metadata.preview.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {metadata.columns.map((column) => (
                      <th 
                        key={column} 
                        scope="col" 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-r border-gray-100 last:border-r-0"
                        title={`Type: ${metadata.dtypes[column]}`}
                      >
                        <div className="flex items-center">
                          <span>{column}</span>
                          <span className="ml-1.5 text-gray-400 text-xs font-normal">({metadata.dtypes[column].replace('64', '')})</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metadata.preview.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {metadata.columns.map((column) => (
                        <td key={column} className="px-4 py-2 text-sm text-gray-500 border-r border-gray-100 last:border-r-0 whitespace-nowrap">
                          {row[column] !== null ? String(row[column]) : <span className="text-gray-300 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ArrowsUpDownIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p>No data available to preview</p>
              </div>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-right">
            Showing first {metadata.preview.length} of {metadata.row_count.toLocaleString()} rows
          </div>
        </>
      )}
      
      {/* Statistics View */}
      {viewMode === 'stats' && (
        <>
          {hasStats ? (
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Missing</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique</th>
                    {stats.columns.some(col => col.min !== undefined) && (
                      <>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mean</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Std Dev</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{col.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{col.dtype.replace('64', '')}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{col.count.toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {col.missing > 0 ? (
                          <span className="text-yellow-600 flex items-center">
                            <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1" />
                            {col.missing.toLocaleString()} 
                            <span className="text-xs text-gray-400 ml-1">
                              ({col.missing_pct !== null && col.missing_pct !== undefined ? col.missing_pct.toFixed(1) : '0.0'}%)
                            </span>
                          </span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{col.unique.toLocaleString()}</td>
                      {col.min !== undefined && (
                        <>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{col.min !== null ? col.min?.toLocaleString() : '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{col.max !== null ? col.max?.toLocaleString() : '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{col.mean !== null && col.mean !== undefined ? col.mean.toFixed(2) : '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{col.std !== null && col.std !== undefined ? col.std.toFixed(2) : '-'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <InformationCircleIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-600">Loading statistics...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 