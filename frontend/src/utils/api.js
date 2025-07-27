import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Firebase auth
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Failed to get auth token:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Log detailed error info for debugging
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
      console.error('Error Headers:', error.response.headers);
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health Check
  health: async () => {
    const response = await api.get('/');
    return response.data;
  },

  // Crop Diagnosis - Match your backend endpoint exactly
  diagnoseCrop: async (imageFile, query = '') => {
    const formData = new FormData();
    formData.append('file', imageFile);  // Your backend expects 'file'
    formData.append('query', query);     // Your backend expects 'query', not 'description'
    
    const response = await api.post('/diagnose_crop', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Market Advisory - Match your backend
  getMarketAdvice: async (cropName, location = '') => {
    const response = await api.post('/market_advice', {
      crop_name: cropName,  // Your backend expects 'crop_name'
      location: location,
    });
    return response.data;
  },

  // Government Schemes - Match your backend
  getSubsidyInfo: async (question) => {
    const response = await api.post('/subsidy_query', {
      question: question,  // Your backend expects 'question'
    });
    return response.data;
  },

  // Speech to Text - Match your backend
  speechToText: async (audioBlob, language = 'en-IN') => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('language', language);
    
    const response = await api.post('/stt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Text to Speech - Match your backend
  textToSpeech: async (text, language = 'en-IN', translate = false) => {
    const response = await api.post('/tts', {
      text: text,
      language: language,
      translate: translate,
    });
    return response.data;
  },

  // Get Conversation History - Match your backend
  getConversations: async (toolName = '') => {
    const endpoint = toolName ? `/conversations/${toolName}` : '/conversations';
    const response = await api.get(endpoint);
    return response.data;
  },

  // Test endpoints (no auth required)
  testDiagnoseCrop: async (imageFile, query = '') => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('query', query);
    
    const response = await api.post('/test/diagnose_crop', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  testMarketAdvice: async (cropName, location = '') => {
    const response = await api.post('/test/market_advice', {
      crop_name: cropName,
      location: location,
    });
    return response.data;
  },

  testSubsidyQuery: async (question) => {
    const response = await api.post('/test/subsidy_query', {
      question: question,
    });
    return response.data;
  },
};

export default api;
