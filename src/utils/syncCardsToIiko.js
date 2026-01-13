/**
 * Utility to sync existing card numbers from database to iiko
 * This fixes customers who have cards in our DB but not in iiko
 */

import { getApiUrl } from '../config/api';

/**
 * Sync cards to iiko for customers who have card_number in DB but not in iiko
 * @returns {Promise<{success: boolean, message: string, stats?: object}>}
 */
export const syncCardsToIiko = async () => {
  try {
    console.log('🔄 Starting card sync to iiko for existing customers...');
    
    const response = await fetch(getApiUrl('admin/customers/sync-cards-to-iiko'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('✅ Card sync to iiko completed:', data);
        return {
          success: true,
          message: data.message || 'Cards synced to iiko successfully',
          stats: data.stats || {}
        };
      } else {
        console.error('❌ Card sync to iiko failed:', data.error);
        return {
          success: false,
          message: data.error || 'Failed to sync cards to iiko'
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
    console.error('❌ Error during card sync to iiko:', error);
    return {
      success: false,
      message: error.message || 'Network error'
    };
  }
};

export default {
  syncCardsToIiko
};
