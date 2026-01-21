import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { formatPrice } from '../../../utils/formatPrice';

const MenuItemCard = ({ item, onAddToCart, cartQuantity, onItemClick }) => {
  const [quantity, setQuantity] = React.useState(1);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click when adding to cart
    onAddToCart(item, quantity, null); // Cards add without modifiers; modal handles modifiers
    setQuantity(1);
  };

  const handleCardClick = () => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <div 
      className="bg-card rounded-xl overflow-hidden card-shadow transition-smooth hover:card-shadow-lg cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={item?.image}
          alt={item?.imageAlt}
          className="w-full h-full object-cover"
        />
        {item?.isNew && (
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
            Новинка
          </div>
        )}
        {cartQuantity > 0 && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Icon name="ShoppingCart" size={12} />
            {cartQuantity}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-foreground mb-1">{item?.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {item?.description?.replace(/Ingredients?:?\s*/i, '').replace(/Ingridients?:?\s*/i, '').replace(/Ингредиенты?:?\s*/i, '').replace(/Состав:?\s*/i, '').trim()}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-foreground">{formatPrice(item?.price)}</span>
          {item?.weight && (
            <span className="text-sm text-muted-foreground">{item?.weight}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={(e) => { e.stopPropagation(); handleDecrement(); }}
              className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-smooth"
              aria-label="Уменьшить количество"
            >
              <Icon name="Minus" size={16} />
            </button>
            <span className="w-10 h-10 flex items-center justify-center text-sm font-medium border-x border-border">
              {quantity}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleIncrement(); }}
              className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-smooth"
              aria-label="Увеличить количество"
            >
              <Icon name="Plus" size={16} />
            </button>
          </div>

          <Button
            variant="default"
            fullWidth
            iconName="ShoppingCart"
            iconPosition="left"
            onClick={handleAddToCart}
          >
            Добавить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;