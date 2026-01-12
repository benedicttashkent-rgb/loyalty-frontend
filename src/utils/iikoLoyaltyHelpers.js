/**
 * Helper utilities for iikoLoyalty integration
 */

/**
 * Format phone number for iikoLoyalty API
 */
export const formatPhoneForAPI = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone?.replace(/\D/g, '');
  
  // Ensure it starts with country code
  if (cleaned?.length === 9 && !cleaned?.startsWith('998')) {
    return `998${cleaned}`;
  }
  
  return cleaned;
};

/**
 * Format phone number for display
 */
export const formatPhoneForDisplay = (phone) => {
  const cleaned = formatPhoneForAPI(phone);
  
  // Format as +998 XX XXX XX XX
  if (cleaned?.length === 12 && cleaned?.startsWith('998')) {
    return `+${cleaned?.slice(0, 3)} ${cleaned?.slice(3, 5)} ${cleaned?.slice(5, 8)} ${cleaned?.slice(8, 10)} ${cleaned?.slice(10, 12)}`;
  }
  
  return phone;
};

/**
 * Calculate points based on order amount
 */
export const calculatePointsFromAmount = (amount, pointsPerRuble = 1) => {
  return Math.floor(amount * pointsPerRuble);
};

/**
 * Calculate amount from points
 */
export const calculateAmountFromPoints = (points, pointsPerRuble = 1) => {
  return points / pointsPerRuble;
};

/**
 * Format date for API
 */
export const formatDateForAPI = (date) => {
  if (!date) return null;
  
  const d = new Date(date);
  return d?.toISOString();
};

/**
 * Format date for display
 */
export const formatDateForDisplay = (date, locale = 'ru-RU') => {
  if (!date) return '';
  
  const d = new Date(date);
  return d?.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time for display
 */
export const formatTimeForDisplay = (date, locale = 'ru-RU') => {
  if (!date) return '';
  
  const d = new Date(date);
  return d?.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format datetime for display
 */
export const formatDateTimeForDisplay = (date, locale = 'ru-RU') => {
  if (!date) return '';
  
  return `${formatDateForDisplay(date, locale)} ${formatTimeForDisplay(date, locale)}`;
};

/**
 * Generate unique order number
 */
export const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

/**
 * Validate UUID
 */
export const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex?.test(uuid);
};

/**
 * Parse API error
 */
export const parseAPIError = (error) => {
  if (error?.response) {
    // Server responded with error
    return {
      message: error?.response?.data?.message || 'Ошибка сервера',
      code: error?.response?.status,
      details: error?.response?.data,
    };
  } else if (error?.request) {
    // Request made but no response
    return {
      message: 'Нет ответа от сервера',
      code: 'NO_RESPONSE',
      details: null,
    };
  } else {
    // Error in request setup
    return {
      message: error?.message || 'Произошла ошибка',
      code: 'REQUEST_ERROR',
      details: null,
    };
  }
};

/**
 * Retry async function with exponential backoff
 */
export const retryAsync = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func?.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  return Object.keys(obj)?.length === 0;
};

/**
 * Storage helpers
 */
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },
};

export default {
  formatPhoneForAPI,
  formatPhoneForDisplay,
  calculatePointsFromAmount,
  calculateAmountFromPoints,
  formatDateForAPI,
  formatDateForDisplay,
  formatTimeForDisplay,
  formatDateTimeForDisplay,
  generateOrderNumber,
  isValidUUID,
  parseAPIError,
  retryAsync,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  storage,
};