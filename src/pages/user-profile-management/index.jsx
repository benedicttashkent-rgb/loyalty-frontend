import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalOverlay from '../../components/navigation/ModalOverlay';
import ProfileHeader from './components/ProfileHeader';
import LoyaltySummary from './components/LoyaltySummary';
import ProfileForm from './components/ProfileForm';
import AccountPreferences from './components/AccountPreferences';
import DangerZone from './components/DangerZone';
import PurchaseHistory from './components/PurchaseHistory';
import { getApiUrl } from '../../config/api';

const UserProfileManagement = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_130f98b20-1763296361147.png",
    avatarAlt: "Profile picture",
    tier: "Bronze"
  });

  const [loyaltyData, setLoyaltyData] = useState({
    totalPoints: 0,
    currentPoints: 0,
    nextTierPoints: 10000000, // 10 million for Bronze -> Silver
    nextTier: "Silver",
    earnedThisMonth: 0,
    memberSince: 0
  });

  const [transactions, setTransactions] = useState([]);

  // Load real customer data
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/signup');
          return;
        }

        // Use AbortController for request cancellation
        const controller = new AbortController();
        const response = await fetch(getApiUrl('customers/me'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.customer) {
            // Format phone for display
            const phone = data.customer.phone;
            let formattedPhone = phone;
            if (phone && phone.startsWith('998') && phone.length === 12) {
              const digits = phone.slice(3);
              formattedPhone = `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
            }

            // Format birthDate from database (YYYY-MM-DD) to input format
            let formattedBirthDate = '';
            if (data.customer.birthDate || data.customer.birth_date) {
              const birthDate = data.customer.birthDate || data.customer.birth_date;
              // If already in YYYY-MM-DD format, use as is
              if (birthDate && birthDate.includes('-')) {
                formattedBirthDate = birthDate;
              } else if (birthDate) {
                // Try to parse other formats
                try {
                  const date = new Date(birthDate);
                  if (!isNaN(date.getTime())) {
                    formattedBirthDate = date.toISOString().split('T')[0];
                  }
                } catch (e) {
                  console.error('Error parsing birthDate:', e);
                }
              }
            }

            setUserData({
              name: `${data.customer.name || ''} ${data.customer.surName || ''}`.trim() || 'Гость',
              email: data.customer.email || '',
              phone: formattedPhone,
              birthDate: formattedBirthDate,
              tier: data.customer.tier || 'Bronze'
            });

            const cashback = data.customer.cashback || data.customer.points || 0;
            const progress = data.customer.progress || { current: 0, next: 10000000, remaining: 10000000 };
            const totalSpent = data.customer.totalSpent || 0;
            
            // Determine next tier and threshold
            let nextTier = 'Silver';
            let nextTierPoints = 10000000; // 10 million for Bronze -> Silver
            if (data.customer.tier === 'Bronze') {
              nextTier = 'Silver';
              nextTierPoints = 10000000;
            } else if (data.customer.tier === 'Silver') {
              nextTier = 'Gold';
              nextTierPoints = 30000000;
            } else if (data.customer.tier === 'Gold') {
              nextTier = 'Platinum';
              nextTierPoints = 60000000;
            } else if (data.customer.tier === 'Platinum') {
              nextTier = null;
              nextTierPoints = null;
            }
            
            // Use progress.current if available, otherwise use totalSpent
            const currentPoints = progress.current || totalSpent || 0;
            
            // Calculate memberSince (months since registration)
            let memberSince = 0;
            if (data.customer.created_at || data.customer.whenRegistered) {
              try {
                const regDate = new Date(data.customer.created_at || data.customer.whenRegistered);
                const now = new Date();
                const monthsDiff = (now.getFullYear() - regDate.getFullYear()) * 12 + 
                                  (now.getMonth() - regDate.getMonth());
                memberSince = Math.max(0, monthsDiff);
              } catch (e) {
                console.error('Error calculating memberSince:', e);
              }
            }
            
            // Calculate earnedThisMonth from purchase_history
            // This will be calculated from purchase_history table if available
            const earnedThisMonth = 0; // TODO: Calculate from purchase_history for current month
            
            setLoyaltyData({
              totalCashback: cashback,
              totalPoints: cashback, // Backward compatibility
              currentPoints: currentPoints,
              nextTierPoints: nextTierPoints,
              nextTier: nextTier,
              earnedThisMonth: earnedThisMonth,
              memberSince: memberSince
            });

          }
        } else if (response.status === 401 || response.status === 404) {
          localStorage.removeItem('authToken');
          navigate('/signup');
        }
      } catch (error) {
        console.error('Error loading customer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomerData();
  }, [navigate]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        navigate(-1);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, navigate]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSaveProfile = async (formData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Требуется авторизация');
        return;
      }

      // Parse name into name and surName
      const nameParts = (formData.name || '').trim().split(' ');
      const name = nameParts[0] || '';
      const surName = nameParts.slice(1).join(' ') || '';

      // Format phone back to 998XXXXXXXXX format
      let phone = formData.phone || '';
      phone = phone.replace(/\s+/g, '').replace('+', '');
      if (phone.startsWith('998')) {
        phone = phone;
      } else {
        phone = '998' + phone;
      }

      const response = await fetch(getApiUrl('customers/me'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          surName,
          birthDate: formData.birthDate,
          phone: phone
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Reload customer data to reflect changes
          window.location.reload(); // Simple reload for now
        } else {
          alert(data.error || 'Ошибка при сохранении профиля');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Ошибка при сохранении профиля');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Ошибка при сохранении профиля');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Ошибка: токен авторизации не найден');
        return;
      }

      const confirmed = window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо. Все ваши данные, кешбэк и история будут удалены навсегда.');
      if (!confirmed) {
        return;
      }

      const response = await fetch(getApiUrl('customers/me'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Clear local storage
          localStorage.removeItem('authToken');
          // Redirect to signup
          navigate('/signup');
          alert('Аккаунт успешно удален');
        } else {
          alert('Ошибка удаления аккаунта: ' + (data.error || 'Неизвестная ошибка'));
        }
      } else {
        const errorData = await response.json();
        alert('Ошибка удаления аккаунта: ' + (errorData.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Ошибка удаления аккаунта: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <ModalOverlay isOpen={isOpen} onClose={handleClose}>
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-6">
            <div className="text-muted-foreground">Загрузка...</div>
          </div>
        </div>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[90vh] overflow-y-auto">
        <ProfileHeader user={userData} onClose={handleClose} />

        <div className="p-6 space-y-4">
          <LoyaltySummary loyaltyData={loyaltyData} />

          <ProfileForm
            user={userData}
            onSave={handleSaveProfile}
            onCancel={handleClose} />



          <AccountPreferences />

          {/* Purchase History */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">История покупок</h3>
            <PurchaseHistory />
          </div>

          <DangerZone onDeleteAccount={handleDeleteAccount} />
        </div>
      </div>
    </ModalOverlay>
    );

};

export default UserProfileManagement;