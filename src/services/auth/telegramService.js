/**
 * Telegram Web App Service
 * Handles Telegram Web App integration
 */

class TelegramService {
  constructor() {
    this.tg = null;
    this.isAvailable = false;
    this.init();
  }

  init() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.tg = window.Telegram.WebApp;
      this.isAvailable = true;
      this.tg.ready();
      this.tg.expand();
    }
  }

  /**
   * Check if app is opened from Telegram
   */
  isTelegram() {
    return this.isAvailable;
  }

  /**
   * Get Telegram user data
   */
  getUser() {
    if (!this.isAvailable) return null;
    return this.tg.initDataUnsafe?.user || null;
  }

  /**
   * Get Telegram user phone (if available)
   */
  getPhone() {
    const user = this.getUser();
    return user?.phone_number || null;
  }

  /**
   * Show main button
   */
  showMainButton(text, onClick) {
    if (!this.isAvailable) return;
    this.tg.MainButton.setText(text);
    this.tg.MainButton.show();
    this.tg.MainButton.onClick(onClick);
  }

  /**
   * Hide main button
   */
  hideMainButton() {
    if (!this.isAvailable) return;
    this.tg.MainButton.hide();
  }

  /**
   * Show back button
   */
  showBackButton(onClick) {
    if (!this.isAvailable) return;
    this.tg.BackButton.show();
    this.tg.BackButton.onClick(onClick);
  }

  /**
   * Hide back button
   */
  hideBackButton() {
    if (!this.isAvailable) return;
    this.tg.BackButton.hide();
  }

  /**
   * Close Web App
   */
  close() {
    if (!this.isAvailable) return;
    this.tg.close();
  }

  /**
   * Set theme params
   */
  setThemeParams(params) {
    if (!this.isAvailable) return;
    this.tg.setHeaderColor(params.headerColor);
    this.tg.setBackgroundColor(params.backgroundColor);
  }
}

export const telegramService = new TelegramService();
export default telegramService;

