import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomTabNavigation from '../../components/navigation/BottomTabNavigation';
import ProfileButton from '../../components/navigation/ProfileButton';
import ModalOverlay from '../../components/navigation/ModalOverlay';
import BrandLogo from '../../components/navigation/BrandLogo';
import LoyaltyPointsCard from './components/LoyaltyPointsCard';
import QRCodeButton from './components/QRCodeButton';
import NewsBanner from './components/NewsBanner';
import SpecialOffersStrip from './components/SpecialOffersStrip';
import OrderSection from './components/OrderSection';
import LoyaltyDetailsModal from './components/LoyaltyDetailsModal';
import QRCodeModal from './components/QRCodeModal';
import BookTableModal from './components/BookTableModal';
import { getApiUrl } from '../../config/api';
import LogoLoader from '../../components/LogoLoader';
import { fetchCustomer, readCachedCustomer } from '../../utils/apiCache';

// Tier thresholds (total spent) for the next level
const NEXT_TIER_THRESHOLD = {
  Bronze: 10000000,
  Silver: 30000000,
  Gold: 60000000,
  Platinum: null,
};

const formatPhone = (phone) => {
  if (phone && phone.startsWith('998') && phone.length === 12) {
    // Format 998XXXXXXXXX to +998 XX XXX XX XX
    const digits = phone.slice(3);
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
  }
  return phone;
};

const toUserData = (data) => {
  if (!data?.success || !data.customer) return null;
  const customer = data.customer;
  const tier = customer.tier || 'Bronze';
  const nextThreshold = NEXT_TIER_THRESHOLD[tier] ?? null;
  const totalSpent = typeof customer.totalSpent === 'number' && !isNaN(customer.totalSpent) ? customer.totalSpent : 0;
  // Always recalculate remaining locally in case the backend sends a wrong value
  const remaining = nextThreshold ? Math.max(0, nextThreshold - totalSpent) : 0;

  return {
    id: customer.id,
    name: `${customer.name} ${customer.surName || ''}`.trim(),
    email: customer.email || '',
    phone: formatPhone(customer.phone),
    cashback: customer.cashback || customer.points || 0,
    cashbackPercent: customer.cashbackPercent || 2,
    points: customer.points || customer.cashback || 0, // Backward compatibility
    tier,
    progress: {
      current: totalSpent,
      next: nextThreshold,
      remaining,
      percentage: nextThreshold ? Math.min(100, (totalSpent / nextThreshold) * 100) : 100
    }
  };
};

const getTelegramChatId = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return null;
  try {
    tg.ready();
    tg.expand();
  } catch (e) {
    console.error('[home-dashboard] Error initializing Telegram Web App:', e);
  }
  // Private chats: user.id is the chat_id. Group chats: chat.id.
  return tg.initDataUnsafe?.user?.id || tg.initDataUnsafe?.chat?.id || null;
};

// Save the Telegram chat ID once per session, without blocking page load
let telegramChatIdSaved = false;
const saveTelegramChatId = (token, telegramChatId) => {
  if (telegramChatIdSaved || !telegramChatId) return;
  telegramChatIdSaved = true;
  fetch(getApiUrl('customers/me/telegram-chat-id'), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ telegramChatId: String(telegramChatId) }),
  })
    .then((response) => {
      if (!response.ok) {
        telegramChatIdSaved = false;
        console.error('[home-dashboard] Failed to save Telegram chat ID:', response.status);
      }
    })
    .catch((err) => {
      telegramChatIdSaved = false;
      console.error('[home-dashboard] Failed to save Telegram chat ID:', err);
    });
};

const HomeDashboard = () => {
  const navigate = useNavigate();
  const [showLoyaltyDetails, setShowLoyaltyDetails] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showBookTable, setShowBookTable] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userData, setUserData] = useState(() => toUserData(readCachedCustomer()));
  const [isLoading, setIsLoading] = useState(() => !userData);

  // Load real customer data (cached data is shown instantly, this refreshes it)
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

    // Refresh data when page becomes visible (user returns to app)
    const handleVisibilityChange = () => {
      if (!document.hidden) loadCustomerData();
    };

    // Refresh data periodically to catch purchase updates
    const refreshInterval = setInterval(() => {
      if (!document.hidden) loadCustomerData();
    }, 30000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadCustomerData]);

  useEffect(() => {
    const savedCart = localStorage.getItem('benedictCart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      const totalItems = cart?.reduce((sum, item) => sum + item?.quantity, 0);
      setCartCount(totalItems);
    }
  }, []);

  // Show loading state while fetching data
  if (isLoading) {
    return <LogoLoader fullscreen />;
  }

  // Show error if no user data
  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">Ошибка загрузки данных</div>
          <button 
            onClick={() => navigate('/signup')}
            className="text-primary hover:underline"
          >
            Вернуться к регистрации
          </button>
        </div>
      </div>
    );
  }

  const handleProfileClick = () => {
    navigate('/user-profile-management');
  };

  const handleRewardClick = (reward) => {
    if (userData?.points >= reward?.points) {
      navigate('/rewards-catalog');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="main-content max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <BrandLogo />
          <ProfileButton onClick={handleProfileClick} />
        </div>

        <div className="space-y-6">
          <LoyaltyPointsCard
            cashback={userData?.cashback}
            cashbackPercent={userData?.cashbackPercent}
            tier={userData?.tier}
            progress={userData?.progress}
            onDetailsClick={() => setShowLoyaltyDetails(true)} />

          <QRCodeButton onClick={() => setShowQRCode(true)} />

          <NewsBanner userTier={userData?.tier} />

          <SpecialOffersStrip userTier={userData?.tier} />

          <OrderSection onBookTableClick={() => setShowBookTable(true)} />
        </div>
      </div>
      <BottomTabNavigation cartCount={cartCount} />
      <ModalOverlay isOpen={showLoyaltyDetails} onClose={() => setShowLoyaltyDetails(false)}>
        <LoyaltyDetailsModal
          isOpen={showLoyaltyDetails}
          onClose={() => setShowLoyaltyDetails(false)}
          userData={userData}
          />

      </ModalOverlay>
      <ModalOverlay isOpen={showQRCode} onClose={() => setShowQRCode(false)}>
        <QRCodeModal
          isOpen={showQRCode}
          onClose={() => setShowQRCode(false)}
          userData={userData} />

      </ModalOverlay>
      <ModalOverlay isOpen={showBookTable} onClose={() => setShowBookTable(false)}>
        <BookTableModal
          isOpen={showBookTable}
          onClose={() => setShowBookTable(false)} />

      </ModalOverlay>
    </div>);

};

export default HomeDashboard;