import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/navigation/PageHeader';
import BottomTabNavigation from '../../components/navigation/BottomTabNavigation';
import ModalOverlay from '../../components/navigation/ModalOverlay';
import Icon from '../../components/AppIcon';
import MembershipCard from './components/MembershipCard';
import RewardCard from './components/RewardCard';
import RedemptionModal from './components/RedemptionModal';
import SuccessModal from './components/SuccessModal';
import QRCodeModal from './components/QRCodeModal';
import LoyaltyDetailsModal from './components/LoyaltyDetailsModal';
import useCustomer from '../../hooks/useCustomer';
import { getApiUrl } from '../../config/api';
import { fetchContent, readCache } from '../../utils/apiCache';

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
  const { userData, isLoading: isCustomerLoading } = useCustomer();
  const [cachedRewards] = useState(() => readCache('content/rewards'));
  const [rewardsData, setRewardsData] = useState(() => mapRewards(cachedRewards));
  const [isRewardsLoading, setIsRewardsLoading] = useState(() => !cachedRewards);
  const [spentPoints, setSpentPoints] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showLoyaltyDetails, setShowLoyaltyDetails] = useState(false);
  const [redemptionModalOpen, setRedemptionModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemedReward, setRedeemedReward] = useState(null);

  const userPoints = Math.max(0, (userData?.points || 0) - spentPoints);

  // Cached rewards are shown instantly, this refreshes them
  useEffect(() => {
    fetchContent('rewards')
      .then((data) => setRewardsData(mapRewards(data)))
      .catch((error) => console.error('Error loading rewards:', error))
      .finally(() => setIsRewardsLoading(false));
  }, []);

  const handleRedeem = (reward) => {
    setSelectedReward(reward);
    setRedemptionModalOpen(true);
  };

  const handleConfirmRedemption = (reward) => {
    setSpentPoints((prev) => prev + (reward?.pointsCost || 0));
    setRedeemedReward(reward);
    setRedemptionModalOpen(false);
    setSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="main-content max-w-md mx-auto">
        <PageHeader title="Награды" subtitle={userData?.name || undefined} />

        {isCustomerLoading && !userData ? (
          <div className="h-[340px] rounded-3xl bg-muted animate-pulse" />
        ) : (
          <MembershipCard
            userData={userData}
            onShowQR={() => setShowQRCode(true)}
            onShowDetails={() => setShowLoyaltyDetails(true)}
          />
        )}

        <section className="mt-8">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl text-foreground">Каталог наград</h2>
            <span className="text-sm text-muted-foreground">
              {userPoints.toLocaleString('ru-RU')} баллов
            </span>
          </div>

          {isRewardsLoading && rewardsData.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 rounded-2xl border border-border p-3 animate-pulse">
                  <div className="w-24 h-24 rounded-xl bg-muted" />
                  <div className="flex-1 py-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded-full" />
                    <div className="h-3 w-1/2 bg-muted rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : rewardsData.length > 0 ? (
            <div className="space-y-3">
              {rewardsData.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userPoints={userPoints}
                  onRedeem={handleRedeem}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center">
              <Icon name="Gift" size={28} className="mx-auto text-primary mb-3" />
              <p className="font-medium text-foreground">Наград пока нет</p>
              <p className="text-sm text-muted-foreground mt-1">Копите кешбэк — скоро здесь появятся подарки</p>
            </div>
          )}
        </section>
      </div>

      <BottomTabNavigation />

      <ModalOverlay isOpen={showQRCode} onClose={() => setShowQRCode(false)}>
        <QRCodeModal isOpen={showQRCode} onClose={() => setShowQRCode(false)} userData={userData} />
      </ModalOverlay>
      <ModalOverlay isOpen={showLoyaltyDetails} onClose={() => setShowLoyaltyDetails(false)}>
        <LoyaltyDetailsModal isOpen={showLoyaltyDetails} onClose={() => setShowLoyaltyDetails(false)} userData={userData} />
      </ModalOverlay>
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
    </div>
  );
};

export default RewardsCatalog;
