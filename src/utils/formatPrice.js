/**
 * Format price with spaces and currency
 * Example: 18000 -> "18 000 UZS"
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number' && typeof price !== 'string') {
    return '0 UZS';
  }
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return '0 UZS';
  }
  
  // Format with spaces as thousand separators
  const formatted = Math.round(numPrice)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  return `${formatted} UZS`;
};

export default formatPrice;


