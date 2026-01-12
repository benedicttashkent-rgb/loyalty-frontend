import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import AppImage from '../AppImage';

const BottomTabNavigation = ({ cartCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      label: 'Главная',
      path: '/home-dashboard',
      icon: 'Home',
    },
    {
      label: 'Награды',
      path: '/rewards-catalog',
      icon: 'Gift',
    },
    {
      label: 'center-promo',
      path: '/promotions-page',
      isCenter: true,
    },
    {
      label: 'Заказ',
      path: '/food-ordering-menu',
      icon: 'UtensilsCrossed',
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      label: 'О нас',
      path: '/about-branch-locations',
      icon: 'MapPin',
    },
  ];

  const handleTabClick = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  return (
    <nav className="bottom-tab-nav">
      <div className="bottom-tab-nav-container">
        {tabs?.map((tab, index) => {
          // Render center promotional button
          if (tab?.isCenter) {
            return (
              <button
                key={`center-${index}`}
                className="center-promo-button"
                onClick={() => handleTabClick(tab?.path)}
                aria-label="Открыть акции и скидки"
              >
                <div className="center-promo-button-inner">
                  <div className="center-promo-shine-layer" />
                  <div className="center-promo-glow-layer" />
                  <AppImage
                    src="assets/images/111-removebg-preview-1765697795359.png"
                    alt="Benedict Café logo with transparent background on promotional button"
                    className="center-promo-logo"
                  />
                </div>
              </button>
            );
          }

          // Render regular navigation tabs
          return (
            <button
              key={tab?.path}
              className={`bottom-tab-item ${isActive(tab?.path) ? 'active' : ''}`}
              onClick={() => handleTabClick(tab?.path)}
              aria-label={tab?.label}
              aria-current={isActive(tab?.path) ? 'page' : undefined}
            >
              <div className="bottom-tab-item-icon">
                <Icon name={tab?.icon} size={24} />
              </div>
              <span className="bottom-tab-item-label">{tab?.label}</span>
              {tab?.badge && (
                <span className="bottom-tab-badge" aria-label={`${tab?.badge} items`}>
                  {tab?.badge > 99 ? '99+' : tab?.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabNavigation;