/**
 * Menu Scraper Service
 * Fetches menu from backend /api/menu/iiko/:branchId
 * Backend handles iiko auth + external menu lookup (avoids CORS)
 */

import { getApiUrl } from '../../config/api';

class MenuScraper {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  async fetchMenu(branchId) {
    const cached = this.cache.get(branchId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const response = await fetch(getApiUrl(`menu/iiko/${branchId}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || `Failed to load menu for ${branchId}`);
    }

    const data = await response.json();

    if (!data.success || !data.items?.length) {
      throw new Error(`Empty menu returned for ${branchId}`);
    }

    const result = {
      branchId,
      items: data.items,
      lastUpdated: new Date().toISOString(),
    };

    this.cache.set(branchId, { data: result, timestamp: Date.now() });
    console.log(`✅ Loaded ${data.items.length} items from iiko for ${branchId}`);
    return result;
  }

  transformMenuData(fetchedData) {
    return fetchedData?.items || [];
  }

  clearCache(branchId) {
    if (branchId) {
      this.cache.delete(branchId);
    } else {
      this.cache.clear();
    }
  }
}

export default new MenuScraper();
