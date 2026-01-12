/**
 * iikoLoyalty Integration Configuration
 * Central configuration for iikoLoyalty API integration
 */

export const iikoLoyaltyConfig = {
  // Base API configuration
  apiBaseUrl: import.meta.env?.VITE_IIKO_API_BASE_URL || 'https://api-ru.iiko.services',
  organizationId: import.meta.env?.VITE_IIKO_ORGANIZATION_ID,
  apiLogin: import.meta.env?.VITE_IIKO_API_LOGIN,

  // API endpoints
  endpoints: {
    // Authentication
    auth: {
      getToken: '/api/1/access_token',
    },
    
    // Loyalty program
    loyalty: {
      getBalance: '/api/1/loyalty/iiko/customer/balance',
      getCustomer: '/api/1/loyalty/iiko/customer',
      createCustomer: '/api/1/loyalty/iiko/customer/create',
      updateCustomer: '/api/1/loyalty/iiko/customer/update',
      getPrograms: '/api/1/loyalty/iiko/customer/programs',
      calculateTransaction: '/api/1/loyalty/iiko/customer/transaction/calculate',
      processTransaction: '/api/1/loyalty/iiko/customer/transaction/process',
    },
    
    // Orders
    orders: {
      create: '/api/1/deliveries/create',
      retrieve: '/api/1/deliveries/by_id',
      cancel: '/api/1/deliveries/cancel',
      getStatus: '/api/1/deliveries/status',
    },
    
    // Menu
    menu: {
      getMenu: '/api/1/nomenclature',
      getCategories: '/api/1/nomenclature/categories',
      getProducts: '/api/1/nomenclature/products',
    },
    
    // Rewards
    rewards: {
      getAvailable: '/api/1/loyalty/iiko/customer/programs/coupons',
      getCouponInfo: '/api/1/loyalty/iiko/customer/programs/coupon',
      activateCoupon: '/api/1/loyalty/iiko/customer/programs/coupon/activate',
    },
  },

  // Request configuration
  requestConfig: {
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  },

  // Token management
  tokenConfig: {
    refreshThreshold: 300, // Refresh token 5 minutes before expiry
    storageKey: 'iiko_access_token',
    expiryKey: 'iiko_token_expiry',
  },

  // Retry configuration
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
};

export default iikoLoyaltyConfig;