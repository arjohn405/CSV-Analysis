'use client';

import { useState, useEffect } from 'react';
import { useCSV } from '@/context/CSVContext';
import { getCorrelation, CorrelationData } from '@/services/api';
import dynamic from 'next/dynamic';
import { 
  ArrowsPointingOutIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';

// Import plotly dynamically to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function CorrelationAnalysis() {
  const { selectedFileId } = useCSV();
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>([]);

  useEffect(() => {
    if (selectedFileId) {
      fetchCorrelationData(selectedFileId);
    } else {
      setCorrelationData(null);
    }
  }, [selectedFileId]);

  const fetchCorrelationData = async (fileId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCorrelation(fileId);
      setCorrelationData(data);
      
      // Extract insights from the correlation data
      if (data && data.correlations) {
        setInsights(findInsights(data.correlations));
      }
    } catch (err: any) {
      console.error('Error fetching correlation data:', err);
      const errorMessage = err.userMessage || 
        'Failed to load correlation data. Please ensure the backend server is running.';
      setError(errorMessage);
      setCorrelationData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedFileId) {
      fetchCorrelationData(selectedFileId);
    }
  };

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  };

  // Find insights from correlation data
  const findInsights = (correlations: any[]) => {
    if (!correlations) return [];
    
    const insights = [];
    
    // Filter out self-correlations and get absolute values
    const filteredCorrelations = correlations
      .filter(c => c.x !== c.y)
      .map(c => ({...c, absCorrelation: Math.abs(c.correlation)}));
    
    // Find strong correlations (positive and negative)
    const strongPositiveCorrelations = filteredCorrelations
      .filter(c => c.correlation > 0.7)
      .sort((a, b) => b.correlation - a.correlation)
      .slice(0, 3);
      
    const strongNegativeCorrelations = filteredCorrelations
      .filter(c => c.correlation < -0.7)
      .sort((a, b) => a.correlation - b.correlation)
      .slice(0, 3);
    
    // Add insights for strong positive correlations
    if (strongPositiveCorrelations.length > 0) {
      insights.push({
        type: 'positive',
        title: 'Strong Positive Correlations',
        description: 'These variables tend to increase together:',
        correlations: strongPositiveCorrelations
      });
    }
    
    // Add insights for strong negative correlations
    if (strongNegativeCorrelations.length > 0) {
      insights.push({
        type: 'negative',
        title: 'Strong Negative Correlations', 
        description: 'As one variable increases, the other tends to decrease:',
        correlations: strongNegativeCorrelations
      });
    }
    
    // Find variables with no strong correlations
    const weaklyCorrelatedVars = new Set<string>();
    
    // Extract all unique column names
    const allColumns = new Set<string>();
    correlations.forEach(c => {
      allColumns.add(c.x);
      allColumns.add(c.y);
    });
    
    // Check each column to see if it has any strong correlations
    allColumns.forEach(columnName => {
      const hasStrongCorrelation = filteredCorrelations
        .some(c => (c.x === columnName || c.y === columnName) && Math.abs(c.correlation) > 0.4);
      
      if (!hasStrongCorrelation) {
        weaklyCorrelatedVars.add(columnName);
      }
    });
    
    if (weaklyCorrelatedVars.size > 0) {
      insights.push({
        type: 'weak',
        title: 'Independent Variables',
        description: 'These variables show little correlation with others:',
        variables: Array.from(weaklyCorrelatedVars)
      });
    }
    
    return insights;
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
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Correlation Data</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchCorrelationData}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!correlationData) {
    return null;
  }

  if (correlationData.message) {
    return (
      <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 p-4 rounded-md flex items-start">
        <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Correlation Analysis Unavailable</h3>
          <p className="text-sm mt-1">{correlationData.message}</p>
          <p className="text-sm mt-1">Try uploading a CSV file with at least two numerical columns.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${fullScreen ? 'fixed inset-0 bg-white p-4 z-50 overflow-auto' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Correlation Analysis</h2>
          <p className="text-sm text-gray-500 mt-1">
            Explore relationships between numerical variables
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRefresh} 
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Refresh correlation analysis"
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
      
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="border-b border-gray-100 p-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Correlation Heatmap</h3>
          <div className="flex items-center">
            <div className="group relative">
              <button className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                <QuestionMarkCircleIcon className="h-5 w-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-72 rounded-lg bg-gray-800 text-white text-xs px-3 py-2 shadow-lg hidden group-hover:block z-10">
                This heatmap shows the Pearson correlation coefficients between numerical columns. 
                Values range from -1 (perfect negative correlation) to +1 (perfect positive correlation),
                with 0 indicating no linear correlation. Hover over cells to see exact values.
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <Plot
              data={correlationData.visualization.data}
              layout={{
                ...correlationData.visualization.layout,
                autosize: true,
                height: 500,
                margin: { l: 80, r: 20, t: 30, b: 80 }
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
          
          <div className="mt-2 text-center">
            <div className="inline-flex items-center justify-center space-x-1 mt-2">
              <div className="h-3 w-4 bg-blue-700"></div>
              <div className="h-3 w-4 bg-blue-500"></div>
              <div className="h-3 w-4 bg-blue-300"></div>
              <div className="h-3 w-4 bg-gray-200"></div>
              <div className="h-3 w-4 bg-red-300"></div>
              <div className="h-3 w-4 bg-red-500"></div>
              <div className="h-3 w-4 bg-red-700"></div>
            </div>
            <div className="flex items-center justify-center text-xs text-gray-500 mt-1">
              <span>-1</span>
              <div className="mx-2 flex-1"></div>
              <span>0</span>
              <div className="mx-2 flex-1"></div>
              <span>+1</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Correlation Insights */}
      {insights.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, idx) => (
              <div 
                key={idx} 
                className={`border rounded-lg overflow-hidden shadow-sm ${
                  insight.type === 'positive' 
                    ? 'border-green-100 bg-green-50' 
                    : insight.type === 'negative'
                      ? 'border-red-100 bg-red-50'
                      : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className={`border-b px-4 py-3 ${
                  insight.type === 'positive' 
                    ? 'border-green-100 bg-green-100/60' 
                    : insight.type === 'negative'
                      ? 'border-red-100 bg-red-100/60'
                      : 'border-gray-100 bg-gray-100/60'
                }`}>
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  
                  {insight.correlations && (
                    <div className="space-y-2">
                      {insight.correlations.map((corr, i) => (
                        <div key={i} className="bg-white rounded-md border border-gray-100 p-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{corr.x} ↔ {corr.y}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              corr.correlation > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {corr.correlation.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {insight.variables && (
                    <div className="flex flex-wrap gap-2">
                      {insight.variables.map((variable, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {variable}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Table of Strong Correlations */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <ChartBarSquareIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Strongest Correlations</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Column 1
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Column 2
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correlation
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strength
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relationship
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {correlationData.correlations
                .filter(c => c.x !== c.y) // Remove self-correlations
                .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)) // Sort by absolute value
                .slice(0, 8) // Take top 8
                .map((corr, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {corr.x}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {corr.y}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`font-medium ${
                        corr.correlation > 0.2 
                          ? 'text-green-600' 
                          : corr.correlation < -0.2 
                            ? 'text-red-600' 
                            : 'text-gray-500'
                      }`}>
                        {corr.correlation.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          Math.abs(corr.correlation) > 0.7
                            ? 'bg-blue-100 text-blue-800'
                            : Math.abs(corr.correlation) > 0.4
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {Math.abs(corr.correlation) > 0.7
                          ? 'Strong'
                          : Math.abs(corr.correlation) > 0.4
                          ? 'Moderate'
                          : 'Weak'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {corr.correlation > 0 
                        ? 'When one increases, the other increases' 
                        : 'When one increases, the other decreases'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      
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