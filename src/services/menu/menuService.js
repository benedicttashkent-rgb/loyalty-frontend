import iikoLoyaltyAPI from '../api/iikoLoyaltyAPI';

/**
 * Menu Service
 * Business logic layer for menu operations
 */

class MenuService {
  constructor() {
    this.api = iikoLoyaltyAPI;
    this.menuCache = null;
    this.cacheExpiry = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get full menu with caching
   */
  async getMenu(forceRefresh = false) {
    // Check cache
    if (!forceRefresh && this.menuCache && this.cacheExpiry > Date.now()) {
      return {
        success: true,
        menu: this.menuCache,
        fromCache: true,
      };
    }

    try {
      const menu = await this.api?.getMenu();
      
      // Update cache
      this.menuCache = menu;
      this.cacheExpiry = Date.now() + this.cacheDuration;

      return {
        success: true,
        menu,
        fromCache: false,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Get menu categories
   */
  async getCategories() {
    try {
      const categories = await this.api?.getCategories();
      
      return {
        success: true,
        categories: categories || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId) {
    try {
      const menuResult = await this.getMenu();
      
      if (!menuResult?.success) {
        return menuResult;
      }

      const products = menuResult?.menu?.products?.filter(
        product => product?.categoryId === categoryId
      ) || [];

      return {
        success: true,
        products,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Search products
   */
  async searchProducts(query) {
    try {
      const menuResult = await this.getMenu();
      
      if (!menuResult?.success) {
        return menuResult;
      }

      const searchTerm = query?.toLowerCase();
      const products = menuResult?.menu?.products?.filter(product => 
        product?.name?.toLowerCase()?.includes(searchTerm) ||
        product?.description?.toLowerCase()?.includes(searchTerm)
      ) || [];

      return {
        success: true,
        products,
        query,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Get product details
   */
  async getProductDetails(productId) {
    try {
      const menuResult = await this.getMenu();
      
      if (!menuResult?.success) {
        return menuResult;
      }

      const product = menuResult?.menu?.products?.find(
        p => p?.id === productId
      );

      if (!product) {
        return {
          success: false,
          error: 'Product not found',
        };
      }

      return {
        success: true,
        product,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message,
      };
    }
  }

  /**
   * Check product availability
   */
  isProductAvailable(product) {
    return product?.isAvailable !== false;
  }

  /**
   * Format price
   */
  formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    })?.format(price);
  }

  /**
   * Group products by category
   */
  groupProductsByCategory(products, categories) {
    const grouped = {};

    categories?.forEach(category => {
      grouped[category.id] = {
        category,
        products: [],
      };
    });

    products?.forEach(product => {
      if (grouped?.[product?.categoryId]) {
        grouped?.[product?.categoryId]?.products?.push(product);
      }
    });

    return Object.values(grouped)?.filter(group => group?.products?.length > 0);
  }

  /**
   * Clear menu cache
   */
  clearCache() {
    this.menuCache = null;
    this.cacheExpiry = null;
  }
}

export const menuService = new MenuService();
export default menuService;