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
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/signup');
          return;
        }

        const response = await fetch(getApiUrl('customers/me'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
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

            setUserData({
              name: `${data.customer.name || ''} ${data.customer.surName || ''}`.trim() || 'Гость',
              email: data.customer.email || '',
              phone: formattedPhone,
              birthDate: data.customer.birthDate || '',
              tier: data.customer.tier || 'Bronze'
            });

            const cashback = data.customer.cashback || data.customer.points || 0;
            const progress = data.customer.progress || { current: 0, next: 10000000, remaining: 10000000 };
            
            // Determine next tier
            let nextTier = 'Silver';
            if (data.customer.tier === 'Bronze') nextTier = 'Silver';
            else if (data.customer.tier === 'Silver') nextTier = 'Gold';
            else if (data.customer.tier === 'Gold') nextTier = 'Platinum';
            else if (data.customer.tier === 'Platinum') nextTier = null;
            
            // Calculate memberSince (months since registration)
            // Assuming we have whenRegistered from iiko or can calculate from customer creation
            const memberSince = 0; // Will be calculated when we have registration date
            
            // Calculate earnedThisMonth from transactions (if available)
            // For now, use 0 if no transactions available
            const earnedThisMonth = 0; // Will be calculated from transactions when available
            
            setLoyaltyData({
              totalCashback: cashback,
              totalPoints: cashback, // Backward compatibility
              currentPoints: progress.current || 0,
              nextTierPoints: progress.next || 10000000,
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

  const handleSaveProfile = (formData) => {
    console.log('Profile saved:', formData);
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