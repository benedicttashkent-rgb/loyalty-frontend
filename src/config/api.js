// API Configuration
// NUCLEAR OPTION: Hardcode the Railway URL
// This will work IMMEDIATELY without any env var issues

export const API_BASE_URL = 'https://web-production-9dbea.up.railway.app/api';

// Helper function to build full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // Remove trailing slash from base URL if present
  const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

// Later you can change it back to:
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://web-production-9dbea.up.railway.app/api';
