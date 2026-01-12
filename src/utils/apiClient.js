/**
 * API Client Utility
 * Handles API requests with proper base URL for both dev and production
 */

const getApiBaseUrl = () => {
  // In production, use environment variable or fallback to relative path
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // In development, use Vite proxy (relative path)
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // Production fallback - try to detect Railway URL or use relative
  // This will work if frontend and backend are on same domain
  return '/api';
};

export const apiBaseUrl = getApiBaseUrl();

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
