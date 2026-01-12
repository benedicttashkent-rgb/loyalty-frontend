/**
 * API Client Utility
 * Handles API requests with proper base URL for both dev and production
 */

import { API_BASE_URL, getApiUrl } from '../config/api';

// Export the hardcoded Railway URL
export const apiBaseUrl = API_BASE_URL;

// Helper to build full API URLs
export { getApiUrl };

/**
 * Make API request with proper error handling
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${apiBaseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { response, data };
    } else {
      const text = await response.text();
      return { response, data: { success: false, error: text } };
    }
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
