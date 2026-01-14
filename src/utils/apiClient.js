/**
 * API Client Utility
 * Handles API requests with proper base URL for both dev and production
 */

import API_BASE_URL, { getApiUrl } from '../config/api';

// Export the API base URL (uses VITE_API_BASE_URL or fallback)
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
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        const text = await response.text();
        return { 
          response, 
          data: { success: false, error: `Invalid JSON response: ${text}` } 
        };
      }
    } else {
      const text = await response.text();
      data = { success: false, error: text };
    }
    
    // Check if response is ok, but still return data for caller to handle
    if (!response.ok && !data.error) {
      data.error = `HTTP ${response.status}: ${response.statusText}`;
      data.success = false;
    }
    
    return { response, data };
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
