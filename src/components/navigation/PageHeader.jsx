import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileButton from './ProfileButton';

// Shared header for the tab pages: logo mark + page title on the left, profile on the right
const PageHeader = ({ title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src="/assets/images/111-removebg-preview-1765697795359.png"
          alt="Benedict Café"
          className="w-10 h-10 object-contain flex-shrink-0"
        />
        <div className="min-w-0">
          <h1 className="font-display text-[28px] leading-none text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1 truncate">{subtitle}</p>}
        </div>
      </div>
      <ProfileButton onClick={() => navigate('/user-profile-management')} />
    </header>
  );
};

export default PageHeader;
