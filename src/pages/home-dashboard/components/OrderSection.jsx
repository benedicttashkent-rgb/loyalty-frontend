import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const OrderCard = ({ icon, title, description, label, onClick, gradient, decorIcon, underDevelopment }) => {
  const [showToast, setShowToast] = useState(false);

  const handleClick = () => {
    if (underDevelopment) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group w-full relative overflow-hidden rounded-2xl active:scale-[0.98] transition-transform duration-150 shadow-sm text-left"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />

      {/* Dev overlay — subtle dim */}
      {underDevelopment && (
        <div className="absolute inset-0 bg-black/20 z-10" />
      )}

      {/* Decorative large icon — background right side */}
      <div className="absolute -right-3 -bottom-3 opacity-10">
        <Icon name={decorIcon} size={110} className="text-white" strokeWidth={1.2} />
      </div>

      <div className="relative z-10 flex items-center justify-between px-5 py-4 gap-4">
        {/* Left: icon badge + text */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Icon name={icon} size={24} className="text-white" strokeWidth={2} />
          </div>
          <div>
            {label && (
              <span className="text-white/70 text-[10px] font-semibold uppercase tracking-widest mb-0.5 block">
                {label}
              </span>
            )}
            <div className="flex items-center gap-2">
              <p className="text-white font-bold text-base leading-tight">{title}</p>
              {underDevelopment && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}>
                  <Icon name="HardHat" size={10} />
                  Скоро
                </span>
              )}
            </div>
            <p className="text-white/75 text-xs mt-0.5 leading-snug">{description}</p>
          </div>
        </div>

        {/* Right: arrow or wrench */}
        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 group-active:bg-white/25 transition-colors">
          {underDevelopment
            ? <Icon name="Wrench" size={16} className="text-white/80" strokeWidth={2} />
            : <Icon name="ChevronRight" size={18} className="text-white" strokeWidth={2.5} />}
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="absolute inset-x-4 bottom-3 z-20 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
          <Icon name="HardHat" size={15} />
          Онлайн-заказ скоро будет доступен
        </div>
      )}
    </button>
  );
};

const OrderSection = ({ onBookTableClick }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3" data-section="order">
      <h2 className="text-lg font-bold text-foreground">Что хотите сделать?</h2>

      <OrderCard
        icon="ShoppingBag"
        decorIcon="UtensilsCrossed"
        label="Меню"
        title="Заказ с собой"
        description="Выберите блюда — заберёте сами"
        gradient="from-[#d4a574] to-[#8a7560]"
        onClick={() => navigate('/food-ordering-menu?type=takeaway')}
        underDevelopment
      />

      <OrderCard
        icon="CalendarDays"
        decorIcon="Wine"
        label="Столик"
        title="Забронировать стол"
        description="Свяжемся для подтверждения"
        gradient="from-[#8a7a6a] to-[#5e5048]"
        onClick={onBookTableClick}
      />
    </div>
  );
};

export default OrderSection;
