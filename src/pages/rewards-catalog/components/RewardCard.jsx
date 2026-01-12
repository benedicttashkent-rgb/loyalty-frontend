import React from 'react';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RewardCard = ({ reward, userPoints, onRedeem, onFavorite, isFavorited }) => {
  const pointsCost = reward?.pointsCost || 0;
  const canRedeem = userPoints >= pointsCost;
  const isAvailable = reward !== null && reward !== undefined;

  const handleRedeem = () => {
    if (canRedeem && isAvailable) {
      onRedeem(reward);
    }
  };

  const handleFavorite = (e) => {
    e?.stopPropagation();
    onFavorite(reward?.id);
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden card-shadow transition-smooth hover:card-shadow-lg">
      <div className="relative h-48 overflow-hidden bg-muted">
        {reward?.imageUrl ? (
          <Image
            src={reward.imageUrl}
            alt={reward.title || 'Reward image'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
            <Icon name="Gift" size={48} className="text-primary/40" />
          </div>
        )}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-smooth hover:bg-card"
          aria-label={isFavorited ? "Удалить из избранного" : "Добавить в избранное"}
        >
          <Icon
            name="Heart"
            size={20}
            color={isFavorited ? "var(--color-error)" : "var(--color-foreground)"}
            className={isFavorited ? "fill-current" : ""}
          />
        </button>
        {reward?.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-pink-500 text-white rounded-lg text-xs font-semibold">
              Рекомендуется
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">
            <Icon name="Award" size={16} />
            {pointsCost.toLocaleString('ru-RU')} баллов
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-foreground line-clamp-2">
            {reward?.title || 'Награда'}
          </h3>
          {reward?.tier && (
            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md whitespace-nowrap">
              {reward.tier}
            </span>
          )}
          {reward?.category && (
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md whitespace-nowrap">
              {reward.category}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {reward?.description || ''}
        </p>

        <Button
          variant={canRedeem && isAvailable ? "default" : "outline"}
          fullWidth
          disabled={!canRedeem || !isAvailable}
          onClick={handleRedeem}
          iconName={canRedeem && isAvailable ? "Gift" : "Lock"}
          iconPosition="left"
          iconSize={18}
        >
          {!isAvailable
            ? "Недоступно"
            : canRedeem
            ? "Обменять"
            : `Нужно еще ${(pointsCost - userPoints).toLocaleString('ru-RU')} баллов`}
        </Button>
      </div>
    </div>
  );
};

export default RewardCard;