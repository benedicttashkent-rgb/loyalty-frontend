import iikoLoyaltyAPI from '../api/iikoLoyaltyAPI';
import { validateOrder, transformOrderToAPI } from '../../models/iikoLoyalty.types';
import loyaltyService from '../loyalty/loyaltyService';

/**
 * Order Service
 * Business logic layer for order operations
 */

class OrderService {
  constructor() {
    this.api = iikoLoyaltyAPI;
  }

  /**
   * Create new order with loyalty integration
   */
  async createOrder(orderData, customerId = null) {
    // Validate order
    const validation = validateOrder(orderData);
    
    if (!validation?.isValid) {
      return {
        success: false,
        error: validation?.errors?.join(', '),
      };
    }

    try {
      // Calculate loyalty points if customer ID provided
      let loyaltyCalculation = null;
      
      if (customerId) {
        const calculation = await loyaltyService?.calculateOrderPoints(
          customerId,
          orderData
        );
        
        if (calculation?.success) {
          loyaltyCalculation = calculation;
        }
      }

      // Create order
      const order = await this.api?.createOrder(transformOrderToAPI(orderData));

      // Process loyalty transaction if applicable
      if (customerId && loyaltyCalculation) {
        await loyaltyService?.processOrderTransaction(customerId, {
          orderId: order?.id,
          pointsToAdd: loyaltyCalculation?.pointsEarned,
        });
      }

      return {
        success: true,
        order,
        loyalty: loyaltyCalculation,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId) {
    try {
      const order = await this.api?.getOrder(orderId);
      
      return {
        success: true,
        order: order?.[0] || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId) {
    try {
      const status = await this.api?.getOrderStatus(orderId);
      
      return {
        success: true,
        status: status?.[0] || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, customerId = null) {
    try {
      // Get order details before cancellation for loyalty reversal
      const orderResult = await this.getOrder(orderId);
      
      // Cancel order
      await this.api?.cancelOrder(orderId);

      // Reverse loyalty points if applicable
      if (customerId && orderResult?.success && orderResult?.order) {
        // This would reverse the loyalty transaction
        // Implementation depends on iikoLoyalty API capabilities
      }

      return {
        success: true,
        message: 'Order cancelled successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Calculate order total with discounts
   */
  calculateOrderTotal(items, discounts = []) {
    let subtotal = 0;
    
    items?.forEach(item => {
      subtotal += (item?.price || 0) * (item?.amount || 1);
    });

    let totalDiscount = 0;
    discounts?.forEach(discount => {
      if (discount?.type === 'percentage') {
        totalDiscount += subtotal * (discount?.value / 100);
      } else if (discount?.type === 'fixed') {
        totalDiscount += discount?.value;
      }
    });

    return {
      subtotal,
      discount: totalDiscount,
      total: subtotal - totalDiscount,
    };
  }

  /**
   * Validate delivery address
   */
  validateDeliveryAddress(address) {
    const errors = [];

    if (!address?.street) {
      errors?.push('Street address is required');
    }

    if (!address?.home) {
      errors?.push('House number is required');
    }

    return {
      isValid: errors?.length === 0,
      errors,
    };
  }

  /**
   * Format order for display
   */
  formatOrderForDisplay(order) {
    return {
      id: order?.id,
      orderNumber: order?.externalNumber,
      date: new Date(order.timestamp),
      status: order?.status || 'pending',
      items: order?.items || [],
      customer: order?.customer,
      deliveryAddress: this.formatAddress(order?.deliveryPoint?.address),
      total: this.calculateOrderTotal(order?.items || []),
      payments: order?.payments || [],
    };
  }

  /**
   * Format address for display
   */
  formatAddress(address) {
    if (!address) return '';

    const parts = [
      address?.street,
      address?.home && `д. ${address?.home}`,
      address?.apartment && `кв. ${address?.apartment}`,
      address?.entrance && `подъезд ${address?.entrance}`,
      address?.floor && `этаж ${address?.floor}`,
    ]?.filter(Boolean);

    return parts?.join(', ');
  }
}

export const orderService = new OrderService();
export default orderService;