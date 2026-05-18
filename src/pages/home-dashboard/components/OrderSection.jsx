import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const serif = { fontFamily: "'Marcellus', serif" };

const OrderCard = ({ icon, title, description, label, onClick, gradient, decorIcon }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full relative overflow-hidden rounded-2xl active:scale-[0.98] transition-transform duration-150 shadow-sm text-left"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />

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
          <p className="text-white font-bold text-base leading-tight" style={serif}>{title}</p>
          <p className="text-white/75 text-xs mt-0.5 leading-snug">{description}</p>
        </div>
      </div>

      {/* Right: arrow */}
      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 group-active:bg-white/25 transition-colors">
        <Icon name="ChevronRight" size={18} className="text-white" strokeWidth={2.5} />
      </div>
    </div>
  </button>
);

const OrderSection = ({ onBookTableClick }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3" data-section="order">
      <h2 className="text-lg font-bold text-foreground" style={serif}>Что хотите сделать?</h2>

      <OrderCard
        icon="ShoppingBag"
        decorIcon="UtensilsCrossed"
        label="Меню"
        title="Заказ с собой"
        description="Выберите блюда — заберёте сами"
        gradient="from-[#d4a574] to-[#8a7560]"
        onClick={() => navigate('/food-ordering-menu?type=takeaway')}
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
