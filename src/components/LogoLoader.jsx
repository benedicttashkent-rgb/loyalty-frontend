import React from 'react';
import clsx from 'clsx';
import AppImage from './AppImage';

const sizeConfig = {
  sm: {
    logo: 'h-10 w-10',
    ring: 'h-16 w-16',
  },
  md: {
    logo: 'h-16 w-16',
    ring: 'h-24 w-24',
  },
  lg: {
    logo: 'h-24 w-24',
    ring: 'h-32 w-32',
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
      <div className="relative flex items-center justify-center">
        <div
          className={clsx(
            'logo-loader-ring',
            'rounded-full border border-white/10',
            'flex items-center justify-center',
            config.ring
          )}
        >
          <div className="logo-loader-ring-inner" />
        </div>
        <AppImage
          src="/assets/images/111-1765536227863.jpg"
          alt="Benedict Café logo loading"
          className={clsx(
            config.logo,
            'object-contain logo-loader-logo-pulse absolute'
          )}
        />
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

