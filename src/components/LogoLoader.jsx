import React from 'react';
import clsx from 'clsx';
import AppImage from './AppImage';

const sizeConfig = {
  sm: { logo: 'h-10 w-auto' },
  md: { logo: 'h-14 w-auto' },
  lg: { logo: 'h-20 w-auto' },
};

const LogoLoader = ({ fullscreen = false, size = 'md', label = 'Loading', className = '' }) => {
  const config = sizeConfig[size] || sizeConfig.md;

  const content = (
    <div
      className="relative flex flex-col items-center justify-center"
      role="status"
      aria-label={label}
    >
      {/* Glow bloom behind logo */}
      <div className="logo-loader-bloom" />

      {/* Logo + halo ring */}
      <div className="logo-loader-logo-wrap">
        <div className="logo-loader-halo" />
        <AppImage
          src="/BENEDICT_CAFE_LOGOTYPE_page-0001-removebg-preview.png"
          alt="Benedict Café"
          className={clsx(config.logo, 'object-contain logo-loader-logotype')}
        />

        {/* Steam wisps — positioned above logo */}
        <div className="logo-loader-steam logo-loader-steam-1" />
        <div className="logo-loader-steam logo-loader-steam-2" />
        <div className="logo-loader-steam logo-loader-steam-3" />
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div
        className={clsx(
          'fixed inset-0 z-40 flex items-center justify-center',
          'bg-[#140e07]',
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={clsx('inline-flex items-center justify-center', className)}>
      {content}
    </div>
  );
};

export default LogoLoader;
