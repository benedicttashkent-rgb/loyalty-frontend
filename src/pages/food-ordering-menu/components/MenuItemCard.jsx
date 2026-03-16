import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import { formatPrice } from '../../../utils/formatPrice';

const MenuItemCard = ({ item, onAddToCart, cartQuantity, onItemClick }) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = (e) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(item, quantity, null);
    setQuantity(1);
  };

  const cleanDescription = item?.description
    ?.replace(/Ingredients?:?\s*/i, '')
    ?.replace(/Ingridients?:?\s*/i, '')
    ?.replace(/Ингредиенты?:?\s*/i, '')
    ?.replace(/Состав:?\s*/i, '')
    ?.trim();

  return (
    <div
      className="bg-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] border border-border/60 hover:border-accent/30"
      onClick={() => onItemClick?.(item)}
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="relative w-[88px] h-[88px] rounded-xl overflow-hidden flex-shrink-0 bg-muted">
          <Image
            src={item?.image}
            alt={item?.imageAlt || item?.name}
            className="w-full h-full object-cover"
          />
          {item?.isNew && (
            <span className="absolute top-1.5 left-1.5 bg-accent text-white text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full">
              NEW
            </span>
          )}
          {cartQuantity > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm">
              {cartQuantity}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-snug">{item?.name}</h3>
            {cleanDescription && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                {cleanDescription}
              </p>
            )}
          </div>

          {/* Price + Controls */}
          <div className="flex items-center justify-between mt-2 gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-foreground">{formatPrice(item?.price)}</span>
              {item?.weight && (
                <span className="text-xs text-muted-foreground">{item?.weight}</span>
              )}
            </div>

            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <button
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-muted/70 transition-colors cursor-pointer"
                aria-label="Уменьшить количество"
              >
                <Icon name="Minus" size={12} />
              </button>
              <span className="text-sm font-semibold w-5 text-center">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-muted/70 transition-colors cursor-pointer"
                aria-label="Увеличить количество"
              >
                <Icon name="Plus" size={12} />
              </button>
              <button
                onClick={handleAddToCart}
                className="h-7 px-2.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold transition-all duration-200 hover:bg-primary/90 active:scale-95 ml-0.5 whitespace-nowrap cursor-pointer"
                aria-label="Добавить в корзину"
              >
                В корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
