import React from 'react';
import Icon from '../AppIcon';

const FloatingCartButton = ({ cartCount = 0, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter' || e?.key === ' ') {
      e?.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      className="floating-cart-button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Shopping cart with ${cartCount} items`}
      type="button"
    >
      <Icon name="ShoppingCart" size={24} />
      {cartCount > 0 && (
        <span className="floating-cart-badge" aria-label={`${cartCount} items in cart`}>
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );
};

export default FloatingCartButton;