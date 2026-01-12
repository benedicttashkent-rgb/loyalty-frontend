import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const OrderSection = ({ onBookTableClick }) => {
  const navigate = useNavigate();

  const orderOptions = [
    {
      id: 1,
      icon: "ShoppingBag",
      title: "С собой",
      description: "Забрать самому",
      action: () => navigate('/food-ordering-menu?type=takeaway'),
      color: "from-[#d4a574] to-[#b8956a]"
    },
    // Delivery removed for MVP - only takeaway available
    {
      id: 3,
      icon: "Calendar",
      title: "Забронировать Стол",
      description: "Забронировать столик",
      action: onBookTableClick,
      color: "from-[#99836c] to-[#7a6857]"
    }
  ];

  return (
    <div className="space-y-4" data-section="order">
      <h2 className="text-xl font-semibold text-foreground">Как вы хотите заказать?</h2>
      <div className="grid grid-cols-1 gap-3">
        {/* Takeaway and Book Table side by side - Equal size */}
        <div className="grid grid-cols-2 gap-4">
          {/* Takeaway */}
          {orderOptions?.slice(0, 1)?.map((option) => (
            <button
              key={option?.id}
              type="button"
              onClick={(e) => {
                e?.preventDefault();
                e?.stopPropagation();
                option?.action?.();
              }}
              className="group relative overflow-hidden rounded-2xl aspect-square transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-xl"
              style={{ transform: 'none' }}
            >
              {/* Gradient Background - Matching Loyalty Card Brightness */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4a574] to-[#8a7560]" />
              
              {/* Bright Shine Overlay - Top Left to Bottom Right */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
              
              {/* Additional Glow Effect */}
              <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex flex-col items-center justify-center text-white h-full space-y-2">
                <div className="w-[70px] h-[70px] bg-white/20 rounded-full backdrop-blur-sm shadow-lg flex flex-col items-center justify-center gap-[50px]">
                  <Icon name={option?.icon} className="w-[35px] h-[35px]" strokeWidth={2} />
                </div>
                <p className="font-bold text-sm drop-shadow-md text-center leading-tight">{option?.title}</p>
              </div>
            </button>
          ))}
          
          {/* Book Table */}
          {orderOptions?.slice(1)?.map((option) => (
            <button
              key={option?.id}
              type="button"
              onClick={(e) => {
                e?.preventDefault();
                e?.stopPropagation();
                option?.action?.(e);
              }}
              className="group relative overflow-hidden rounded-2xl aspect-square transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-xl"
              style={{ transform: 'none' }}
            >
              {/* Gradient Background - Matching Loyalty Card Brightness */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#99836c] to-[#7a6857]" />
              
              {/* Bright Shine Overlay - Top Left to Bottom Right */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
              
              {/* Additional Glow Effect */}
              <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex flex-col items-center justify-center text-white h-full space-y-2">
                <div className="w-[70px] h-[70px] bg-white/20 rounded-full backdrop-blur-sm shadow-lg flex flex-col items-center justify-center gap-[50px]">
                  <Icon name={option?.icon} className="w-[35px] h-[35px]" strokeWidth={2} />
                </div>
                <p className="font-bold text-sm drop-shadow-md text-center leading-tight px-1">{option?.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderSection;