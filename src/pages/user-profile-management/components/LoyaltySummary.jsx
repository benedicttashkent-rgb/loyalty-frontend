import React from 'react';
import Icon from '../../../components/AppIcon';

const LoyaltySummary = ({ loyaltyData }) => {
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
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
            <Icon name="Star" size={20} color="var(--color-primary)" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {(loyaltyData?.totalCashback || loyaltyData?.totalPoints || 0).toLocaleString('ru-RU')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Кешбэк</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mx-auto mb-2">
            <Icon name="TrendingUp" size={20} color="var(--color-accent)" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {(loyaltyData?.earnedThisMonth || 0).toLocaleString('ru-RU')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">За Месяц</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-full mx-auto mb-2">
            <Icon name="Calendar" size={20} color="var(--color-success)" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {loyaltyData?.memberSince || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Месяцев</p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltySummary;