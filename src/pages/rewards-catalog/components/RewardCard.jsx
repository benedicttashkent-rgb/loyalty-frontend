import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const RewardCard = ({ reward, userPoints, onRedeem }) => {
  const pointsCost = reward?.pointsCost || 0;
  const canRedeem = userPoints >= pointsCost;

  return (
    <article className="flex gap-4 rounded-2xl border border-border p-3">
      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
        {reward?.imageUrl ? (
          <Image
            src={reward.imageUrl}
            alt={reward.title || 'Награда'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="Gift" size={32} className="text-primary/50" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
            {reward?.title || 'Награда'}
          </h3>
          {reward?.isFeatured && (
            <Icon name="Sparkles" size={16} className="text-accent flex-shrink-0 mt-0.5" aria-label="Рекомендуем" />
          )}
        </div>
        {reward?.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{reward.description}</p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-primary whitespace-nowrap">
            {pointsCost.toLocaleString('ru-RU')} баллов
          </span>
          {canRedeem ? (
            <button
              type="button"
              onClick={() => onRedeem(reward)}
              className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold active:scale-95 transition-transform"
            >
              Обменять
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Icon name="Lock" size={12} />
              ещё {(pointsCost - userPoints).toLocaleString('ru-RU')}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default RewardCard;
