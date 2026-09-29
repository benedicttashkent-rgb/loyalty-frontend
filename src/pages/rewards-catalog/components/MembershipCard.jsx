import React from 'react';
import Icon from '../../../components/AppIcon';

const TIER_STYLE = {
  Bronze: { dot: '#cd8a4f', next: 'Silver' },
  Silver: { dot: '#c9c9c9', next: 'Gold' },
  Gold: { dot: '#d4a574', next: 'Platinum' },
  Platinum: { dot: '#e5e4e2', next: null },
};

const formatSum = (amount) => Math.round(Number(amount) || 0).toLocaleString('ru-RU');

// Loyalty card: status, cashback balance, progress to the next tier and the QR code button
const MembershipCard = ({ userData, onShowQR, onShowDetails }) => {
  const tier = userData?.tier || 'Bronze';
  const style = TIER_STYLE[tier] || TIER_STYLE.Bronze;
  const progress = userData?.progress;
  const isMaxTier = !style.next || progress?.next === null;

  return (
    <section
      className="relative rounded-3xl overflow-hidden text-white p-5"
      style={{ background: 'linear-gradient(160deg, #3a2f25 0%, #2a221b 60%, #211b16 100%)' }}
      aria-label="Карта лояльности"
    >
      {/* Soft taupe glow in the corner — the card's only decoration */}
      <div
        className="absolute -top-24 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,165,116,0.35) 0%, rgba(212,165,116,0) 70%)' }}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium">
            <span className="w-2 h-2 rounded-full" style={{ background: style.dot }} />
            {tier}, кешбэк {userData?.cashbackPercent ?? 2}%
          </span>
          <button
            type="button"
            onClick={onShowDetails}
            className="inline-flex items-center gap-1 text-sm text-white/70 active:text-white"
          >
            Подробнее
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>

        <p className="text-sm text-white/60 mt-6">Баланс кешбэка</p>
        <p className="font-display text-[44px] leading-none mt-1 tracking-tight">
          {formatSum(userData?.cashback)}
        </p>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/60">
              {isMaxTier ? 'Максимальный уровень' : `До ${style.next}`}
            </span>
            {!isMaxTier && (
              <span className="font-medium">
                {progress?.remaining > 0 ? `${formatSum(progress.remaining)} сум` : 'Достигнут'}
              </span>
            )}
          </div>
          <div
            className="h-1.5 rounded-full bg-white/15 overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(progress?.percentage || 0)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
              style={{ width: `${isMaxTier ? 100 : progress?.percentage || 0}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onShowQR}
          className="mt-6 w-full h-14 rounded-2xl bg-white text-[#2a221b] font-semibold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
        >
          <Icon name="QrCode" size={22} />
          Показать QR-код
        </button>
        <p className="text-xs text-white/50 text-center mt-2.5">
          Покажите официанту, чтобы начислить кешбэк
        </p>
      </div>
    </section>
  );
};

export default MembershipCard;
