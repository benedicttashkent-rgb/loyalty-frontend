import React from 'react';
import clsx from 'clsx';
import AppImage from './AppImage';

const sizeConfig = {
  sm: {
    logo: 'h-10 w-auto',
    steamHeight: 'h-8',
  },
  md: {
    logo: 'h-16 w-auto',
    steamHeight: 'h-10',
  },
  lg: {
    logo: 'h-24 w-auto',
    steamHeight: 'h-14',
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
            'pointer-events-none absolute -top-6 flex w-full items-center justify-center gap-2',
            config.steamHeight
          )}
        >
          <div className="logo-loader-steam-line logo-loader-steam-line-1" />
          <div className="logo-loader-steam-line logo-loader-steam-line-2" />
          <div className="logo-loader-steam-line logo-loader-steam-line-3" />
        </div>
        <AppImage
          src="/assets/images/111-1765536227863.jpg"
          alt="Benedict Café logo loading"
          className={clsx(
            config.logo,
            'object-contain logo-loader-logo-breathe'
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

