/**
 * Token Refresh Service
 * Automatically refreshes JWT tokens before expiration to prevent users from logging out
 */

import { getApiUrl } from '../../config/api';

const TOKEN_KEY = 'authToken';
const REFRESH_THRESHOLD_DAYS = 7; // Refresh token if it expires within 7 days
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour
const CHECK_ON_VISIBILITY = true; // Check when app becomes visible

let refreshInterval = null;
let isRefreshing = false;

/**
 * Decode JWT token to get expiration date
 */
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token needs to be refreshed
 */
function shouldRefreshToken(token) {
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const timeUntilExpiration = expirationTime - now;
  const thresholdMs = REFRESH_THRESHOLD_DAYS * 24 * 60 * 60 * 1000; // 7 days in ms

  // Refresh if token expires within threshold
  return timeUntilExpiration < thresholdMs && timeUntilExpiration > 0;
}

/**
 * Refresh the token by calling the backend API
 */
async function refreshToken() {
  if (isRefreshing) {
    console.log('⏳ Token refresh already in progress...');
    return;
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.log('⚠️ No token to refresh');
    return;
  }

  // Check if token needs refresh
  if (!shouldRefreshToken(token)) {
    return; // Token is still fresh
  }

  isRefreshing = true;
  console.log('🔄 Refreshing token...');

  try {
    const response = await fetch(getApiUrl('auth/refresh-token'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.token) {
        // Update token in localStorage
        localStorage.setItem(TOKEN_KEY, data.token);
        console.log('✅ Token refreshed successfully');
        return true;
      } else {
        console.error('❌ Token refresh failed: No token in response', data);
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Token refresh failed:', response.status, errorData);
      
      // If token is expired, clear it (user will need to login again)
      if (response.status === 401) {
        console.log('🔒 Token expired, clearing...');
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
  } finally {
    isRefreshing = false;
  }

  return false;
}

/**
 * Start automatic token refresh service
 */
export function startTokenRefreshService() {
  // Stop existing interval if any
  stopTokenRefreshService();

  // Check immediately
  refreshToken();

  // Check periodically
  refreshInterval = setInterval(() => {
    refreshToken();
  }, CHECK_INTERVAL_MS);

  // Check when app becomes visible (user returns to app)
  if (CHECK_ON_VISIBILITY && typeof document !== 'undefined') {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ App became visible, checking token...');
        refreshToken();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Return cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }

  console.log('✅ Token refresh service started');
}

/**
 * Stop automatic token refresh service
 */
export function stopTokenRefreshService() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('🛑 Token refresh service stopped');
  }
}

/**
 * Manually trigger token refresh (for immediate refresh)
 */
export async function manualRefreshToken() {
  return await refreshToken();
}

export default {
  start: startTokenRefreshService,
  stop: stopTokenRefreshService,
  refresh: manualRefreshToken,
};
