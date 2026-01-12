/**
 * Restaurant Configuration
 * Defines the restaurant ID and API endpoints
 */
import API_BASE_URL from './api';

export const restaurantConfig = {
  restaurantId: 'benedict-cafe',
  apiBaseUrl: API_BASE_URL, // Uses VITE_API_BASE_URL or fallback from api.js
  branches: {
    mirabad: {
      id: 'mirabad',
      name: 'Мирабад'
    },
    nukus: {
      id: 'nukus',
      name: 'Нукус'
    }
  }
};

export default restaurantConfig;

