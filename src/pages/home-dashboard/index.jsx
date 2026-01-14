import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomTabNavigation from '../../components/navigation/BottomTabNavigation';
import ProfileButton from '../../components/navigation/ProfileButton';
import ModalOverlay from '../../components/navigation/ModalOverlay';
import BrandLogo from '../../components/navigation/BrandLogo';
import LoyaltyPointsCard from './components/LoyaltyPointsCard';
import QRCodeButton from './components/QRCodeButton';
import NewsBanner from './components/NewsBanner';
import OrderSection from './components/OrderSection';
import LoyaltyDetailsModal from './components/LoyaltyDetailsModal';
import QRCodeModal from './components/QRCodeModal';
import BookTableModal from './components/BookTableModal';
import { getApiUrl } from '../../config/api';

const HomeDashboard = () => {
  const navigate = useNavigate();
  const [showLoyaltyDetails, setShowLoyaltyDetails] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showBookTable, setShowBookTable] = useState(false);
  const [showNewsBanner, setShowNewsBanner] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load real customer data
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          // No token, redirect to signup
          navigate('/signup');
          return;
        }

        // Check if opened from Telegram and update telegram_chat_id if needed
        let telegramChatId = null;
        if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          telegramChatId = tg.initDataUnsafe?.chat?.id || tg.initDataUnsafe?.user?.id || null;
          
          if (telegramChatId) {
            // Update telegram_chat_id in background (non-blocking)
            fetch(getApiUrl('customers/me/telegram-chat-id'), {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ telegramChatId: telegramChatId.toString() }),
            }).catch(err => {
              console.log('⚠️ Failed to update telegram_chat_id (non-blocking):', err);
            });
          }
        }

        const response = await fetch(getApiUrl('customers/me'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            ...(telegramChatId && { 'X-Telegram-Chat-Id': telegramChatId.toString() }),
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 API Response /api/customers/me:', data);
          if (data.success && data.customer) {
            console.log('🔍 Customer data:', {
              cashback: data.customer.cashback,
              totalSpent: data.customer.totalSpent,
              tier: data.customer.tier,
              progress: data.customer.progress
            });
            
            // Format phone for display
            const phone = data.customer.phone;
            let formattedPhone = phone;
            if (phone && phone.startsWith('998') && phone.length === 12) {
              // Format 998XXXXXXXXX to +998 XX XXX XX XX
              const digits = phone.slice(3); // Remove 998 prefix
              formattedPhone = `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
            }
            
            // Extract progress data
            const totalSpent = data.customer.totalSpent || 0;
            const tier = data.customer.tier || 'Bronze';
            
            // Calculate next threshold based on tier
            let nextThreshold = null;
            if (tier === 'Bronze') {
              nextThreshold = 10000000; // 10 million to reach Silver
            } else if (tier === 'Silver') {
              nextThreshold = 30000000; // 30 million to reach Gold
            } else if (tier === 'Gold') {
              nextThreshold = 60000000; // 60 million to reach Platinum
            } else if (tier === 'Platinum') {
              nextThreshold = null; // Max level
            }
            
            // ALWAYS recalculate remaining from next - current
            // This ensures correctness even if backend sends wrong value
            const remaining = nextThreshold ? Math.max(0, nextThreshold - totalSpent) : 0;

            // Hide news banner after first purchase
            const hasMadePurchase = totalSpent > 0 || !!data.customer.lastProcessedOrderDate;
            setShowNewsBanner(!hasMadePurchase);
            
            console.log('✅ Frontend progress calculation:', {
              totalSpent,
              tier,
              nextThreshold,
              remaining,
              backendProgress: data.customer.progress
            });
            
            setUserData({
              id: data.customer.id,
              name: `${data.customer.name} ${data.customer.surName || ''}`.trim(),
              email: data.customer.email || '',
              phone: formattedPhone,
              cashback: data.customer.cashback || data.customer.points || 0,
              cashbackPercent: data.customer.cashbackPercent || 2,
              points: data.customer.points || data.customer.cashback || 0, // Backward compatibility
              tier: tier,
              progress: {
                current: totalSpent,
                next: nextThreshold,
                remaining: remaining, // Always use recalculated value
                percentage: nextThreshold ? Math.min(100, (totalSpent / nextThreshold) * 100) : 100
              }
            });
            
            // Load transactions from API
            try {
              const transResponse = await fetch(getApiUrl('customers/me/transactions'), {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              
              if (transResponse.ok) {
                const transData = await transResponse.json();
                if (transData.success && transData.transactions && transData.transactions.length > 0) {
                  setTransactions(transData.transactions);
                } else {
                  // If no transactions, show welcome message for new customers
                  if ((data.customer.cashback || data.customer.points || 0) === 0) {
                    setTransactions([{
                      id: 'welcome',
                      type: 'bonus',
                      description: 'Добро пожаловать в программу лояльности!',
                      points: 0,
                      date: new Date().toISOString()
                    }]);
                  } else {
                    setTransactions([]);
                  }
                }
              } else {
                setTransactions([]);
              }
            } catch (transError) {
              console.error('Error loading transactions:', transError);
              setTransactions([]);
            }
          } else {
            // No customer data in response
            console.error('No customer data in response:', data);
            localStorage.removeItem('authToken');
            navigate('/signup');
          }
        } else if (response.status === 401 || response.status === 404) {
          // Token expired or customer not found, redirect to signup
          console.error('Auth error:', response.status);
          localStorage.removeItem('authToken');
          localStorage.removeItem('customerId');
          localStorage.removeItem('customerPhone');
          localStorage.removeItem('customerName');
          navigate('/signup');
        } else {
          // Other error
          const errorData = await response.json().catch(() => ({}));
          console.error('Error loading customer:', errorData);
          // Don't redirect, show error message
        }
      } catch (error) {
        console.error('Error loading customer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomerData();
  }, [navigate]);

  // Featured rewards removed - will be loaded from API when available
  // const featuredRewards = [];


  const [transactions, setTransactions] = useState([]);


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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Загрузка...</div>
        </div>
      </div>
    );
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

          {showNewsBanner &&
          <NewsBanner onClose={() => setShowNewsBanner(false)} />
          }

          <OrderSection onBookTableClick={() => setShowBookTable(true)} />
        </div>
      </div>
      <BottomTabNavigation cartCount={cartCount} />
      <ModalOverlay isOpen={showLoyaltyDetails} onClose={() => setShowLoyaltyDetails(false)}>
        <LoyaltyDetailsModal
          isOpen={showLoyaltyDetails}
          onClose={() => setShowLoyaltyDetails(false)}
          userData={userData}
          transactions={transactions} />

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