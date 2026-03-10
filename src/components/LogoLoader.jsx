import React from 'react';
import clsx from 'clsx';
import AppImage from './AppImage';

const sizeConfig = {
  sm: {
    logo: 'h-10 w-auto',
  },
  md: {
    logo: 'h-14 w-auto',
  },
  lg: {
    logo: 'h-18 w-auto',
  },
};

const LogoLoader = ({
  fullscreen = false,
  size = 'md',
  label,
  className = '',
}) => {
  const config = sizeConfig[size] || sizeConfig.md;

  const content = (
    <div
      className={clsx(
        'relative flex flex-col items-center justify-center gap-4',
        'text-center'
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex flex-col items-center justify-center gap-3">
        <div className="relative overflow-hidden">
          <AppImage
            src="/BENEDICT_CAFE_LOGOTYPE_page-0001-removebg-preview.png"
            alt="Benedict Café loading"
            className={clsx(
              config.logo,
              'object-contain logo-loader-logotype'
            )}
          />
          <div className="logo-loader-shimmer" />
        </div>
        <div className="logo-loader-bar-outer">
          <div className="logo-loader-bar-inner" />
        </div>
      </div>
      {label && (
        <p className="text-sm font-medium text-neutral-700">{label}</p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        className={clsx(
          'fixed inset-0 z-40 flex items-center justify-center',
          'bg-neutral-900/60 backdrop-blur-sm',
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

