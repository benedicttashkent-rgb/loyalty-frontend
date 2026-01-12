/**
 * Menu Fetcher Service
 * Fetches menu data from branch-specific online menus
 */

class MenuFetcher {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Fetch menu from a branch URL
   * Since we can't directly scrape, we'll use a proxy or API approach
   * For now, we'll return structured menu data based on the URLs
   */
  async fetchMenuFromUrl(branchId, menuUrl) {
    // Check cache first
    const cacheKey = `${branchId}_${Date.now()}`;
    const cached = this.cache.get(branchId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // In a real app, you would fetch from an API endpoint that scrapes the menu
      // For now, we'll use a placeholder structure that can be populated
      // You can create a backend endpoint to scrape these sites
      
      const menuData = await this.fetchMenuData(branchId, menuUrl);
      
      // Cache the result
      this.cache.set(branchId, {
        data: menuData,
        timestamp: Date.now()
      });

      return menuData;
    } catch (error) {
      console.error(`Error fetching menu for ${branchId}:`, error);
      // Return fallback menu
      return this.getFallbackMenu(branchId);
    }
  }

  /**
   * Fetch menu data - this would typically call a backend API
   * that scrapes the menu websites
   */
  async fetchMenuData(branchId, menuUrl) {
    // TODO: Create a backend endpoint to scrape menu data
    // For now, return structured placeholder data
    // You'll need to implement actual scraping on the backend
    
    // This is a placeholder - replace with actual API call
    const response = await fetch(`/api/menu/${branchId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      return await response.json();
    }

    // Fallback to default menu
    return this.getFallbackMenu(branchId);
  }

  /**
   * Get fallback menu structure
   */
  getFallbackMenu(branchId) {
    // This will be replaced with actual menu data
    // Structure matches what the app expects
    return {
      branchId,
      categories: [],
      items: []
    };
  }

  /**
   * Clear cache for a specific branch
   */
  clearCache(branchId) {
    this.cache.delete(branchId);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
  }
}

export default new MenuFetcher();

