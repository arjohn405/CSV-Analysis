'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DataPreview from '@/components/DataPreview';
import ColumnVisualizations from '@/components/ColumnVisualizations';
import CorrelationAnalysis from '@/components/CorrelationAnalysis';
import { useCSV } from '@/context/CSVContext';
import dynamic from 'next/dynamic';
import { 
  ChartBarIcon, 
  TableCellsIcon, 
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  UserCircleIcon,
  HomeIcon,
  ArrowLeftOnRectangleIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  InformationCircleIcon,
  ShareIcon,
  TrashIcon,
  PresentationChartLineIcon,
  ChartPieIcon,
  AdjustmentsHorizontalIcon,
  DocumentChartBarIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  ArrowsPointingOutIcon,
  ArrowPathIcon,
  ViewColumnsIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { getFileStats, getFileMetadata, deleteCSVFile } from '@/services/api';

// Import plotly dynamically to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function CSVDetailPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const fileId = unwrappedParams.id;
  
  const router = useRouter();
  const { selectFile, selectedFileId, files, loading } = useCSV();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data' | 'visualizations' | 'correlation'>('dashboard');
  const [userName, setUserName] = useState<string>('User');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fileDetails, setFileDetails] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [summaryCharts, setSummaryCharts] = useState<any>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    // For demo: set a random user name 
    const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'];
    setUserName(names[Math.floor(Math.random() * names.length)]);
    
    // Set selected file ID based on the URL param
    if (fileId) {
      console.log(`CSV Detail Page: Setting file ID from URL parameter: ${fileId}`);
      
      // Check if fileId is different from currently selected file
      if (fileId !== selectedFileId) {
        console.log(`CSV Detail Page: Updating selected file ID from ${selectedFileId} to ${fileId}`);
        selectFile(fileId);
      } else {
        console.log(`CSV Detail Page: File ID ${fileId} already selected`);
      }
    } else {
      console.error("CSV Detail Page: No file ID in URL parameters");
    }
  }, [fileId, router, selectFile, selectedFileId]);

  // Set file details from the files list
  useEffect(() => {
    if (files && files.length > 0 && fileId) {
      const file = files.find(f => f.file_id === fileId);
      if (file) {
        setFileDetails(file);
      }
    }
  }, [files, fileId]);

  // Load file metadata and stats when the file is selected
  useEffect(() => {
    if (selectedFileId) {
      loadData(selectedFileId);
    }
  }, [selectedFileId]);

  const loadData = async (fileId: string) => {
    try {
      setDataLoading(true);
      setApiError(null);
      
      try {
        const metadataResult = await getFileMetadata(fileId);
        const statsResult = await getFileStats(fileId);
        
        setMetadata(metadataResult);
        setStats(statsResult);
        
        // Generate summary charts based on the data
        generateSummaryCharts(metadataResult, statsResult);
      } catch (error: any) {
        console.error('Error loading data:', error);
        const errorMessage = error.userMessage || 
          'Failed to load data. Please check if the backend server is running.';
        setApiError(errorMessage);
      }
    } finally {
      setDataLoading(false);
    }
  };

  const generateSummaryCharts = (metadata: any, stats: any) => {
    if (!metadata || !stats || !stats.columns) return;
    
    const charts = [];
    
    // Data completeness chart
    const completenessData = {
      labels: stats.columns.map((col: any) => col.name),
      values: stats.columns.map((col: any) => col.missing_pct),
      type: 'bar',
      marker: {
        color: stats.columns.map((col: any) => 
          col.missing_pct > 20 ? '#f87171' : 
          col.missing_pct > 5 ? '#fbbf24' : '#34d399'
        )
      }
    };
    
    charts.push({
      id: 'completeness',
      title: 'Data Completeness',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
      description: 'Percentage of missing values by column',
      plot: {
        data: [completenessData],
        layout: {
          autosize: true,
          height: 250,
          margin: { l: 50, r: 20, t: 30, b: 100 },
          xaxis: {
            tickangle: -45,
            title: ''
          },
          yaxis: {
            title: 'Missing %',
            range: [0, 100]
          }
        }
      }
    });
    
    // Find numerical columns for distribution summary
    const numericalColumns = stats.columns.filter((col: any) => 
      col.dtype.includes('int') || col.dtype.includes('float')
    ).slice(0, 3); // Take up to 3 numerical columns
    
    if (numericalColumns.length > 0) {
      const distributionData = numericalColumns.map((col: any) => ({
        name: col.name,
        values: metadata.preview.map((row: any) => row[col.name]).filter((val: any) => val !== null && !isNaN(val)),
        type: 'box',
        boxpoints: 'suspectedoutliers'
      }));
      
      charts.push({
        id: 'distributions',
        title: 'Key Distributions',
        icon: <ChartBarIcon className="h-5 w-5 text-purple-500" />,
        description: 'Box plots of numerical columns',
        plot: {
          data: distributionData,
          layout: {
            autosize: true,
            height: 250,
            margin: { l: 50, r: 20, t: 30, b: 50 },
            yaxis: {
              title: ''
            }
          }
        }
      });
    }
    
    // Get categorical column for pie chart
    const categoricalColumns = stats.columns.filter((col: any) => 
      !col.dtype.includes('int') && !col.dtype.includes('float') && col.unique < 10
    ).slice(0, 1); // Take the first suitable categorical column
    
    if (categoricalColumns.length > 0) {
      const catCol = categoricalColumns[0];
      
      // Count value occurrences
      const valueCounts: Record<string, number> = {};
      metadata.preview.forEach((row: any) => {
        const val = String(row[catCol.name]);
        valueCounts[val] = (valueCounts[val] || 0) + 1;
      });
      
      // Convert to arrays for Plotly
      const labels = Object.keys(valueCounts);
      const values = Object.values(valueCounts);
      
      charts.push({
        id: 'categoryBreakdown',
        title: `${catCol.name} Breakdown`,
        icon: <ChartPieIcon className="h-5 w-5 text-green-500" />,
        description: 'Distribution of categories',
        plot: {
          data: [{
            labels,
            values,
            type: 'pie',
            textinfo: 'percent',
            insidetextorientation: 'radial'
          }],
          layout: {
            autosize: true,
            height: 250,
            margin: { l: 20, r: 20, t: 30, b: 20 },
            showlegend: true,
            legend: {
              orientation: 'h',
              y: -0.2
            }
          }
        }
      });
    }
    
    // Add a preview of correlation heatmap if we have numerical columns
    if (numericalColumns.length > 1) {
      // Create a simplified correlation matrix for preview
      const corrMatrix: number[][] = [];
      const corrLabels = numericalColumns.map((col: any) => col.name);
      
      // Create a dummy correlation matrix for preview (would be replaced with real data)
      for (let i = 0; i < corrLabels.length; i++) {
        corrMatrix[i] = [];
        for (let j = 0; j < corrLabels.length; j++) {
          if (i === j) {
            corrMatrix[i][j] = 1; // Perfect correlation with self
          } else {
            // Generate a random correlation value between -1 and 1 for preview
            corrMatrix[i][j] = Math.round((Math.random() * 2 - 1) * 100) / 100;
          }
        }
      }
      
      charts.push({
        id: 'correlationPreview',
        title: 'Correlation Preview',
        icon: <ArrowsRightLeftIcon className="h-5 w-5 text-red-500" />,
        description: 'Preview of correlations between numerical columns',
        plot: {
          data: [{
            z: corrMatrix,
            x: corrLabels,
            y: corrLabels,
            type: 'heatmap',
            colorscale: 'RdBu',
            zmin: -1,
            zmax: 1
          }],
          layout: {
            autosize: true,
            height: 250,
            margin: { l: 50, r: 20, t: 30, b: 50 }
          }
        }
      });
    }
    
    setSummaryCharts(charts);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const toggleCardExpansion = (cardId: string) => {
    if (expandedCard === cardId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(cardId);
    }
  };

  const handleDelete = async () => {
    if (!fileId) return;
    
    try {
      setDeleteInProgress(true);
      await deleteCSVFile(fileId);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting file:', error);
      setApiError('Failed to delete the file. Please try again.');
    } finally {
      setDeleteInProgress(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCopy = () => {
    // Create a text representation of the CSV file details
    const textToCopy = `
File Name: ${fileDetails.filename}
Upload Date: ${formatDate(fileDetails.upload_time)}
Size: ${fileDetails.size}
Dimensions: ${fileDetails.row_count.toLocaleString()} rows × ${fileDetails.column_count} columns
File ID: ${fileId}
    `.trim();
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Show a toast notification (simplified version)
        alert('File details copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleShare = () => {
    // Generate a shareable URL for the current file
    const shareableUrl = `${window.location.origin}/csv/${fileId}`;
    setShareUrl(shareableUrl);
    
    // Copy URL to clipboard
    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        alert('Shareable link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy share link: ', err);
      });
  };

  if (loading || !fileDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-900">CSV Analytics Dashboard</h1>
              </div>
              
              <div className="flex items-center">
                <div className="relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <span className="ml-2 mr-1 text-sm font-medium">{userName}</span>
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                        <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                          <HomeIcon className="h-4 w-4 mr-2" />
                          Home
                        </a>
                        <button 
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-lg p-6 bg-white rounded-lg shadow-md border border-red-100">
            <div className="flex items-center text-red-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold">Connection Error</h2>
            </div>
            <p className="mb-4 text-gray-700">{apiError}</p>
            <div className="flex justify-between">
              <button
                onClick={() => loadData(fileId)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">CSV Analytics Dashboard</h1>
            </div>
            
            <div className="flex items-center">
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <span className="ml-2 mr-1 text-sm font-medium">{userName}</span>
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                      <a href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <HomeIcon className="h-4 w-4 mr-2" />
                        Home
                      </a>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Back button and file name header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="mr-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
              <div className="flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900 truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg" title={fileDetails.filename}>
                  {fileDetails.filename}
                </h1>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleCopy}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                Copy
              </button>
              <button 
                onClick={handleShare}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ShareIcon className="h-4 w-4 mr-1" />
                Share
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
          
          {/* File information card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 mb-6">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center">
                <InformationCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium">File Information</h2>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">File Name</div>
                  <div className="mt-1 text-sm text-gray-900 truncate" title={fileDetails.filename}>
                    {fileDetails.filename}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Upload Date</div>
                  <div className="mt-1 text-sm text-gray-900 flex items-center truncate" title={formatDate(fileDetails.upload_time)}>
                    <ClockIcon className="h-4 w-4 mr-1 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{formatDate(fileDetails.upload_time)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">File Size</div>
                  <div className="mt-1 text-sm text-gray-900 truncate" title={fileDetails.size}>
                    {fileDetails.size}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Dimensions</div>
                  <div className="mt-1 text-sm text-gray-900 flex items-center truncate" 
                       title={`${fileDetails.row_count.toLocaleString()} rows × ${fileDetails.column_count} columns`}>
                    <ViewColumnsIcon className="h-4 w-4 mr-1 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{fileDetails.row_count.toLocaleString()} rows × {fileDetails.column_count} columns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs for different analyses */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                className={`flex items-center px-6 py-4 text-sm font-medium ${
                  activeTab === 'dashboard' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                <Squares2X2Icon className="h-5 w-5 mr-2" />
                Dashboard
              </button>
              <button
                className={`flex items-center px-6 py-4 text-sm font-medium ${
                  activeTab === 'data' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('data')}
              >
                <TableCellsIcon className="h-5 w-5 mr-2" />
                Data Preview
              </button>
              <button
                className={`flex items-center px-6 py-4 text-sm font-medium ${
                  activeTab === 'visualizations' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('visualizations')}
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Visualizations
              </button>
              <button
                className={`flex items-center px-6 py-4 text-sm font-medium ${
                  activeTab === 'correlation' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('correlation')}
              >
                <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
                Correlation
              </button>
            </div>
            
            {activeTab === 'dashboard' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Data Summary Dashboard</h2>
                  <p className="text-sm text-gray-500">
                    Quick overview of key metrics and insights from your CSV file
                  </p>
                </div>
                
                {dataLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden animate-pulse">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="p-4">
                          <div className="h-40 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-5 border border-blue-100">
                        <h3 className="text-lg font-medium text-blue-800 mb-1">Data Coverage</h3>
                        <div className="flex items-end">
                          <span className="text-3xl font-bold text-blue-600">
                            {stats && stats.columns ? (
                              `${(100 - stats.columns.reduce((sum: number, col: any) => sum + col.missing_pct, 0) / stats.columns.length).toFixed(1)}%`
                            ) : '—'}
                          </span>
                          <span className="ml-2 text-blue-800 text-sm mb-1">overall completeness</span>
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                          {stats && stats.columns && stats.columns.some((col: any) => col.missing > 0) ? 
                            `${stats.columns.filter((col: any) => col.missing > 0).length} columns have missing values` :
                            'No missing values detected'
                          }
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm p-5 border border-green-100">
                        <h3 className="text-lg font-medium text-green-800 mb-1">Column Types</h3>
                        <div className="flex items-center">
                          {stats && stats.columns ? (
                            <>
                              <div className="flex items-center mr-3">
                                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                                <span className="text-sm text-green-800">
                                  {stats.columns.filter((col: any) => col.dtype.includes('int') || col.dtype.includes('float')).length} Numeric
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full mr-1"></span>
                                <span className="text-sm text-green-800">
                                  {stats.columns.filter((col: any) => !col.dtype.includes('int') && !col.dtype.includes('float')).length} Categorical
                                </span>
                              </div>
                            </>
                          ) : '—'}
                        </div>
                        <p className="text-xs text-green-700 mt-2">
                          {metadata?.columns?.length || 0} total columns detected
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg shadow-sm p-5 border border-purple-100">
                        <h3 className="text-lg font-medium text-purple-800 mb-1">Unique Values</h3>
                        <div className="flex items-end">
                          {stats && stats.columns ? (
                            <div className="w-full">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-purple-800">Most Unique</span>
                                <span className="text-sm text-purple-800">
                                  {stats.columns.reduce((max: number, col: any) => Math.max(max, col.unique), 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-purple-700">
                                  {stats.columns.reduce((prev: any, current: any) => 
                                    (prev.unique > current.unique) ? prev : current, { unique: 0 }
                                  ).name}
                                </span>
                                <span className="text-xs text-purple-700">values</span>
                              </div>
                            </div>
                          ) : '—'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {summaryCharts.map((chart: any) => (
                        <div 
                          key={chart.id}
                          className={`bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
                            expandedCard === chart.id ? 'md:col-span-2' : ''
                          }`}
                        >
                          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center">
                              {chart.icon}
                              <h3 className="ml-2 font-medium text-gray-900">{chart.title}</h3>
                              <span className="ml-2 text-xs text-gray-500">{chart.description}</span>
                            </div>
                            <div className="flex space-x-1">
                              <button 
                                onClick={() => toggleCardExpansion(chart.id)}
                                className="p-1 rounded hover:bg-gray-100"
                                title={expandedCard === chart.id ? "Collapse" : "Expand"}
                              >
                                <ArrowsPointingOutIcon className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <Plot
                              data={chart.plot.data}
                              layout={{
                                ...chart.plot.layout,
                                autosize: true,
                                height: expandedCard === chart.id ? 400 : chart.plot.layout.height,
                                margin: chart.plot.layout.margin,
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                font: {
                                  family: 'Inter, system-ui, sans-serif'
                                }
                              }}
                              config={{ 
                                responsive: true,
                                displayModeBar: expandedCard === chart.id,
                                displaylogo: false,
                                modeBarButtonsToRemove: ['lasso2d', 'select2d', 'sendDataToCloud']
                              }}
                              style={{ width: '100%', height: '100%' }}
                            />
                          </div>
                        </div>
                      ))}
                      
                      {/* Action Cards */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm p-5 border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Recommendations</h3>
                        <ul className="space-y-3">
                          {stats && stats.columns && stats.columns.some((col: any) => col.missing_pct > 20) && (
                            <li className="flex items-start">
                              <div className="flex-shrink-0 p-1 bg-yellow-100 rounded-full">
                                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-gray-700">
                                  Consider handling missing values in{' '}
                                  <span className="font-medium">{stats.columns.filter((col: any) => col.missing_pct > 20)[0].name}</span>
                                </p>
                              </div>
                            </li>
                          )}
                          
                          {stats && stats.columns && stats.columns.filter((col: any) => col.dtype.includes('int') || col.dtype.includes('float')).length >= 2 && (
                            <li className="flex items-start">
                              <div className="flex-shrink-0 p-1 bg-blue-100 rounded-full">
                                <ArrowsRightLeftIcon className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-gray-700">
                                  Explore correlations between numerical columns
                                </p>
                                <button 
                                  onClick={() => setActiveTab('correlation')}
                                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Go to correlation analysis →
                                </button>
                              </div>
                            </li>
                          )}
                          
                          <li className="flex items-start">
                            <div className="flex-shrink-0 p-1 bg-green-100 rounded-full">
                              <DocumentChartBarIcon className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-gray-700">
                                Create visualizations for specific columns
                              </p>
                              <button 
                                onClick={() => setActiveTab('visualizations')}
                                className="mt-1 text-xs text-green-600 hover:text-green-800"
                              >
                                Go to visualization builder →
                              </button>
                            </div>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Quick Stats</h3>
                        <div className="space-y-3">
                          {stats && stats.columns && (
                            <>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Columns with most missing values</h4>
                                <div className="space-y-1">
                                  {stats.columns
                                    .filter((col: any) => col.missing > 0)
                                    .sort((a: any, b: any) => b.missing_pct - a.missing_pct)
                                    .slice(0, 3)
                                    .map((col: any) => (
                                      <div key={col.name} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-800">{col.name}</span>
                                        <div className="flex items-center">
                                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                            <div 
                                              className={`h-2 rounded-full ${
                                                col.missing_pct > 50 ? 'bg-red-500' : 
                                                col.missing_pct > 20 ? 'bg-yellow-500' : 'bg-blue-500'
                                              }`}
                                              style={{ width: `${col.missing_pct}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-gray-500 text-xs w-10 text-right">{col.missing_pct.toFixed(1)}%</span>
                                        </div>
                                      </div>
                                    ))
                                  }
                                  {stats.columns.filter((col: any) => col.missing > 0).length === 0 && (
                                    <p className="text-sm text-gray-500">No missing values found</p>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Columns with highest uniqueness</h4>
                                <div className="space-y-1">
                                  {stats.columns
                                    .sort((a: any, b: any) => 
                                      (b.unique / fileDetails.row_count) - (a.unique / fileDetails.row_count)
                                    )
                                    .slice(0, 3)
                                    .map((col: any) => (
                                      <div key={col.name} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-800">{col.name}</span>
                                        <div className="flex items-center">
                                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                            <div 
                                              className="bg-purple-500 h-2 rounded-full"
                                              style={{ width: `${(col.unique / fileDetails.row_count) * 100}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-gray-500 text-xs w-10 text-right">
                                            {Math.round((col.unique / fileDetails.row_count) * 100)}%
                                          </span>
                                        </div>
                                      </div>
                                    ))
                                  }
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {activeTab === 'data' && (
              <div className="p-6">
                <DataPreview />
              </div>
            )}
            
            {activeTab === 'visualizations' && (
              <div className="p-6">
                <ColumnVisualizations />
              </div>
            )}
            
            {activeTab === 'correlation' && (
              <div className="p-6">
                <CorrelationAnalysis />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center text-red-600 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-medium">Delete File</h3>
            </div>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete <span className="font-medium">{fileDetails.filename}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                disabled={deleteInProgress}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={deleteInProgress}
              >
                {deleteInProgress ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 