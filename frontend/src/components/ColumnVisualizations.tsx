'use client';

import { useState, useEffect } from 'react';
import { useCSV } from '@/context/CSVContext';
import { getFileMetadata, getColumnVisualization, CSVMetadata } from '@/services/api';
import dynamic from 'next/dynamic';
import { 
  ArrowsPointingOutIcon, 
  ChartBarIcon, 
  ChartPieIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

// Import plotly dynamically to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ColumnVisualizations() {
  const { selectedFileId } = useCSV();
  const [metadata, setMetadata] = useState<CSVMetadata | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [visualizations, setVisualizations] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!selectedFileId) return;
      
      try {
        setLoading(true);
        setError(null);
        const result = await getFileMetadata(selectedFileId);
        setMetadata(result);
        
        // Auto-select the first numerical column
        const numericalColumns = Object.entries(result.dtypes)
          .filter(([_, type]) => type.includes('int') || type.includes('float'))
          .map(([col, _]) => col);
        
        if (numericalColumns.length > 0) {
          setSelectedColumn(numericalColumns[0]);
        } else if (result.columns.length > 0) {
          setSelectedColumn(result.columns[0]);
        }
      } catch (err: any) {
        console.error('Error fetching metadata:', err);
        const errorMessage = err.userMessage || 
          'Failed to load file metadata. Please check if the backend server is running.';
        setError(errorMessage);
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetadata();
  }, [selectedFileId]);

  useEffect(() => {
    if (selectedFileId && selectedColumn) {
      fetchVisualizations(selectedFileId, selectedColumn);
    } else {
      setVisualizations(null);
    }
  }, [selectedFileId, selectedColumn]);

  const fetchVisualizations = async (fileId: string, column: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getColumnVisualization(fileId, column);
      setVisualizations(data);
    } catch (err: any) {
      console.error('Error loading visualizations:', err);
      const errorMessage = err.userMessage || 
        'Failed to load column visualization. Please check if the backend server is running.';
      setError(errorMessage);
      setVisualizations(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedFileId && selectedColumn) {
      fetchVisualizations(selectedFileId, selectedColumn);
    }
  };

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  };

  if (loading && !visualizations && !metadata) {
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
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Visualization Data</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metadata || !selectedColumn) {
    return null;
  }

  const isNumerical = metadata.dtypes[selectedColumn]?.includes('int') || 
                      metadata.dtypes[selectedColumn]?.includes('float');

  // Classification of different column types for better visualization guidance
  const getColumnTypeInfo = () => {
    if (isNumerical) {
      return {
        type: 'numerical',
        icon: <ChartBarIcon className="h-5 w-5 text-blue-500" />,
        label: 'Numerical Data',
        description: 'This column contains numerical values. Histograms and box plots are available.'
      };
    } else {
      const uniqueCount = visualizations?.barplot?.data[0]?.x?.length || 0;
      if (uniqueCount > 15) {
        return {
          type: 'high-cardinality',
          icon: <ChartPieIcon className="h-5 w-5 text-orange-500" />,
          label: 'High Cardinality',
          description: `This column has ${uniqueCount} unique values, which is high. Consider using a different column for clearer visualizations.`
        };
      } else {
        return {
          type: 'categorical',
          icon: <ChartPieIcon className="h-5 w-5 text-green-500" />,
          label: 'Categorical Data',
          description: 'This column contains categorical values. Bar chart distribution is available.'
        };
      }
    }
  };

  const columnTypeInfo = getColumnTypeInfo();

  return (
    <div className={`${fullScreen ? 'fixed inset-0 bg-white p-4 z-50 overflow-auto' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Column Visualizations</h2>
          <p className="text-sm text-gray-500 mt-1">
            Explore and analyze data in each column
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRefresh} 
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Refresh visualization"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <button 
            onClick={toggleFullScreen} 
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title={fullScreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <label htmlFor="column-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select column to visualize:
          </label>
          <div className="relative">
            <select
              id="column-select"
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {metadata.columns.map((column) => (
                <option key={column} value={column}>
                  {column} ({metadata.dtypes[column].replace('64', '')})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChartBarIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 flex items-start flex-shrink-0 md:w-72">
          {columnTypeInfo.icon}
          <div className="ml-2">
            <h4 className="text-sm font-medium text-gray-900">{columnTypeInfo.label}</h4>
            <p className="text-xs text-gray-500">{columnTypeInfo.description}</p>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="animate-pulse">
          <div className="h-80 bg-gray-100 rounded-lg w-full"></div>
        </div>
      )}
      
      {!loading && visualizations && (
        <div className="space-y-8">
          {isNumerical ? (
            <>
              {visualizations.histogram && (
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                  <div className="border-b border-gray-100 p-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Histogram</h3>
                    <div className="flex items-center">
                      <div className="group relative">
                        <button className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                          <QuestionMarkCircleIcon className="h-5 w-5" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg bg-gray-800 text-white text-xs px-3 py-2 shadow-lg hidden group-hover:block z-10">
                          A histogram shows the distribution of values in a numerical column, grouped into bins. 
                          The x-axis represents the value ranges and the y-axis shows the frequency (count) of values.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <Plot
                      data={visualizations.histogram.data}
                      layout={{
                        ...visualizations.histogram.layout,
                        autosize: true,
                        height: 400,
                        margin: { l: 50, r: 20, t: 30, b: 50 },
                        modebar: { orientation: 'v' },
                        xaxis: {
                          ...visualizations.histogram.layout.xaxis,
                          title: selectedColumn
                        },
                        yaxis: {
                          ...visualizations.histogram.layout.yaxis,
                          title: 'Frequency'
                        }
                      }}
                      config={{ 
                        responsive: true,
                        displayModeBar: true,
                        displaylogo: false,
                        modeBarButtonsToRemove: ['lasso2d', 'select2d', 'sendDataToCloud']
                      }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              )}
              
              {visualizations.boxplot && (
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                  <div className="border-b border-gray-100 p-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Box Plot</h3>
                    <div className="flex items-center">
                      <div className="group relative">
                        <button className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                          <QuestionMarkCircleIcon className="h-5 w-5" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg bg-gray-800 text-white text-xs px-3 py-2 shadow-lg hidden group-hover:block z-10">
                          A box plot shows the distribution of a numerical column with a box showing the quartiles (25%, median, 75%) 
                          and whiskers extending to the min/max values (excluding outliers). Outliers are shown as individual points.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <Plot
                      data={visualizations.boxplot.data}
                      layout={{
                        ...visualizations.boxplot.layout,
                        autosize: true,
                        height: 400,
                        margin: { l: 50, r: 20, t: 30, b: 50 },
                        xaxis: {
                          title: '',
                          zeroline: false
                        },
                        yaxis: {
                          ...visualizations.boxplot.layout.yaxis,
                          title: selectedColumn
                        }
                      }}
                      config={{ 
                        responsive: true,
                        displayModeBar: true,
                        displaylogo: false,
                        modeBarButtonsToRemove: ['lasso2d', 'select2d', 'sendDataToCloud']
                      }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {visualizations.barplot && (
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                  <div className="border-b border-gray-100 p-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Category Distribution</h3>
                    <div className="flex items-center">
                      <div className="group relative">
                        <button className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                          <QuestionMarkCircleIcon className="h-5 w-5" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg bg-gray-800 text-white text-xs px-3 py-2 shadow-lg hidden group-hover:block z-10">
                          This bar chart shows the distribution of categories in this column. 
                          The x-axis shows each unique value and the y-axis shows how many times each value appears in the dataset.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <Plot
                      data={visualizations.barplot.data}
                      layout={{
                        ...visualizations.barplot.layout,
                        autosize: true,
                        height: 400,
                        margin: { l: 50, r: 20, t: 30, b: 100 },
                        xaxis: {
                          ...visualizations.barplot.layout.xaxis,
                          title: selectedColumn,
                          tickangle: visualizations.barplot.data[0].x.length > 5 ? -45 : 0
                        },
                        yaxis: {
                          ...visualizations.barplot.layout.yaxis,
                          title: 'Count'
                        }
                      }}
                      config={{ 
                        responsive: true,
                        displayModeBar: true,
                        displaylogo: false,
                        modeBarButtonsToRemove: ['lasso2d', 'select2d', 'sendDataToCloud']
                      }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {fullScreen && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={toggleFullScreen}
            className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg flex items-center"
          >
            <ArrowsPointingOutIcon className="h-5 w-5 mr-2" />
            Exit Fullscreen
          </button>
        </div>
      )}
    </div>
  );
} 