import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FeaturedRewards = ({ rewards, userPoints, onRewardClick }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-foreground">Избранные награды</div>
        <button
          className="text-sm text-primary font-medium hover:underline"
          onClick={() => window.location.href = '/rewards-catalog'}
          aria-label="View all rewards"
        >
          Все награды
        </button>
      </div>
      <div className="space-y-3">
        {rewards?.map((reward) => {
          const canRedeem = userPoints >= reward?.points;
          
          return (
            <div
              key={reward?.id}
              className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-smooth"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={reward?.image}
                    alt={reward?.imageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-foreground mb-1 truncate">
                    {reward?.name}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {reward?.description}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-primary font-semibold">
                      <Icon name="Star" size={16} />
                      <span className="text-sm">{reward?.points} баллов</span>
                    </div>

                    <Button
                      variant={canRedeem ? 'default' : 'outline'}
                      size="sm"
                      disabled={!canRedeem}
                      onClick={() => onRewardClick(reward)}
                      iconName={canRedeem ? 'Gift' : 'Lock'}
                      iconPosition="left"
                      iconSize={16}
                    >
                      {canRedeem ? 'Получить' : 'Недостаточно'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedRewards;