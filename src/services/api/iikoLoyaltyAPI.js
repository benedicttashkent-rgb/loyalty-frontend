import axios from 'axios';
import iikoLoyaltyConfig from '../../config/iikoLoyalty.config';

/**
 * iikoLoyalty API Service
 * Handles all API communication with iikoLoyalty platform
 */

class IikoLoyaltyAPI {
  constructor() {
    this.config = iikoLoyaltyConfig;
    this.axiosInstance = axios?.create({
      baseURL: this.config?.apiBaseUrl,
      timeout: this.config?.requestConfig?.timeout,
      headers: this.config?.requestConfig?.headers,
    });

    // Setup request interceptor for token management
    this.axiosInstance?.interceptors?.request?.use(
      async (config) => {
        const token = await this.getValidToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Setup response interceptor for error handling
    let isRefreshing = false;
    let failedQueue = [];
    
    const processQueue = (error, token = null) => {
      failedQueue.forEach(prom => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token);
        }
      });
      failedQueue = [];
    };
    
    this.axiosInstance?.interceptors?.response?.use(
      (response) => response,
      async (error) => {
        const originalRequest = error?.config;
        
        if (error?.response?.status === 401 && !originalRequest?._retry) {
          if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.axiosInstance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }
          
          originalRequest._retry = true;
          isRefreshing = true;
          
          try {
            const newToken = await this.refreshToken();
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidToken() {
    const token = localStorage.getItem(this.config?.tokenConfig?.storageKey);
    const expiry = localStorage.getItem(this.config?.tokenConfig?.expiryKey);

    if (!token || !expiry) {
      return await this.refreshToken();
    }

    const expiryTime = new Date(expiry)?.getTime();
    const now = Date.now();
    const threshold = this.config?.tokenConfig?.refreshThreshold * 1000;

    if (expiryTime - now < threshold) {
      return await this.refreshToken();
    }

    return token;
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      const response = await axios?.post(
        `${this.config?.apiBaseUrl}${this.config?.endpoints?.auth?.getToken}`,
        {
          apiLogin: this.config?.apiLogin,
        }
      );

      const { token, expiresIn } = response?.data;
      const expiry = new Date(Date.now() + expiresIn * 1000);

      localStorage.setItem(this.config?.tokenConfig?.storageKey, token);
      localStorage.setItem(this.config?.tokenConfig?.expiryKey, expiry?.toISOString());

      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Generic API request with retry logic
   */
  async request(method, endpoint, data = null, options = {}) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.config?.retryConfig?.maxRetries; attempt++) {
      try {
        const response = await this.axiosInstance({
          method,
          url: endpoint,
          data,
          ...options,
        });
        return response?.data;
      } catch (error) {
        lastError = error;
        
        const shouldRetry = 
          attempt < this.config?.retryConfig?.maxRetries &&
          this.config?.retryConfig?.retryableStatusCodes?.includes(error?.response?.status);

        if (!shouldRetry) {
          break;
        }

        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryConfig.retryDelay * (attempt + 1))
        );
      }
    }

    throw lastError;
  }

  // ========== Authentication Methods ==========

  async authenticate() {
    return await this.refreshToken();
  }

  // ========== Loyalty Methods ==========

  /**
   * Get customer loyalty balance
   */
  async getCustomerBalance(customerId, organizationId = null) {
    return await this.request('POST', this.config?.endpoints?.loyalty?.getBalance, {
      organizationId: organizationId || this.config?.organizationId,
      customerId,
    });
  }

  /**
   * Get customer information
   */
  async getCustomer(phone) {
    return await this.request('POST', this.config?.endpoints?.loyalty?.getCustomer, {
      organizationId: this.config?.organizationId,
      phone,
    });
  }

  /**
   * Create new customer
   */
  async createCustomer(customerData) {
    return await this.request('POST', this.config?.endpoints?.loyalty?.createCustomer, {
      organizationId: this.config?.organizationId,
      ...customerData,
    });
  }

  /**
   * Update customer information
   */
  async updateCustomer(customerId, customerData) {
    return await this.request('POST', this.config?.endpoints?.loyalty?.updateCustomer, {
      organizationId: this.config?.organizationId,
      customerId,
      ...customerData,
    });
  }

  /**
   * Add card to customer
   * @param {string} customerId - Customer UUID
   * @param {string} cardTrack - Card track (can be null)
   * @param {string} cardNumber - Card number (can be null)
   * @param {string} organizationId - Organization UUID (optional, uses config default)
   * @returns {Promise<{}>} Empty object on success
   */
  async addCard(customerId, cardTrack, cardNumber, organizationId = null) {
    return await this.request('POST', this.config?.endpoints?.loyalty?.addCard, {
      organizationId: organizationId || this.config?.organizationId,
      customerId,
      cardTrack: cardTrack || null,
      cardNumber: cardNumber || null,
    });
  }

  /**
   * Get available loyalty programs
   */
  async getLoyaltyPrograms(customerId) {
    return await this.request('POST', this.config?.endpoints?.loyalty?.getPrograms, {
      organizationId: this.config?.organizationId,
      customerId,
    });
  }

  /**
   * Calculate loyalty transaction
   */
  async calculateLoyaltyTransaction(customerId, orderData) {
    return await this.request('POST', this.config?.endpoints?.loyalty?.calculateTransaction, {
      organizationId: this.config?.organizationId,
      customerId,
      ...orderData,
    });
  }

  /**
   * Process loyalty transaction
   */
  async processLoyaltyTransaction(customerId, transactionData) {
    return await this.request('POST', this.config?.endpoints?.loyalty?.processTransaction, {
      organizationId: this.config?.organizationId,
      customerId,
      ...transactionData,
    });
  }

  // ========== Order Methods ==========

  /**
   * Create delivery order
   */
  async createOrder(orderData) {
    return await this.request('POST', this.config?.endpoints?.orders?.create, {
      organizationId: this.config?.organizationId,
      ...orderData,
    });
  }

  /**
   * Retrieve order by ID
   */
  async getOrder(orderId) {
    return await this.request('POST', this.config?.endpoints?.orders?.retrieve, {
      organizationId: this.config?.organizationId,
      orderIds: [orderId],
    });
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId) {
    return await this.request('POST', this.config?.endpoints?.orders?.cancel, {
      organizationId: this.config?.organizationId,
      orderId,
    });
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId) {
    return await this.request('POST', this.config?.endpoints?.orders?.getStatus, {
      organizationId: this.config?.organizationId,
      orderIds: [orderId],
    });
  }

  // ========== Menu Methods ==========

  /**
   * Get full menu
   */
  async getMenu() {
    return await this.request('POST', this.config?.endpoints?.menu?.getMenu, {
      organizationId: this.config?.organizationId,
    });
  }

  /**
   * Get menu categories
   */
  async getCategories() {
    return await this.request('POST', this.config?.endpoints?.menu?.getCategories, {
      organizationId: this.config?.organizationId,
    });
  }

  /**
   * Get products
   */
  async getProducts() {
    return await this.request('POST', this.config?.endpoints?.menu?.getProducts, {
      organizationId: this.config?.organizationId,
    });
  }

  // ========== Rewards Methods ==========

  /**
   * Get available rewards/coupons
   */
  async getAvailableRewards(customerId) {
    return await this.request('POST', this.config?.endpoints?.rewards?.getAvailable, {
      organizationId: this.config?.organizationId,
      customerId,
    });
  }

  /**
   * Get coupon information
   */
  async getCouponInfo(customerId, couponId) {
    return await this.request('POST', this.config?.endpoints?.rewards?.getCouponInfo, {
      organizationId: this.config?.organizationId,
      customerId,
      couponId,
    });
  }

  /**
   * Activate coupon
   */
  async activateCoupon(customerId, couponId) {
    return await this.request('POST', this.config?.endpoints?.rewards?.activateCoupon, {
      organizationId: this.config?.organizationId,
      customerId,
      couponId,
    });
  }
}

// Export singleton instance
export const iikoLoyaltyAPI = new IikoLoyaltyAPI();
export default iikoLoyaltyAPI;