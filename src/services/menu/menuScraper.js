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
    // Deduplicate concurrent fetches for the same branch
    if (cached?.promise) return cached.promise;

    const promise = this._doFetch(branchId);
    this.cache.set(branchId, { ...(cached || {}), promise });
    return promise;
  }

  async _doFetch(branchId) {
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
