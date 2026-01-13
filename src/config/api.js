/**
 * API Configuration
 * Handles API base URL with proper fallbacks for dev and production
 */

const getApiBaseUrl = () => {
  // Priority 1: Use VITE_API_BASE_URL if set (for production deployments)
  if (import.meta.env.VITE_API_BASE_URL) {
    let url = import.meta.env.VITE_API_BASE_URL.trim();
    
    // Fix: If URL doesn't start with http:// or https://, add https://
    if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      console.warn('⚠️  VITE_API_BASE_URL missing protocol, adding https://');
      url = `https://${url}`;
    }
    
    return url;
  }
  
  // Priority 2: In development, use Vite proxy (relative path)
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // Priority 3: Production fallback - use Railway URL
  // Update this with your actual Railway domain
  return 'https://chic-blessing-production-3203.up.railway.app/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const getApiUrl = (endpoint = '') => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;
  return url;
};

export default API_BASE_URL;