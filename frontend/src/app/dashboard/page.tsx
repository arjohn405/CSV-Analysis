'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import { useCSV } from '@/context/CSVContext';
import DynamicTable, { ColumnDefinition } from '@/components/DynamicTable';
import { 
  ChartBarIcon, 
  UserCircleIcon,
  HomeIcon,
  ArrowLeftOnRectangleIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowTrendingUpIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { files, loading, error, selectFile } = useCSV();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('User');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'grid' | 'table'>('table');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState('csv-files');

  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
    
    // For demo: set a random user name 
    const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'];
    setUserName(names[Math.floor(Math.random() * names.length)]);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  const navigateToCSVDetail = (fileId: string) => {
    selectFile(fileId);
    router.push(`/csv/${fileId}`);
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

  // Format file size in a human-readable format (KB, MB, etc.)
  const formatFileSize = (size: string) => {
    // If size is already formatted, return it
    if (size.includes('KB') || size.includes('MB') || size.includes('GB')) {
      return size;
    }
    
    // Otherwise, try to parse it and format
    try {
      const bytes = parseInt(size);
      if (isNaN(bytes)) return size;
      
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } catch (e) {
      return size;
    }
  };

  // Define table columns for the CSV files
  const fileColumns: ColumnDefinition<any>[] = [
    {
      id: 'filename',
      header: 'File Name',
      accessor: (file) => (
        <div className="flex items-center">
          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
          <span className="font-medium text-gray-900">{file.filename}</span>
        </div>
      ),
      sortable: true,
      minWidth: 200,
      priority: 10, // Highest priority - always show
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (file) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Ready
        </span>
      ),
      width: 120,
      priority: 5,
    },
    {
      id: 'row_count',
      header: 'Rows',
      accessor: (file) => file.row_count.toLocaleString(),
      sortable: true,
      width: 100,
      priority: 7,
    },
    {
      id: 'column_count',
      header: 'Columns',
      accessor: (file) => file.column_count,
      sortable: true,
      width: 100,
      priority: 6,
    },
    {
      id: 'size',
      header: 'Size',
      accessor: (file) => formatFileSize(file.size),
      sortable: true,
      width: 100,
      priority: 4,
    },
    {
      id: 'upload_time',
      header: 'Upload Date',
      accessor: (file) => (
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
          <span>{formatDate(file.upload_time)}</span>
        </div>
      ),
      sortable: true,
      width: 180,
      priority: 3,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (file) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateToCSVDetail(file.file_id);
          }}
          className="text-blue-600 hover:text-blue-900 flex items-center"
        >
          View
          <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
        </button>
      ),
      width: 100,
      priority: 9, // High priority - important for user interaction
    },
  ];

  // Navigation items for the sidebar
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon, coming: false },
    { id: 'csv-files', name: 'CSV Files', icon: DocumentTextIcon, coming: false },
    { id: 'visualizations', name: 'Visualizations', icon: ChartPieIcon, coming: true },
    { id: 'reports', name: 'Reports', icon: DocumentChartBarIcon, coming: true },
    { id: 'insights', name: 'Insights', icon: ArrowTrendingUpIcon, coming: true },
    { id: 'trends', name: 'Trend Analysis', icon: PresentationChartLineIcon, coming: true },
  ];

  const secondaryNavigation = [
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
    { id: 'help', name: 'Help & Support', icon: QuestionMarkCircleIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for larger screens */}
      <div className={`${sidebarOpen ? 'lg:block' : 'lg:hidden'} hidden lg:w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-20`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-lg font-bold text-gray-900">CSV Analytics</h1>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-1 flex-1 px-2 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveNavItem(item.id)}
                  className={`${
                    activeNavItem === item.id 
                      ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full relative`}
                  disabled={item.coming}
                >
                  <item.icon 
                    className={`${
                      activeNavItem === item.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-5 w-5`} 
                  />
                  {item.name}
                  {item.coming && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </nav>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <nav className="px-2 space-y-1">
                {secondaryNavigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveNavItem(item.id)}
                    className={`${
                      activeNavItem === item.id 
                        ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                  >
                    <item.icon 
                      className={`${
                        activeNavItem === item.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-5 w-5`} 
                    />
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          <div className="px-2 mb-2">
            <div className="flex items-center p-2 rounded-lg bg-gray-50">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div className="ml-2 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center mt-0.5"
                >
                  <ArrowLeftOnRectangleIcon className="h-3 w-3 mr-1" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-lg font-bold text-gray-900">CSV Analytics</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNavItem(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`${
                      activeNavItem === item.id 
                        ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-base font-medium rounded-md w-full relative`}
                    disabled={item.coming}
                  >
                    <item.icon 
                      className={`${
                        activeNavItem === item.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`} 
                    />
                    {item.name}
                    {item.coming && (
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                        Soon
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <nav className="px-2 space-y-1">
                {secondaryNavigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNavItem(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`${
                      activeNavItem === item.id 
                        ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-base font-medium rounded-md w-full`}
                  >
                    <item.icon 
                      className={`${
                        activeNavItem === item.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`} 
                    />
                    {item.name}
                  </button>
                ))}
              </nav>
              
              <div className="px-2 mt-3 mb-3">
                <div className="flex items-center p-3 rounded-lg bg-gray-50">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-900">{userName}</p>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center mt-1"
                    >
                      <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-1" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`flex flex-col flex-1 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-1 text-gray-500 focus:outline-none"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                
                <div className="ml-3 lg:hidden flex items-center">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  <h1 className="ml-1 text-lg font-bold text-gray-900">CSV Analytics</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Upload CSV
                </button>
                
                <div className="relative lg:hidden">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
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
          <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h2 className="text-lg font-medium">CSV File Management</h2>
                  </div>
                  <div className="flex space-x-2">
                    <div className="bg-gray-100 p-0.5 rounded-lg flex items-center shadow-sm">
                      <button
                        onClick={() => setSelectedView('grid')}
                        className={`flex items-center justify-center p-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          selectedView === 'grid' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        style={{ minWidth: '36px', height: '36px' }}
                        title="Grid view"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedView('table')}
                        className={`flex items-center justify-center p-2 text-sm font-medium rounded-md transition-all duration-200 ${
                          selectedView === 'table' 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        style={{ minWidth: '36px', height: '36px' }}
                        title="Table view"
                      >
                        <TableCellsIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-md flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    <p>Error loading files: {error}</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-10 text-center">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No CSV files</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by uploading your first CSV file.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Upload CSV
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedView === 'table' ? (
                      <DynamicTable
                        data={files}
                        columns={fileColumns}
                        onRowClick={(file) => navigateToCSVDetail(file.file_id)}
                        isLoading={loading}
                        emptyMessage={
                          <div className="py-10 text-center">
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No CSV files</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first CSV file.</p>
                            <div className="mt-6">
                              <button
                                onClick={() => setShowUploadModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                              >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Upload CSV
                              </button>
                            </div>
                          </div>
                        }
                        initialSortConfig={{ key: 'upload_time', direction: 'desc' }}
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file) => (
                          <div 
                            key={file.file_id} 
                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center overflow-hidden">
                                  <DocumentTextIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                                  <div className="truncate text-sm font-medium text-gray-900">{file.filename}</div>
                                </div>
                                <span className="flex-shrink-0 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                                  Ready
                                </span>
                              </div>
                            </div>
                            <div className="px-4 py-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Rows</p>
                                  <p className="font-medium">{file.row_count.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Columns</p>
                                  <p className="font-medium">{file.column_count}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Size</p>
                                  <p className="font-medium">{file.size}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Upload Date</p>
                                  <p className="font-medium text-xs">{formatDate(file.upload_time)}</p>
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => navigateToCSVDetail(file.file_id)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                >
                                  View Details
                                  <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Upload CSV File</h3>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FileUpload onSuccess={() => setShowUploadModal(false)} />
            </div>
          </div>
        )}

        <footer className="bg-white border-t border-gray-200">
          <div className="py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              CSV Analytics Dashboard • Built with Next.js and FastAPI
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
} 