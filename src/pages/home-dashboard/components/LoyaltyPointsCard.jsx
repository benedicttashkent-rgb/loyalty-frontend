import React from 'react';
import Icon from '../../../components/AppIcon';

const LoyaltyPointsCard = ({ cashback, cashbackPercent, tier, progress, onDetailsClick }) => {
  // For backward compatibility, use cashback if points not provided
  const displayCashback = cashback !== undefined ? cashback : 0;
  const displayPercent = cashbackPercent !== undefined ? cashbackPercent : 2;
  
  // Debug: log progress values (only log when values change to reduce spam)
  React.useEffect(() => {
    console.log('🔍 LoyaltyPointsCard Debug:', {
      cashback: displayCashback,
      cashbackPercent: displayPercent,
      tier: tier,
      progress: progress,
      remaining: progress?.remaining,
      current: progress?.current,
      next: progress?.next,
      calculation: progress?.next && progress?.current ? `${progress.next} - ${progress.current} = ${progress.next - progress.current}` : 'N/A'
    });
  }, [displayCashback, displayPercent, tier, progress?.remaining, progress?.current, progress?.next]);
  
  const getTierColor = (tierName) => {
    switch (tierName) {
      case 'Platinum':
        return 'from-[#e5e4e2] to-[#b8b8b8]'; // Platinum gray
      case 'Gold':
        return 'from-[#d4a574] to-[#8a7560]';
      case 'Silver':
        return 'from-[#c0c0c0] to-[#808080]';
      default:
        return 'from-[#cd7f32] to-[#8b4513]'; // Bronze
    }
  };

  const getTierIcon = (tierName) => {
    switch (tierName) {
      case 'Platinum':
        return 'Crown';
      case 'Gold':
        return 'Award';
      case 'Silver':
        return 'Star';
      default:
        return 'Star';
    }
  };
  
  const formatAmount = (amount) => {
    if (!amount || amount === 0) return '0';
    
    // Ensure amount is a number
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    
    if (numAmount >= 1000000) {
      const millions = numAmount / 1000000;
      // If it's a whole number, show without decimal
      if (millions % 1 === 0) {
        return `${millions.toFixed(0)} млн`;
      }
      return `${millions.toFixed(1)} млн`;
    } else if (numAmount >= 1000) {
      const thousands = numAmount / 1000;
      // If it's a whole number, show without decimal
      if (thousands % 1 === 0) {
        return `${thousands.toFixed(0)} тыс`;
      }
      return `${thousands.toFixed(1)} тыс`;
    }
    return numAmount.toLocaleString('ru-RU');
  };

  return (
    <div
      className={`bg-gradient-to-br ${getTierColor(tier)} rounded-2xl p-6 text-white cursor-pointer transition-smooth hover:shadow-lg`}
      onClick={onDetailsClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e?.key === 'Enter' || e?.key === ' ') {
          e?.preventDefault();
          onDetailsClick();
        }
      }}
      aria-label={`Loyalty card: ${displayCashback} кешбэк, ${tier} статус, ${displayPercent}%`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name={getTierIcon(tier)} size={24} color="white" />
          <span className="text-lg font-semibold">{tier} Статус</span>
          <span className="text-sm opacity-90">({displayPercent}%)</span>
        </div>
        <Icon name="ChevronRight" size={20} color="white" />
      </div>
      <div className="mb-4">
        <div className="text-sm opacity-90 mb-1">Баланс кешбэка</div>
        <div className="text-4xl font-bold">{displayCashback?.toLocaleString('ru-RU')}</div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-90">До следующего уровня</span>
          <span className="font-medium">
            {(() => {
              // If Platinum, show max level
              if (progress?.next === null || tier === 'Platinum') {
                return 'Максимальный уровень';
              }
              
              // Convert to numbers with strict validation
              const nextThreshold = typeof progress?.next === 'number' ? progress.next : (progress?.next ? parseFloat(progress.next) : null);
              const currentSpent = typeof progress?.current === 'number' && !isNaN(progress.current) ? progress.current : (progress?.current ? parseFloat(progress.current) || 0 : 0);
              
              // ALWAYS recalculate remaining from next - current
              let remaining = 0;
              
              if (nextThreshold !== null && nextThreshold !== undefined && !isNaN(nextThreshold)) {
                // Calculate: remaining = next threshold - current spent
                remaining = Math.max(0, nextThreshold - currentSpent);
                console.log(`🔍 LoyaltyPointsCard calculation: ${nextThreshold} - ${currentSpent} = ${remaining}`);
              } else {
                // No next threshold - use defaults based on tier
                if (tier === 'Bronze') {
                  remaining = Math.max(0, 10000000 - currentSpent);
                } else if (tier === 'Silver') {
                  remaining = Math.max(0, 30000000 - currentSpent);
                } else if (tier === 'Gold') {
                  remaining = Math.max(0, 60000000 - currentSpent);
                }
                console.log(`🔍 LoyaltyPointsCard fallback calculation (${tier}): default - ${currentSpent} = ${remaining}`);
              }
              
              // Final validation: ensure remaining is a valid number
              remaining = typeof remaining === 'number' && !isNaN(remaining) && remaining >= 0 ? remaining : 0;
              
              // If remaining is valid and > 0, show it
              if (remaining > 0) {
                return `${formatAmount(remaining)} сум`;
              }
              
              // If remaining is 0, level reached
              return 'Достигнут';
            })()}
          </span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${progress?.percentage}%` }}
            role="progressbar"
            aria-valuenow={progress?.percentage}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPointsCard;