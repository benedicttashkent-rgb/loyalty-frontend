import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCustomer, readCachedCustomer } from '../utils/apiCache';
import { toUserData, getTelegramChatId, saveTelegramChatId } from '../utils/customer';

// Loads the signed-in customer. Shows cached data instantly, refreshes in the
// background, sends signed-out users to /signup and saves the Telegram chat ID.
const useCustomer = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(() => toUserData(readCachedCustomer()));
  const [isLoading, setIsLoading] = useState(() => !userData);

  const loadCustomerData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/signup');
      return;
    }

    const telegramChatId = getTelegramChatId();
    saveTelegramChatId(token, telegramChatId);

    try {
      const data = await fetchCustomer(token, telegramChatId ? { 'X-Telegram-Chat-Id': String(telegramChatId) } : {});
      const nextUserData = toUserData(data);
      if (nextUserData) {
        setUserData(nextUserData);
      } else {
        console.error('No customer data in response:', data);
        localStorage.removeItem('authToken');
        navigate('/signup');
      }
    } catch (error) {
      if (error.status === 401 || error.status === 404) {
        // Token expired or customer not found
        localStorage.removeItem('authToken');
        localStorage.removeItem('customerId');
        localStorage.removeItem('customerPhone');
        localStorage.removeItem('customerName');
        navigate('/signup');
      } else {
        console.error('Error loading customer data:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadCustomerData();

    // Refresh when the user returns to the app
    const handleVisibilityChange = () => {
      if (!document.hidden) loadCustomerData();
    };

    // Refresh periodically to catch purchase updates
    const refreshInterval = setInterval(() => {
      if (!document.hidden) loadCustomerData();
    }, 30000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadCustomerData]);

  return { userData, isLoading };
};

export default useCustomer;
