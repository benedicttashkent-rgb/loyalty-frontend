import React, { useState, useEffect, useCallback } from 'react';
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
  const loadCustomerData = useCallback(async () => {
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
          console.log('📱 [home-dashboard] Detected Telegram Web App');
          console.log('   Chat ID from chat:', tg.initDataUnsafe?.chat?.id);
          console.log('   Chat ID from user:', tg.initDataUnsafe?.user?.id);
          console.log('   Using chat_id:', telegramChatId);
          
          // Update telegram_chat_id - send initData for validation
          try {
            const apiUrl = getApiUrl('customers/me/telegram-chat-id');
            const initData = tg.initData; // Get raw initData string for validation
            
            console.log('📱 [home-dashboard] Calling API to update telegram_chat_id');
            console.log('   API URL:', apiUrl);
            console.log('   Chat ID:', telegramChatId.toString());
            console.log('   Has initData:', !!initData);
            
            const updateResponse = await fetch(apiUrl, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                initData: initData || null, // Send initData for validation
                telegramChatId: telegramChatId.toString() // Fallback if initData not available
              }),
            });
            
            console.log('📱 [home-dashboard] API Response status:', updateResponse.status);
            
            const updateData = await updateResponse.json();
            console.log('📱 [home-dashboard] API Response data:', updateData);
            
            if (updateResponse.ok && updateData.success) {
              console.log('✅ [home-dashboard] Successfully updated telegram_chat_id:', telegramChatId);
            } else {
              console.error('❌ [home-dashboard] Failed to update telegram_chat_id');
              console.error('   Status:', updateResponse.status);
              console.error('   Response:', updateData);
            }
          } catch (updateErr) {
            console.error('❌ [home-dashboard] Error updating telegram_chat_id:', updateErr);
            console.error('   Error details:', updateErr.message);
          }
        } else {
          console.log('⚠️ [home-dashboard] No telegramChatId detected');
          console.log('   window.Telegram?.WebApp exists:', !!window.Telegram?.WebApp);
          console.log('   initDataUnsafe:', tg?.initDataUnsafe);
        }
      } else {
        console.log('⚠️ [home-dashboard] Not opened from Telegram Web App');
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
          
          // CRITICAL: Ensure totalSpent is a number and not null/undefined
          const safeTotalSpent = typeof totalSpent === 'number' && !isNaN(totalSpent) ? totalSpent : 0;
          const safeRemaining = nextThreshold ? Math.max(0, nextThreshold - safeTotalSpent) : 0;
          
          console.log('✅ Frontend progress calculation:', {
            totalSpent: safeTotalSpent,
            tier,
            nextThreshold,
            remaining: safeRemaining,
            calculation: nextThreshold ? `${nextThreshold} - ${safeTotalSpent} = ${safeRemaining}` : 'N/A',
            backendProgress: data.customer.progress,
            backendTotalSpent: data.customer.totalSpent
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
              current: safeTotalSpent, // Use safe value
              next: nextThreshold,
              remaining: safeRemaining, // Always use recalculated value
              percentage: nextThreshold ? Math.min(100, (safeTotalSpent / nextThreshold) * 100) : 100
            }
          });
          
          // Load transactions from API
          try {
            console.log('📊 [home-dashboard] Fetching transaction history...');
            const transResponse = await fetch(getApiUrl('customers/me/transactions'), {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            console.log('📊 [home-dashboard] Transaction history response status:', transResponse.status);
            
            if (transResponse.ok) {
              const transData = await transResponse.json();
              console.log('📊 [home-dashboard] Transaction history response:', transData);
              
              if (transData.success && transData.transactions && transData.transactions.length > 0) {
                console.log(`✅ [home-dashboard] Loaded ${transData.transactions.length} transactions`);
                setTransactions(transData.transactions);
              } else {
                console.log('📊 [home-dashboard] No transactions found');
                console.log('   Response success:', transData.success);
                console.log('   Transactions array:', transData.transactions);
                console.log('   Transactions length:', transData.transactions?.length);
                
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
              const errorData = await transResponse.json().catch(() => ({}));
              console.error('❌ [home-dashboard] Failed to load transaction history');
              console.error('   Status:', transResponse.status);
              console.error('   Response:', errorData);
              setTransactions([]);
            }
          } catch (transError) {
            console.error('❌ [home-dashboard] Error loading transactions:', transError);
            console.error('   Error message:', transError.message);
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
  }, [navigate]);

  useEffect(() => {
    loadCustomerData();

    // Refresh data when page becomes visible (user returns to app)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page visible - refreshing customer data...');
        loadCustomerData();
      }
    };

    // Refresh data periodically (every 30 seconds) to catch purchase updates
    const refreshInterval = setInterval(() => {
      if (!document.hidden) {
        console.log('🔄 Periodic refresh - updating customer data...');
        loadCustomerData();
      }
    }, 30000); // 30 seconds

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadCustomerData]);

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