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
import DebugPanel from '../../components/DebugPanel.jsx';
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

      // ============================================
      // GET TELEGRAM CHAT ID AND UPDATE DATABASE
      // ============================================
      let telegramChatId = null;
      
      // Wait a bit for Telegram Web App to initialize (if needed)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if running in Telegram Web App
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // CRITICAL: Initialize Web App first
        try {
          tg.ready();
          tg.expand(); // This expands the Web App and makes initData available
        } catch (e) {
          console.error('❌ [home-dashboard] Error initializing Telegram Web App:', e);
        }
        
        console.log('📱 [home-dashboard] ===== TELEGRAM WEB APP DETECTED =====');
        console.log('   Version:', tg.version);
        console.log('   Platform:', tg.platform);
        console.log('   initDataUnsafe exists:', !!tg.initDataUnsafe);
        console.log('   initDataUnsafe keys:', tg.initDataUnsafe ? Object.keys(tg.initDataUnsafe) : 'N/A');
        
        // Get user data (THIS IS THE CHAT ID FOR PRIVATE MESSAGES)
        const user = tg.initDataUnsafe?.user;
        const chat = tg.initDataUnsafe?.chat;
        
        console.log('   User object:', user);
        console.log('   Chat object:', chat);
        
        // For PRIVATE chats: user.id IS the chat_id (this is what we need!)
        // For GROUP chats: chat.id is the chat_id
        if (user?.id) {
          telegramChatId = user.id;
          console.log('✅ [home-dashboard] FOUND CHAT ID from user.id:', telegramChatId);
          console.log('   User:', user.first_name, user.last_name);
          console.log('   Username:', user.username);
        } else if (chat?.id) {
          telegramChatId = chat.id;
          console.log('✅ [home-dashboard] FOUND CHAT ID from chat.id:', telegramChatId);
        } else {
          console.error('❌ [home-dashboard] NO CHAT ID FOUND!');
          console.error('   user:', user);
          console.error('   chat:', chat);
          console.error('   Full initDataUnsafe:', JSON.stringify(tg.initDataUnsafe, null, 2));
        }
        
        // Update telegram_chat_id in database
        if (telegramChatId && token) {
          console.log('📱 [home-dashboard] ===== UPDATING TELEGRAM CHAT ID =====');
          console.log('   Chat ID to save:', telegramChatId);
          console.log('   Token exists:', !!token);
          
          try {
            const apiUrl = getApiUrl('customers/me/telegram-chat-id');
            console.log('   API URL:', apiUrl);
            
            const requestBody = { 
              telegramChatId: String(telegramChatId)
            };
            console.log('   Request body:', JSON.stringify(requestBody));
            
            const updateResponse = await fetch(apiUrl, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            });
            
            console.log('📱 [home-dashboard] API Response status:', updateResponse.status);
            console.log('📱 [home-dashboard] API Response ok:', updateResponse.ok);
            
            if (!updateResponse.ok) {
              const errorText = await updateResponse.text();
              console.error('❌ [home-dashboard] API ERROR:', errorText);
              try {
                const errorData = JSON.parse(errorText);
                console.error('   Parsed error:', errorData);
              } catch (e) {
                console.error('   Raw error text:', errorText);
              }
            } else {
              const updateData = await updateResponse.json();
              console.log('📱 [home-dashboard] API SUCCESS:', updateData);
              
              if (updateData.success) {
                console.log('✅✅✅ [home-dashboard] TELEGRAM CHAT ID SAVED:', telegramChatId);
              } else {
                console.error('❌ [home-dashboard] Update returned success: false');
                console.error('   Response:', updateData);
              }
            }
          } catch (updateErr) {
            console.error('❌ [home-dashboard] FETCH ERROR:', updateErr);
            console.error('   Error message:', updateErr.message);
            console.error('   Error stack:', updateErr.stack);
          }
        } else {
          if (!telegramChatId) {
            console.error('❌ [home-dashboard] No telegramChatId to save');
          }
          if (!token) {
            console.error('❌ [home-dashboard] No auth token available');
          }
        }
      } else {
        console.log('⚠️⚠️⚠️ [home-dashboard] NOT IN TELEGRAM WEB APP');
        console.log('   window.Telegram exists:', !!window.Telegram);
        console.log('   window.Telegram?.WebApp exists:', !!window.Telegram?.WebApp);
        console.log('   User must open app through Telegram bot to capture chat_id');
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
      <DebugPanel />
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