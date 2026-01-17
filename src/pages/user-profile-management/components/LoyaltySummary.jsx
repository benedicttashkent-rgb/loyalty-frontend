import React from 'react';
import Icon from '../../../components/AppIcon';

const LoyaltySummary = ({ loyaltyData }) => {
  // Use the same logic as LoyaltyPointsCard - use percentage from progress object if available
  // Otherwise calculate from currentPoints and nextTierPoints
  let progressPercentage = 0;
  
  if (loyaltyData?.progress?.percentage !== undefined) {
    // Use percentage directly from API (like LoyaltyPointsCard)
    progressPercentage = Math.min(100, Math.max(0, loyaltyData.progress.percentage));
  } else {
    // Fallback calculation
    const currentPoints = loyaltyData?.currentPoints || 0;
    const nextTierPoints = loyaltyData?.nextTierPoints || 10000000;
    if (nextTierPoints > 0) {
      progressPercentage = Math.min(100, Math.max(0, (currentPoints / nextTierPoints) * 100));
    }
  }
  
  console.log('📊 LoyaltySummary progress:', {
    percentage: progressPercentage,
    progressObject: loyaltyData?.progress,
    currentPoints: loyaltyData?.currentPoints,
    nextTierPoints: loyaltyData?.nextTierPoints
  });

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Программа Лояльности</h3>
        <button
          className="text-primary hover:text-primary/80 transition-smooth"
          aria-label="View loyalty details"
        >
          <Icon name="ChevronRight" size={20} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
            <Icon name="Star" size={20} color="var(--color-primary)" />
          </div>
          <p className="text-2xl font-bold text-foreground">{loyaltyData?.totalCashback?.toLocaleString('ru-RU') || loyaltyData?.totalPoints?.toLocaleString('ru-RU') || '0'}</p>
          <p className="text-xs text-muted-foreground mt-1">Кешбэк</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mx-auto mb-2">
            <Icon name="TrendingUp" size={20} color="var(--color-accent)" />
          </div>
          <p className="text-2xl font-bold text-foreground">{loyaltyData?.earnedThisMonth}</p>
          <p className="text-xs text-muted-foreground mt-1">За Месяц</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-full mx-auto mb-2">
            <Icon name="Calendar" size={20} color="var(--color-success)" />
          </div>
          <p className="text-2xl font-bold text-foreground">{loyaltyData?.memberSince}</p>
          <p className="text-xs text-muted-foreground mt-1">Месяцев</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {loyaltyData?.nextTier ? `До ${loyaltyData.nextTier}` : 'Максимальный уровень'}
          </span>
          <span className="font-medium text-foreground">
            {loyaltyData?.nextTier 
              ? `${((loyaltyData?.currentPoints || 0) / 1000000).toFixed(1)} / ${((loyaltyData?.nextTierPoints || 10000000) / 1000000).toFixed(1)} млн сум`
              : '—'}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoyaltySummary;