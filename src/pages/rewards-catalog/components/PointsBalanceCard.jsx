import React from 'react';
import Icon from '../../../components/AppIcon';

const PointsBalanceCard = ({ points, tier }) => {
  const getTierColor = (tierName) => {
    switch (tierName) {
      case 'VIP':
        return 'from-[#d4a574] to-[#99836c]';
      case 'Gold':
        return 'from-[#d4a574] to-[#8a7560]';
      case 'Silver':
        return 'from-[#99836c] to-[#8a7560]';
      default:
        return 'from-[#99836c] to-[#8a7560]';
    }
  };

  const getTierIcon = (tierName) => {
    switch (tierName) {
      case 'VIP':
        return 'Crown';
      case 'Gold':
        return 'Award';
      case 'Silver':
        return 'Star';
      default:
        return 'Star';
    }
  };

  return (
    <div className={`bg-gradient-to-br ${getTierColor(tier)} rounded-2xl p-6 card-shadow-lg mb-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Wallet" size={24} color="white" />
          <span className="text-white/80 text-sm font-medium">
            Ваш баланс
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
          <Icon name={getTierIcon(tier)} size={16} color="white" />
          <span className="text-white text-xs font-semibold">
            {tier}
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold text-white">
          {points?.toLocaleString('ru-RU')}
        </span>
        <span className="text-white/80 text-lg font-medium">
          баллов
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-white/80 text-sm">
          Используйте баллы для обмена на награды из каталога
        </p>
      </div>
    </div>
  );
};

export default PointsBalanceCard;