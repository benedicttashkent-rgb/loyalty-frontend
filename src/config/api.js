// src/config/api.js
// НИЧЕГО СЛОЖНОГО - ПРОСТО КОНСТАНТА

const API_BASE_URL = 'https://web-production-9dbea.up.railway.app/api';

export const getApiUrl = (endpoint = '') => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  console.log('🔥 API URL:', url);
  return url;
};

// Export default for easy import
export default API_BASE_URL;