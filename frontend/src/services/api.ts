import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with retry configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for logging
api.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    // Create a more user-friendly error message
    const errorMessage = getErrorMessage(error);
    console.error('API Response Error:', errorMessage, error);
    
    // Attach user-friendly message to error
    if (error.response) {
      (error as any).userMessage = errorMessage;
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get a user-friendly error message
const getErrorMessage = (error: AxiosError): string => {
  if (error.message === 'Network Error') {
    return 'Cannot connect to the server. Please check if the backend is running (port 8000).';
  }
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    if (status === 404) {
      return 'The requested resource was not found.';
    } else if (status === 500) {
      return 'Server error. Please try again later.';
    } else {
      return `Error: ${error.response.data.detail || error.message}`;
    }
  }
  
  if (error.request) {
    // Request was made but no response received
    return 'No response from server. Please check your connection.';
  }
  
  // Something else caused the error
  return error.message || 'An unknown error occurred';
};

export interface FileInfo {
  file_id: string;
  filename: string;
  upload_time: string;
  size: string;
  column_count: number;
  row_count: number;
}

export interface CSVMetadata extends FileInfo {
  columns: string[];
  dtypes: Record<string, string>;
  preview: Record<string, any>[];
}

export interface ColumnStat {
  name: string;
  dtype: string;
  count: number;
  missing: number;
  missing_pct: number;
  unique: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
}

export interface FileStats {
  file_id: string;
  columns: ColumnStat[];
}

export interface Visualization {
  [key: string]: any;
}

export interface CorrelationData {
  correlations: {
    x: string;
    y: string;
    correlation: number;
  }[];
  visualization: any;
  columns: string[];
}

/**
 * Generic API request function with retry logic
 */
const apiRequest = async <T>(request: () => Promise<T>, retries = 2): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    if (retries > 0 && axios.isAxiosError(error) && (error.message === 'Network Error' || error.code === 'ECONNABORTED')) {
      console.log(`Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return apiRequest(request, retries - 1);
    }
    throw error;
  }
};

// File upload
export const uploadCSV = async (file: File): Promise<FileInfo> => {
  return apiRequest(async () => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  });
};

// Get list of uploaded files
export const getUploadedFiles = async (): Promise<FileInfo[]> => {
  return apiRequest(async () => {
    const response = await api.get('/files');
    return response.data;
  });
};

// Get file metadata
export const getFileMetadata = async (fileId: string): Promise<CSVMetadata> => {
  return apiRequest(async () => {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  });
};

// Get file statistics
export const getFileStats = async (fileId: string): Promise<FileStats> => {
  return apiRequest(async () => {
    const response = await api.get(`/files/${fileId}/stats`);
    return response.data;
  });
};

// Get column visualization
export const getColumnVisualization = async (fileId: string, column: string): Promise<Visualization> => {
  return apiRequest(async () => {
    const response = await api.get(`/files/${fileId}/visualizations/${column}`);
    return response.data;
  });
};

// Get correlation data
export const getCorrelation = async (fileId: string): Promise<CorrelationData> => {
  return apiRequest(async () => {
    if (!fileId) {
      throw new Error('File ID is required for correlation analysis');
    }
    
    // Log the request URL for debugging
    const requestUrl = `${API_URL}/files/${fileId}/correlation`;
    console.log(`Making correlation request to: ${requestUrl}`);
    
    try {
      const response = await api.get(requestUrl);
      return response.data;
    } catch (error) {
      console.error(`Correlation request failed for file ID: ${fileId}`, error);
      throw error;
    }
  });
};

// Delete CSV file
export const deleteCSVFile = async (fileId: string): Promise<void> => {
  return apiRequest(async () => {
    if (!fileId) {
      throw new Error('File ID is required for deletion');
    }
    
    const requestUrl = `${API_URL}/files/${fileId}`;
    console.log(`Deleting file: ${requestUrl}`);
    
    try {
      await api.delete(requestUrl);
      return;
    } catch (error) {
      console.error(`Delete request failed for file ID: ${fileId}`, error);
      throw error;
    }
  });
};

export default api; 