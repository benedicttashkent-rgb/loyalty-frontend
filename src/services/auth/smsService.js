/**
 * SMS Service
 * Handles OTP generation and verification
 * This should be connected to your backend API
 */
import { getApiUrl } from '../../config/api';

class SMSService {
  /**
   * Send OTP to phone number
   * @param {string} phone - Phone number in international format
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async sendOTP(phone) {
    try {
      const response = await fetch(getApiUrl('auth/send-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка соединения с сервером',
      };
    }
  }

  /**
   * Verify OTP code
   * @param {string} phone - Phone number
   * @param {string} otp - OTP code
   * @returns {Promise<{success: boolean, error?: string, token?: string}>}
   */
  async verifyOTP(phone, otp) {
    try {
      const response = await fetch(getApiUrl('auth/verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка верификации',
      };
    }
  }
}

export const smsService = new SMSService();
export default smsService;

