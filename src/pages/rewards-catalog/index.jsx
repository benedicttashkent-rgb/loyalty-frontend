import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../../components/navigation/BrandLogo';
import BottomTabNavigation from '../../components/navigation/BottomTabNavigation';
import PointsBalanceCard from './components/PointsBalanceCard';
import Icon from '../../components/AppIcon';
import RewardCard from './components/RewardCard';
import RedemptionModal from './components/RedemptionModal';
import SuccessModal from './components/SuccessModal';
import { getApiUrl } from '../../config/api';
import LogoLoader from '../../components/LogoLoader';
import { fetchCustomer, fetchContent, readCache, readCachedCustomer } from '../../utils/apiCache';


const mapRewards = (data) => {
  if (!data?.success || !data.rewards) return [];
  return data.rewards.map(reward => {
    // Convert relative image URL to full URL
    let imageUrl = reward.image_url;
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      const apiBase = getApiUrl('').replace('/api', '');
      imageUrl = `${apiBase}${imageUrl}`;
    }

    return {
      id: reward.id,
      title: reward.title,
      description: reward.description,
      imageUrl: imageUrl,
      pointsCost: reward.points_cost,
      tier: reward.tier,
      category: reward.category,
      isFeatured: reward.is_featured,
      stockQuantity: reward.stock_quantity,
      redemptionLimit: reward.redemption_limit,
      validFrom: reward.valid_from,
      validUntil: reward.valid_until,
    };
  });
};

const RewardsCatalog = () => {
  const navigate = useNavigate();
  const [cachedCustomer] = useState(() => readCachedCustomer()?.customer);
  const [cachedRewards] = useState(() => readCache('content/rewards'));
  const [isLoading, setIsLoading] = useState(() => !cachedCustomer || !cachedRewards);
  const [userPoints, setUserPoints] = useState(cachedCustomer?.points || 0);
  const [userTier, setUserTier] = useState(cachedCustomer?.tier || 'Bronze');
  const [favorites, setFavorites] = useState([]);
  const [redemptionModalOpen, setRedemptionModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemedReward, setRedeemedReward] = useState(null);
  const [rewardsData, setRewardsData] = useState(() => mapRewards(cachedRewards));

  // Load rewards and customer data in parallel (cached data is shown instantly)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/signup');
      return;
    }

    const loadCustomer = fetchCustomer(token)
      .then((data) => {
        if (data.success && data.customer) {
          setUserPoints(data.customer.points || 0);
          setUserTier(data.customer.tier || 'Bronze');
        }
      })
      .catch((error) => {
        if (error.status === 401 || error.status === 404) {
          localStorage.removeItem('authToken');
          navigate('/signup');
        } else {
          console.error('Error loading customer:', error);
        }
      });

    const loadRewards = fetchContent('rewards')
      .then((data) => setRewardsData(mapRewards(data)))
      .catch((error) => console.error('Error loading rewards:', error));

    Promise.all([loadCustomer, loadRewards]).finally(() => setIsLoading(false));
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
    return <LogoLoader fullscreen />;
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