/**
 * Format date utilities
 * Format dates to dd/mm/yyyy format everywhere in design
 */

/**
 * Format date to dd/mm/yyyy
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date as dd/mm/yyyy
 */
export const formatDateDDMMYYYY = (date) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Parse dd/mm/yyyy to Date object
 * @param {string} dateString - Date string in dd/mm/yyyy format
 * @returns {Date|null} Date object or null if invalid
 */
export const parseDateDDMMYYYY = (dateString) => {
  if (!dateString) return null;
  
  try {
    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return null;
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(date.getTime())) return null;
    
    return date;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
};

/**
 * Format date for input[type="date"] (yyyy-mm-dd)
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date as yyyy-mm-dd for input
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Get month abbreviation in Russian (ЯНВ, ФЕВ, etc.)
 * @param {number} monthIndex - Month index (0-11) or Date object
 * @returns {string} Month abbreviation
 */
export const getMonthAbbr = (monthIndex) => {
  const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];
  
  if (monthIndex instanceof Date) {
    return months[monthIndex.getMonth()] || '';
  }
  
  if (typeof monthIndex === 'number' && monthIndex >= 0 && monthIndex <= 11) {
    return months[monthIndex] || '';
  }
  
  return '';
};

/**
 * Format date with month abbreviation (e.g., "15.12" + "ДЕК")
 * @param {string|Date} date - Date string or Date object
 * @returns {object} Object with { dayMonth: "15.12", month: "ДЕК" }
 */
export const formatDateWithMonth = (date) => {
  if (!date) return { dayMonth: '', month: '' };
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return { dayMonth: '', month: '' };
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const monthAbbr = getMonthAbbr(d);
    
    return {
      dayMonth: `${day}.${month}`,
      month: monthAbbr
    };
  } catch (error) {
    console.error('Date formatting error:', error);
    return { dayMonth: '', month: '' };
  }
};

/**
 * All tier/status options
 */
export const ALL_TIERS = [
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'New',
  'Existing',
  'VIP'
];

