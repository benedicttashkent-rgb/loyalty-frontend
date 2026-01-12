import iikoLoyaltyAPI from '../api/iikoLoyaltyAPI';
import { validateCustomer, transformCustomerToAPI } from '../../models/iikoLoyalty.types';

/**
 * Loyalty Service
 * Business logic layer for loyalty program operations
 */

class LoyaltyService {
  constructor() {
    this.api = iikoLoyaltyAPI;
  }

  /**
   * Get or create customer
   */
  async getOrCreateCustomer(phone, customerData = {}) {
    try {
      // Try to get existing customer
      const existingCustomer = await this.api?.getCustomer(phone);
      
      if (existingCustomer && existingCustomer?.id) {
        return {
          success: true,
          customer: existingCustomer,
          isNew: false,
        };
      }
    } catch (error) {
      console.log('Customer not found, creating new customer');
    }

    // Create new customer if not found
    const validation = validateCustomer({ phone, ...customerData });
    
    if (!validation?.isValid) {
      return {
        success: false,
        error: validation?.errors?.join(', '),
      };
    }

    try {
      const newCustomer = await this.api?.createCustomer(
        transformCustomerToAPI({ phone, ...customerData })
      );

      return {
        success: true,
        customer: newCustomer,
        isNew: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Get customer loyalty balance
   */
  async getBalance(customerId) {
    try {
      const balance = await this.api?.getCustomerBalance(customerId);
      return {
        success: true,
        balance: balance?.balance || 0,
        data: balance,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Get customer loyalty programs
   */
  async getPrograms(customerId) {
    try {
      const programs = await this.api?.getLoyaltyPrograms(customerId);
      return {
        success: true,
        programs: programs || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Calculate points for order
   */
  async calculateOrderPoints(customerId, orderData) {
    try {
      const calculation = await this.api?.calculateLoyaltyTransaction(customerId, orderData);
      
      return {
        success: true,
        pointsEarned: calculation?.pointsToAdd || 0,
        pointsSpent: calculation?.pointsToSpend || 0,
        newBalance: calculation?.newBalance || 0,
        calculation,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Process loyalty transaction for order
   */
  async processOrderTransaction(customerId, transactionData) {
    try {
      const result = await this.api?.processLoyaltyTransaction(customerId, transactionData);
      
      return {
        success: true,
        transaction: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Update customer information
   */
  async updateCustomer(customerId, customerData) {
    try {
      const updated = await this.api?.updateCustomer(
        customerId,
        transformCustomerToAPI(customerData)
      );

      return {
        success: true,
        customer: updated,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Get customer transaction history
   */
  async getTransactionHistory(customerId, startDate = null, endDate = null) {
    try {
      // This would need to be implemented based on iikoLoyalty API capabilities
      // For now, returning placeholder structure
      return {
        success: true,
        transactions: [],
        message: 'Transaction history retrieval to be implemented based on API availability',
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }
}

export const loyaltyService = new LoyaltyService();
export default loyaltyService;