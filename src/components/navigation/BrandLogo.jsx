import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppImage from '../AppImage';

const BrandLogo = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/home-dashboard');
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter' || e?.key === ' ') {
      e?.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="flex items-center justify-center cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Benedict Café - Go to home"
    >
      <AppImage
        src="assets/images/111-1765536227863.jpg"
        alt="Benedict Café logo with circular brown background and white letter B, Benedict text below"
        className="h-16 w-auto object-contain"
      />
    </div>
  );
};

export default BrandLogo;