/**
 * Admin API Client
 * Helper function to make authenticated admin API requests with JWT token
 */

import { getApiUrl } from '../config/api';

/**
 * Make an authenticated admin API request
 * @param {string} endpoint - API endpoint (e.g., 'admin/dashboard/stats')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>}
 */
export const adminApiRequest = async (endpoint, options = {}) => {
  const adminToken = localStorage.getItem('adminToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add Authorization header if token exists
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }
  
  const response = await fetch(getApiUrl(endpoint), {
    ...options,
    headers,
    credentials: 'include', // Include cookies as fallback
  });
  
  return response;
};

export default adminApiRequest;
