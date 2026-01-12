import React from 'react';
import Icon from '../AppIcon';

const ProfileButton = ({ onClick }) => {
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
      className="profile-button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Open profile"
      type="button"
    >
      <Icon name="User" size={20} className="profile-button-icon" />
    </button>
  );
};

export default ProfileButton;