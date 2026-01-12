/**
 * Restaurant Configuration
 * Defines the restaurant ID and API endpoints
 */
export const restaurantConfig = {
  restaurantId: 'benedict-cafe',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
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

