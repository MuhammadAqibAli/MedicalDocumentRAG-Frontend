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

  // Audit Questions endpoints
  fetchAuditQuestions: (policyName?: string) =>
    apiClient.get('/audit-questions/', {
      params: policyName ? { policy_name: policyName } : {}
    }),

  generateAuditQuestions: (data: { ai_model: string, policy_name: string, number_of_questions: number }) =>
    apiClient.post('/audit-questions/generate/', data, {
      timeout: API_CONFIG.timeout.generate
    }),

  updateAuditQuestion: (questionId: string, data: { question_text?: string, policy_name?: string, options?: string[] }) =>
    apiClient.put(`/audit-questions/${questionId}/`, data),

  deleteAuditQuestion: (questionId: string) =>
    apiClient.delete(`/audit-questions/${questionId}/delete/`),

  // Complaint endpoints
  fetchComplaints: () =>
    apiClient.get('/complaints/'),

  fetchComplaintById: (complaintId: string) =>
    apiClient.get(`/complaints/${complaintId}/`),

  createComplaint: (formData: FormData) =>
    apiClient.post('/complaints/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: API_CONFIG.timeout.upload
    }),

  updateComplaint: (complaintId: string, formData: FormData) =>
    apiClient.patch(`/complaints/${complaintId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: API_CONFIG.timeout.upload
    }),

  downloadComplaintFile: (complaintId: string) =>
    apiClient.get(`/complaints/${complaintId}/download-file/`, {
      responseType: 'blob'
    }),

  deleteComplaint: (complaintId: string) =>
    apiClient.delete(`/complaints/${complaintId}/`),

  // Feedback endpoints
  fetchFeedbacks: (page = 1, filters = {}) =>
    apiClient.get('/feedback/', {
      params: { page, ...filters }
    }),

  getFeedback: (id: string) =>
    apiClient.get(`/feedback/${id}/`),

  createFeedback: (formData: FormData) =>
    apiClient.post('/feedback/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updateFeedback: (id: string, formData: FormData) =>
    apiClient.put(`/feedback/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  deleteFeedback: (id: string) =>
    apiClient.delete(`/feedback/${id}/`),

  removeFeedbackAttachment: (feedbackId: string, attachmentId: string) =>
    apiClient.delete(`/feedback/${feedbackId}/remove_attachment/?attachment_id=${attachmentId}`),

  fetchPractices: () =>
    apiClient.get('/practices/'),

  fetchFeedbackMethods: () =>
    apiClient.get('/feedback-methods/'),

  fetchUsers: () =>
    apiClient.get('/users/'),

  // Enhanced Chatbot endpoints - Production ready
  chatbotMessage: (data: {
    message: string;
    session_id?: string;
    user_context?: { user_id?: string };
  }) =>
    apiClient.post('/chatbot/message/', data, {
      timeout: API_CONFIG.timeout.generate,
      headers: {
        'Content-Type': 'application/json',
      }
    }),

  chatbotIntentDetect: (data: {
    message: string;
  }) =>
    apiClient.post('/chatbot/intent-detect/', data, {
      timeout: API_CONFIG.timeout.default
    }),

  chatbotHandleIntent: (data: {
    intent_type: string;
    session_id?: string;
    parameters?: Record<string, any>;
  }) =>
    apiClient.post('/chatbot/handle-intent/', data, {
      timeout: API_CONFIG.timeout.generate
    }),

  chatbotQuickActions: () =>
    apiClient.get('/chatbot/quick-actions/', {
      timeout: API_CONFIG.timeout.default
    }),

  chatbotHealth: () =>
    apiClient.get('/chatbot/health/', {
      timeout: 5000 // Quick health check
    }),

  // Conversation management
  chatbotConversations: (params?: { limit?: number; offset?: number }) =>
    apiClient.get('/chatbot/conversations/', {
      params,
      timeout: API_CONFIG.timeout.default
    }),

  chatbotGetConversation: (id: string) =>
    apiClient.get(`/chatbot/conversations/${id}/`, {
      timeout: API_CONFIG.timeout.default
    }),

  chatbotCompleteConversation: (id: string) =>
    apiClient.post(`/chatbot/conversations/${id}/complete/`, {}, {
      timeout: API_CONFIG.timeout.default
    }),

  // File upload for chatbot
  chatbotUploadFile: (file: File, metadata?: Record<string, any>) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return apiClient.post('/chatbot/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: API_CONFIG.timeout.upload,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`Upload Progress: ${percentCompleted}%`);
      }
    });
  },
};

export default apiService;



