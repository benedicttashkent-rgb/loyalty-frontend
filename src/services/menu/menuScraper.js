/**
 * Menu Scraper Service
 * Fetches external menu from iiko API by matching branch name,
 * then transforms the response into the app's menu item format.
 */

import iikoLoyaltyAPI from '../api/iikoLoyaltyAPI';

// Keywords used to match the correct external menu by branch
const BRANCH_KEYWORDS = {
  mirabad: ['мирабад', 'mirabad'],
  nukus: ['нукус', 'nukus'],
};

class MenuScraper {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    // Cached list of external menus so we don't re-fetch on every branch load
    this._externalMenuList = null;
    this._externalMenuListFetchedAt = null;
  }

  /**
   * Fetch and cache the list of all external menus from iiko
   */
  async _getExternalMenuList() {
    const now = Date.now();
    if (
      this._externalMenuList &&
      this._externalMenuListFetchedAt &&
      now - this._externalMenuListFetchedAt < this.cacheTimeout
    ) {
      return this._externalMenuList;
    }

    const response = await iikoLoyaltyAPI.listExternalMenus();
    const list = response?.externalMenus || [];
    this._externalMenuList = list;
    this._externalMenuListFetchedAt = now;
    return list;
  }

  /**
   * Find the external menu ID that matches the given branch
   */
  async _findExternalMenuId(branchId) {
    const list = await this._getExternalMenuList();
    const keywords = BRANCH_KEYWORDS[branchId] || [branchId];

    const match = list.find((menu) => {
      const name = (menu?.name || '').toLowerCase();
      return keywords.some((kw) => name.includes(kw));
    });

    if (!match) {
      throw new Error(`No external menu found for branch: ${branchId}`);
    }

    return match.id;
  }

  /**
   * Fetch menu data for a specific branch from iiko external menu API
   */
  async fetchMenu(branchId) {
    // Check cache first
    const cached = this.cache.get(branchId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const externalMenuId = await this._findExternalMenuId(branchId);
    // POST /api/2/menu/by_id returns the menu object directly at root (not wrapped in externalMenus)
    const menuData = await iikoLoyaltyAPI.getExternalMenuById(externalMenuId);

    if (!menuData?.itemCategories) {
      throw new Error(`External menu data not found in response for branch: ${branchId}`);
    }

    const result = {
      branchId,
      categories: menuData.itemCategories?.map((c) => ({ id: c.id, name: c.name })) || [],
      items: this._flattenItems(menuData.itemCategories || [], branchId),
      lastUpdated: new Date().toISOString(),
    };

    this.cache.set(branchId, { data: result, timestamp: Date.now() });
    console.log(`✅ Loaded ${result.items.length} items from iiko external menu for ${branchId}`);
    return result;
  }

  /**
   * Flatten itemCategories → items into a single array with category info attached
   */
  _flattenItems(itemCategories, branchId) {
    const items = [];
    itemCategories.forEach((category) => {
      (category.items || []).forEach((item, index) => {
        const size = item.itemSizes?.[0];
        const price = size?.prices?.[0]?.price ?? 0;
        const imageUrl =
          size?.buttonImageUrl ||
          size?.sectionImageUrl?.[0] ||
          item.imageLinks?.[0] ||
          '';

        const nutrition = size?.nutritionPerHundredGrams || {};

        items.push({
          id: item.sku || `${branchId}-${category.id}-${index}`,
          name: item.name || '',
          description: item.description || item.additionalInfo || '',
          price,
          weight: size?.portionWeightGrams ? `${size.portionWeightGrams} г` : '',
          category: this.mapCategory(category.name),
          categoryName: category.name,
          image: imageUrl,
          imageAlt: `${item.name} from Benedict ${branchId}`,
          isNew: false,
          branch: branchId,
          modifiers: this._extractModifiers(size?.modifierGroups || []),
          calories: nutrition.calories ?? null,
          proteins: nutrition.proteins ?? null,
          fats: nutrition.fats ?? null,
          carbohydrates: nutrition.carbohydrates ?? null,
          nutritionalInfo: {
            calories: nutrition.calories ?? null,
            proteins: nutrition.proteins ?? null,
            fats: nutrition.fats ?? null,
            carbohydrates: nutrition.carbohydrates ?? null,
          },
        });
      });
    });
    return items;
  }

  /**
   * Extract modifiers from iiko modifier groups into app format
   */
  _extractModifiers(modifierGroups) {
    const modifiers = [];
    modifierGroups.forEach((group) => {
      (group.items || []).forEach((mod) => {
        const price = mod.prices?.[0]?.price ?? 0;
        modifiers.push({
          id: mod.sku || mod.id,
          name: mod.name,
          price,
        });
      });
    });
    return modifiers;
  }

  /**
   * Transform fetched menu data to app format (called by index.jsx)
   */
  transformMenuData(fetchedData) {
    // Data is already transformed in fetchMenu; just return items
    return fetchedData?.items || [];
  }

  /**
   * Map iiko category names to our internal category IDs
   */
  mapCategory(categoryName) {
    if (!categoryName) return 'all';

    const categoryMap = {
      'завтрак': 'breakfast',
      'breakfast': 'breakfast',
      'завтраки': 'breakfast',
      'бенедикт': 'breakfast',
      'benedict': 'breakfast',
      'особые завтраки': 'special-breakfast',
      'special-breakfast': 'special-breakfast',
      'special_breakfast': 'special-breakfast',
      'салаты и закуски': 'salads-appetizers',
      'salads-appetizers': 'salads-appetizers',
      'салаты': 'salads-appetizers',
      'закуски': 'salads-appetizers',
      'закуски к алкогольным напиткам': 'alcohol-snacks',
      'alcohol-snacks': 'alcohol-snacks',
      'дополнительно': 'additions',
      'additions': 'additions',
      'дополнительно к любому блюду': 'additions',
      'сет мясной': 'meat-set',
      'meat-set': 'meat-set',
      'супы': 'soups',
      'soups': 'soups',
      'правильное питание': 'healthy-eating',
      'healthy-eating': 'healthy-eating',
      'брускетты и сэндвичи': 'bruschettas-sandwiches',
      'bruschettas-sandwiches': 'bruschettas-sandwiches',
      'сэндвичи': 'bruschettas-sandwiches',
      'брускетты': 'bruschettas-sandwiches',
      'основное': 'main-courses',
      'main-courses': 'main-courses',
      'основные блюда': 'main-courses',
      'обед': 'main-courses',
      'lunch': 'main-courses',
      'паста': 'pasta',
      'pasta': 'pasta',
      'гарниры': 'pasta',
      'пицца': 'pizza',
      'pizza': 'pizza',
      'кофе': 'coffee',
      'coffee': 'coffee',
      'холодный кофе': 'cold-coffee',
      'cold-coffee': 'cold-coffee',
      'горячие напитки': 'hot-drinks',
      'hot-drinks': 'hot-drinks',
      'айс ти': 'hot-drinks',
      'кофе на альтернативном молоке': 'coffee-alt-milk',
      'coffee-alt-milk': 'coffee-alt-milk',
      'выпечка': 'pastries',
      'pastries': 'pastries',
      'авторский чай': 'signature-tea',
      'signature-tea': 'signature-tea',
      'листовой чай': 'leaf-tea',
      'leaf-tea': 'leaf-tea',
      'смузи': 'smoothies',
      'smoothies': 'smoothies',
      'фреши': 'fresh-juices',
      'fresh-juices': 'fresh-juices',
      'фреш': 'fresh-juices',
      'десерты': 'desserts',
      'desserts': 'desserts',
      'молочные шейки': 'milkshakes',
      'milkshakes': 'milkshakes',
      'лимонады': 'lemonades',
      'lemonades': 'lemonades',
      'коктейли': 'cocktails',
      'cocktails': 'cocktails',
      'напитки': 'drinks',
      'drinks': 'drinks',
      'софты': 'drinks',
      'домашние настойки': 'tinctures',
      'tinctures': 'tinctures',
      'пиво': 'beer',
      'beer': 'beer',
    };

    const normalized = categoryName?.toLowerCase()?.trim();
    return categoryMap[normalized] || normalized || 'all';
  }

  clearCache(branchId) {
    if (branchId) {
      this.cache.delete(branchId);
    } else {
      this.cache.clear();
      this._externalMenuList = null;
      this._externalMenuListFetchedAt = null;
    }
  }
}

export default new MenuScraper();
