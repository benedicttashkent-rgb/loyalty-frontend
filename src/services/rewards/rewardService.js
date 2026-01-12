import iikoLoyaltyAPI from '../api/iikoLoyaltyAPI';

/**
 * Reward Service
 * Business logic layer for rewards and coupons operations
 */

class RewardService {
  constructor() {
    this.api = iikoLoyaltyAPI;
  }

  /**
   * Get available rewards for customer
   */
  async getAvailableRewards(customerId) {
    try {
      const rewards = await this.api?.getAvailableRewards(customerId);
      
      // Filter and categorize rewards
      const categorized = this.categorizeRewards(rewards || []);

      return {
        success: true,
        rewards: categorized,
        total: rewards?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Get reward details
   */
  async getRewardDetails(customerId, couponId) {
    try {
      const reward = await this.api?.getCouponInfo(customerId, couponId);
      
      return {
        success: true,
        reward,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Activate/redeem reward
   */
  async redeemReward(customerId, couponId) {
    try {
      const result = await this.api?.activateCoupon(customerId, couponId);
      
      return {
        success: true,
        result,
        message: 'Награда успешно активирована',
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Categorize rewards by type
   */
  categorizeRewards(rewards) {
    const categories = {
      coffee: [],
      desserts: [],
      discounts: [],
      other: [],
    };

    rewards?.forEach(reward => {
      const name = reward?.series?.name?.toLowerCase() || '';
      
      if (name?.includes('кофе') || name?.includes('coffee')) {
        categories?.coffee?.push(reward);
      } else if (name?.includes('десерт') || name?.includes('dessert')) {
        categories?.desserts?.push(reward);
      } else if (name?.includes('скидка') || name?.includes('discount')) {
        categories?.discounts?.push(reward);
      } else {
        categories?.other?.push(reward);
      }
    });

    return categories;
  }

  /**
   * Check if reward is expired
   */
  isRewardExpired(reward) {
    if (!reward?.expirationDate) return false;
    
    const expiration = new Date(reward.expirationDate);
    const now = new Date();
    
    return now > expiration;
  }

  /**
   * Check if reward is active
   */
  isRewardActive(reward) {
    if (this.isRewardExpired(reward)) return false;
    if (reward?.status === 'Used' || reward?.status === 'Expired') return false;
    
    if (reward?.activationDate) {
      const activation = new Date(reward.activationDate);
      const now = new Date();
      
      if (now < activation) return false;
    }
    
    return true;
  }

  /**
   * Get days until expiration
   */
  getDaysUntilExpiration(reward) {
    if (!reward?.expirationDate) return null;
    
    const expiration = new Date(reward.expirationDate);
    const now = new Date();
    const diffTime = expiration - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * Format reward for display
   */
  formatRewardForDisplay(reward) {
    return {
      id: reward?.id,
      title: reward?.series?.name || 'Награда',
      description: reward?.series?.description || '',
      type: reward?.type?.name || 'reward',
      status: reward?.status,
      isActive: this.isRewardActive(reward),
      isExpired: this.isRewardExpired(reward),
      daysUntilExpiration: this.getDaysUntilExpiration(reward),
      activationDate: reward?.activationDate ? new Date(reward.activationDate) : null,
      expirationDate: reward?.expirationDate ? new Date(reward.expirationDate) : null,
      couponNumber: reward?.couponNumber,
    };
  }

  /**
   * Get reward recommendations based on order history
   */
  getRecommendedRewards(rewards, orderHistory) {
    // Simple recommendation logic based on order history
    const recommended = [];
    
    // Get frequently ordered items
    const itemFrequency = {};
    orderHistory?.forEach(order => {
      order?.items?.forEach(item => {
        itemFrequency[item.productId] = (itemFrequency?.[item?.productId] || 0) + 1;
      });
    });

    // Match rewards with frequently ordered items
    rewards?.forEach(reward => {
      const rewardData = this.formatRewardForDisplay(reward);
      if (rewardData?.isActive) {
        recommended?.push(rewardData);
      }
    });

    return recommended?.slice(0, 3); // Return top 3 recommendations
  }
}

export const rewardService = new RewardService();
export default rewardService;