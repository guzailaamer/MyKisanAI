import { auth } from './firebase';

class ApiService {
  constructor() {
    this.baseUrl = ''; // Use relative URLs to work with Vite proxy
  }

  async getAuthHeaders() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Conversation History
  async getUserConversations(limit = 50) {
    return this.makeRequest(`/conversations?limit=${limit}`);
  }

  async getToolConversations(toolName, limit = 20) {
    return this.makeRequest(`/conversations/${toolName}?limit=${limit}`);
  }

  // Crop Diagnosis
  async diagnoseCrop(imageFile, query) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('query', query);

    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const token = await user.getIdToken();
    
    const response = await fetch(`${this.baseUrl}/diagnose_crop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // Market Advisory
  async getMarketAdvice(cropName, location) {
    return this.makeRequest('/market_advice', {
      method: 'POST',
      body: JSON.stringify({
        crop_name: cropName,
        location: location,
      }),
    });
  }

  // Subsidy Query
  async getSubsidyAnswer(question) {
    return this.makeRequest('/subsidy_query', {
      method: 'POST',
      body: JSON.stringify({
        question: question,
      }),
    });
  }

  // Text-to-Speech
  async textToSpeech(text, language = 'en', translate = false, sourceLang = 'en', targetLang = null) {
    return this.makeRequest('/tts', {
      method: 'POST',
      body: JSON.stringify({
        text: text,
        language: language,
        translate: translate,
        source_lang: sourceLang,
        target_lang: targetLang,
      }),
    });
  }

  // Speech-to-Text
  async speechToText(audioFile) {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const token = await user.getIdToken();
    
    const response = await fetch(`${this.baseUrl}/stt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  }
}

export const apiService = new ApiService();
