import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../../components/navigation/BrandLogo';
import BottomTabNavigation from '../../components/navigation/BottomTabNavigation';
import PointsBalanceCard from './components/PointsBalanceCard';
import Icon from '../../components/AppIcon';
import RewardCard from './components/RewardCard';
import RedemptionModal from './components/RedemptionModal';
import SuccessModal from './components/SuccessModal';


const RewardsCatalog = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [userTier, setUserTier] = useState('Bronze');
  const [favorites, setFavorites] = useState([]);
  const [redemptionModalOpen, setRedemptionModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemedReward, setRedeemedReward] = useState(null);
  const [rewardsData, setRewardsData] = useState([]);

  // Load rewards and customer data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/signup');
          return;
        }

        // Load customer data
        const customerResponse = await fetch('/api/customers/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          if (customerData.success && customerData.customer) {
            setUserPoints(customerData.customer.points || 0);
            setUserTier(customerData.customer.tier || 'Bronze');
          }
        } else if (customerResponse.status === 401 || customerResponse.status === 404) {
          localStorage.removeItem('authToken');
          navigate('/signup');
          return;
        }

        // Load rewards from API
        const rewardsResponse = await fetch('/api/content/rewards');
        if (rewardsResponse.ok) {
          const rewardsData = await rewardsResponse.json();
          if (rewardsData.success && rewardsData.rewards) {
            // Map API data to component format
            const mappedRewards = rewardsData.rewards.map(reward => ({
              id: reward.id,
              title: reward.title,
              description: reward.description,
              imageUrl: reward.image_url,
              pointsCost: reward.points_cost,
              tier: reward.tier,
              category: reward.category,
              isFeatured: reward.is_featured,
              stockQuantity: reward.stock_quantity,
              redemptionLimit: reward.redemption_limit,
              validFrom: reward.valid_from,
              validUntil: reward.valid_until,
            }));
            setRewardsData(mappedRewards);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleFavorite = (rewardId) => {
    setFavorites((prev) =>
    prev?.includes(rewardId) ?
    prev?.filter((id) => id !== rewardId) :
    [...prev, rewardId]
    );
  };

  const handleRedeem = (reward) => {
    setSelectedReward(reward);
    setRedemptionModalOpen(true);
  };

  const handleConfirmRedemption = (reward) => {
    setUserPoints((prev) => prev - reward?.pointsCost);
    setRedeemedReward(reward);
    setRedemptionModalOpen(false);
    setSuccessModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="main-content max-w-7xl mx-auto">
        <div className="mb-6">
          <BrandLogo />
        </div>

        <PointsBalanceCard points={userPoints} tier={userTier} />

        {rewardsData && rewardsData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewardsData.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userPoints={userPoints}
                onRedeem={handleRedeem}
                onFavorite={handleFavorite}
                isFavorited={favorites.includes(reward.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Icon name="Gift" size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Каталог наград пуст</p>
              <p className="text-sm">Награды появятся здесь позже</p>
              <p className="text-xs text-muted-foreground mt-2">Администратор может добавить награды через админ-панель</p>
            </div>
          </div>
        )}
      </div>
      <BottomTabNavigation />
      <RedemptionModal
        isOpen={redemptionModalOpen}
        onClose={() => setRedemptionModalOpen(false)}
        reward={selectedReward}
        userPoints={userPoints}
        onConfirm={handleConfirmRedemption} />

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        reward={redeemedReward}
        newBalance={userPoints} />

    </div>);

};

export default RewardsCatalog;