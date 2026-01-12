import React from 'react';
import Icon from '../../../components/AppIcon';

const ProfileHeader = ({ user, onClose }) => {
  return (
    <div className="relative bg-gradient-to-br from-primary to-secondary p-6 rounded-t-2xl">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-smooth"
        aria-label="Close profile"
      >
        <Icon name="X" size={20} color="white" />
      </button>
      <div className="flex flex-col items-center pt-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-lg bg-white/20 flex items-center justify-center">
            <Icon name="User" size={48} color="white" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-white mt-4">{user?.name}</h2>
        <p className="text-white/80 text-sm mt-1">{user?.email}</p>

        <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
          <Icon name="Award" size={16} color="white" />
          <span className="text-white font-medium text-sm">{user?.tier} Уровень</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;