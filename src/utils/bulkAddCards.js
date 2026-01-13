/**
 * Utility script to bulk add cards to existing customers who don't have cards
 * This should be called from the backend or run as a one-time migration
 */

import { getApiUrl } from '../config/api';

/**
 * Bulk add cards to all customers without cards
 * @returns {Promise<{success: boolean, message: string, stats?: object}>}
 */
export const bulkAddCardsToCustomers = async () => {
  try {
    console.log('🔄 Starting bulk card addition for customers without cards...');
    
    const response = await fetch(getApiUrl('admin/customers/bulk-add-cards'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('✅ Bulk card addition completed:', data);
        return {
          success: true,
          message: data.message || 'Cards added successfully',
          stats: data.stats || {}
        };
      } else {
        console.error('❌ Bulk card addition failed:', data.error);
        return {
          success: false,
          message: data.error || 'Failed to add cards'
        };
      }
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ API error:', response.status, errorData);
      return {
        success: false,
        message: errorData.error || `Server error: ${response.status}`
      };
    }
  } catch (error) {
    console.error('❌ Error during bulk card addition:', error);
    return {
      success: false,
      message: error.message || 'Network error'
    };
  }
};

/**
 * Check how many customers don't have cards
 * @returns {Promise<{success: boolean, count?: number, message?: string}>}
 */
export const getCustomersWithoutCardsCount = async () => {
  try {
    const response = await fetch(getApiUrl('admin/customers/stats'), {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.stats) {
        // Calculate customers without cards
        // This assumes the backend provides this stat, or we can filter clients
        const customersWithoutCards = data.stats.customersWithoutCards || 0;
        return {
          success: true,
          count: customersWithoutCards
        };
      }
    }
    return {
      success: false,
      message: 'Could not fetch statistics'
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

export default {
  bulkAddCardsToCustomers,
  getCustomersWithoutCardsCount
};
