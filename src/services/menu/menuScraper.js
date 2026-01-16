/**
 * Menu Scraper Service
 * Fetches menu data from backend API using API key authentication
 * 
 * The backend API handles menu import from external sources using API keys.
 * This service fetches the menu data from the backend API endpoint.
 */

import restaurantConfig from '../../config/restaurant.config';
import { getApiUrl } from '../../config/api';

const MENU_URLS = {
  nukus: 'https://benedictnuk.myresto.online/',
  mirabad: 'https://benedictmir.myresto.online/'
};

class MenuScraper {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Fetch menu data for a specific branch from database (via API)
   * Menu items are managed manually through admin panel
   */
  async fetchMenu(branchId) {
    // Check cache first
    const cached = this.cache.get(branchId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Call backend API to fetch menu from database
      // Backend endpoint: /api/menu/:branchId (public access)
      const apiUrl = getApiUrl(`menu/${branchId}`);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const menuData = await response.json();
        
        // Validate that it has items
        if (menuData.success && menuData.items && menuData.items.length > 0) {
          // Cache the result
          this.cache.set(branchId, {
            data: menuData,
            timestamp: Date.now()
          });
          console.log(`✅ Loaded ${menuData.items.length} items from database for ${branchId}`);
          return menuData;
        } else {
          console.warn(`⚠️ API returned empty menu for ${branchId} (${menuData.items?.length || 0} items)`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ API error for ${branchId}: ${response.status} ${response.statusText}`, errorData);
      }

      // If API fails, return fallback menu
      return this.getFallbackMenu(branchId);
    } catch (error) {
      console.error(`Error fetching menu for ${branchId}:`, error);
      return this.getFallbackMenu(branchId);
    }
  }

  /**
   * Get fallback menu structure
   * This will be replaced with actual scraped data
   */
  getFallbackMenu(branchId) {
    // Return empty structure - will be populated by backend scraping
    return {
      branchId,
      categories: [],
      items: [],
      lastUpdated: null
    };
  }

  /**
   * Transform scraped menu data to app format
   */
  transformMenuData(scrapedData, branchId) {
    // Transform the scraped data to match our menu item structure
    return scrapedData.items?.map((item, index) => {
      // Preserve original category name from backend, but also store normalized ID for filtering
      const originalCategory = item.category || item.category_name || '';
      const normalizedCategory = this.mapCategory(originalCategory);
      
      // Convert relative image URL to full URL
      let imageUrl = item.image || item.photo || item.image_url || '';
      if (imageUrl) {
        // Remove double slashes and normalize path
        imageUrl = imageUrl.replace(/\/+/g, '/');
        
        // If it's already a full URL, use as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          // Already full URL, use as is
        } else if (imageUrl.startsWith('/uploads/')) {
          // Import getApiUrl dynamically to avoid circular dependency
          const { getApiUrl } = require('../../config/api');
          let apiBase = getApiUrl('').replace('/api', ''); // Remove /api suffix
          // Remove trailing slash from apiBase
          apiBase = apiBase.replace(/\/+$/, '');
          // Ensure imageUrl has single leading slash
          const cleanImagePath = imageUrl.replace(/^\/+/, '/');
          // Combine: base + path (no double slashes)
          imageUrl = `${apiBase}${cleanImagePath}`;
          console.log(`[menuScraper] Image URL transformed: ${item.image || item.image_url} → ${imageUrl}`);
        }
      }
      
      return {
        id: item.id || `${branchId}-${index}`,
        name: item.name || item.title,
        description: item.description || '',
        price: item.price || 0,
        weight: item.weight || item.size || '',
        category: normalizedCategory, // Use normalized for filtering
        categoryName: originalCategory, // Preserve original name for display
        image: imageUrl,
        imageAlt: item.imageAlt || `${item.name} from Benedict ${branchId}`,
        isNew: item.isNew || false,
        branch: branchId,
        modifiers: item.modifiers || [],
        // Extract nutritional info - support both nested and flat structures
        calories: item.calories || item.nutritionalInfo?.calories || null,
        proteins: item.proteins || item.nutritionalInfo?.proteins || null,
        fats: item.fats || item.nutritionalInfo?.fats || null,
        carbohydrates: item.carbohydrates || item.nutritionalInfo?.carbohydrates || null,
        nutritionalInfo: item.nutritionalInfo || {
          calories: item.calories || null,
          proteins: item.proteins || null,
          fats: item.fats || null,
          carbohydrates: item.carbohydrates || null
        }
      };
    }) || [];
  }

  /**
   * Map category names to our category IDs
   */
  mapCategory(categoryName) {
    if (!categoryName) return 'all';
    
    const categoryMap = {
      // Breakfast
      'завтрак': 'breakfast',
      'breakfast': 'breakfast',
      'завтраки': 'breakfast',
      'бенедикт': 'breakfast', // Benedict items moved to breakfast
      'benedict': 'breakfast',
      
      // Special Breakfast
      'особые завтраки': 'special-breakfast',
      'special-breakfast': 'special-breakfast',
      'special_breakfast': 'special-breakfast',
      
      // Salads and Appetizers
      'салаты и закуски': 'salads-appetizers',
      'salads-appetizers': 'salads-appetizers',
      'salads_appetizers': 'salads-appetizers',
      'салаты': 'salads-appetizers',
      'закуски': 'salads-appetizers',
      
      // Alcohol Snacks (only for Nukus)
      'закуски к алкогольным напиткам': 'alcohol-snacks',
      'alcohol-snacks': 'alcohol-snacks',
      'alcohol_snacks': 'alcohol-snacks',
      
      // Additions (only for Nukus)
      'дополнительно': 'additions',
      'additions': 'additions',
      'дополнительно к любому блюду': 'additions',
      
      // Meat Set (only for Nukus)
      'сет мясной': 'meat-set',
      'meat-set': 'meat-set',
      'meat_set': 'meat-set',
      
      // Soups
      'супы': 'soups',
      'soups': 'soups',
      'soup': 'soups',
      
      // Healthy Eating
      'правильное питание': 'healthy-eating',
      'healthy-eating': 'healthy-eating',
      'healthy_eating': 'healthy-eating',
      
      // Bruschettas and Sandwiches
      'брускетты и сэндвичи': 'bruschettas-sandwiches',
      'bruschettas-sandwiches': 'bruschettas-sandwiches',
      'bruschettas_sandwiches': 'bruschettas-sandwiches',
      'сэндвичи': 'bruschettas-sandwiches',
      'брускетты': 'bruschettas-sandwiches',
      
      // Main Courses
      'основное': 'main-courses',
      'main-courses': 'main-courses',
      'main_courses': 'main-courses',
      'hot_meals': 'main-courses',
      'основные блюда': 'main-courses',
      
      // Pasta (used as Гарниры)
      'паста': 'pasta',
      'pasta': 'pasta',
      'гарниры': 'pasta',
      
      // Pizza
      'пицца': 'pizza',
      'pizza': 'pizza',
      
      // Coffee
      'кофе': 'coffee',
      'coffee': 'coffee',
      
      // Cold Coffee
      'холодный кофе': 'cold-coffee',
      'cold-coffee': 'cold-coffee',
      'cold_coffee': 'cold-coffee',
      'iced-coffee': 'cold-coffee',
      
      // Hot Drinks (Айс ТИ)
      'горячие напитки': 'hot-drinks',
      'hot-drinks': 'hot-drinks',
      'hot_drinks': 'hot-drinks',
      'айс ти': 'hot-drinks',
      'iced-tea': 'hot-drinks',
      
      // Coffee on Alternative Milk
      'кофе на альтернативном молоке': 'coffee-alt-milk',
      'coffee-alt-milk': 'coffee-alt-milk',
      'coffee_alt_milk': 'coffee-alt-milk',
      
      // Pastries
      'выпечка': 'pastries',
      'pastries': 'pastries',
      'pastry': 'pastries',
      
      // Signature Tea
      'авторский чай': 'signature-tea',
      'signature-tea': 'signature-tea',
      'signature_tea': 'signature-tea',
      
      // Leaf Tea
      'листовой чай': 'leaf-tea',
      'leaf-tea': 'leaf-tea',
      'leaf_tea': 'leaf-tea',
      'loose-leaf-tea': 'leaf-tea',
      
      // Smoothies
      'смузи': 'smoothies',
      'smoothies': 'smoothies',
      'smoothie': 'smoothies',
      
      // Fresh Juices
      'фреши': 'fresh-juices',
      'fresh-juices': 'fresh-juices',
      'fresh_juices': 'fresh-juices',
      'фреш': 'fresh-juices',
      
      // Desserts
      'десерты': 'desserts',
      'desserts': 'desserts',
      'dessert': 'desserts',
      
      // Milkshakes
      'молочные шейки': 'milkshakes',
      'milkshakes': 'milkshakes',
      'milkshake': 'milkshakes',
      
      // Lemonades
      'лимонады': 'lemonades',
      'lemonades': 'lemonades',
      'lemonade': 'lemonades',
      
      // Cocktails
      'коктейли': 'cocktails',
      'cocktails': 'cocktails',
      'cocktail': 'cocktails',
      
      // Drinks (Софты)
      'напитки': 'drinks',
      'drinks': 'drinks',
      'drink': 'drinks',
      'софты': 'drinks',
      'soft-drink': 'drinks',
      
      // Legacy mappings for backward compatibility
      'обед': 'main-courses',
      'lunch': 'main-courses',
      'sides': 'salads-appetizers',
      'iced-tea': 'hot-drinks',
      'fruit-herbal-tea': 'signature-tea',
      'soft-drink': 'drinks',
      'pp-desserts': 'desserts',
      'kids_menu': 'desserts'
    };

    const normalized = categoryName?.toLowerCase()?.trim();
    return categoryMap[normalized] || categoryName || 'all';
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

