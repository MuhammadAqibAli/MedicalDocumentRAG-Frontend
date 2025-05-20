// Central configuration file for the application

// API configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  timeout: {
    default: 30000,  // 30 seconds
    upload: 120000,  // 2 minutes
    generate: 180000 // 3 minutes
  }
};

// Other configuration settings can be added here
export const APP_CONFIG = {
  appName: 'Medical Assistant',
  version: '1.0.0'
};
