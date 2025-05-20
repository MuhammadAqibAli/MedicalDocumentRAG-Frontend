import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from './config';

// Create a configured axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout.default,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Standardized error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Document endpoints
  uploadDocument: (formData: FormData) => 
    apiClient.post('/documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: API_CONFIG.timeout.upload
    }),
  
  fetchDocuments: () => 
    apiClient.get('/documents/'),
  
  downloadDocument: (id: string) => 
    apiClient.get(`/documents/${id}/download/`, {
      responseType: 'blob'
    }),
  
  deleteDocument: (id: string) => 
    apiClient.delete(`/documents/${id}/`),
  
  // Content generation endpoints
  generateContent: (data: { topic: string, content_type: string, model_name: string }) => 
    apiClient.post('/generate/', data, {
      timeout: API_CONFIG.timeout.generate
    }),
  
  fetchGeneratedContents: (page = 1, filters = {}) => 
    apiClient.get('/generated-contents/', { 
      params: { page, ...filters } 
    }),
  
  fetchGeneratedContentById: (id: string) => 
    apiClient.get(`/generated-contents/${id}/`),
  
  // Models and standards endpoints
  fetchModels: () => 
    apiClient.get('/models/'),
  
  fetchStandardTypes: () => 
    apiClient.get('/standard-types/'),
  
  fetchStandards: (standardTypeId?: string) => 
    apiClient.get(`/standards/${standardTypeId ? `?standard_type_id=${standardTypeId}` : ''}`),
  
  saveStandard: (data: any) => 
    apiClient.post('/standards/', data),
  
  compareStandards: (data: { content1: string, content2: string, standard_type_id: string }) => 
    apiClient.post('/standards/compare/', data),
};

export default apiService;


