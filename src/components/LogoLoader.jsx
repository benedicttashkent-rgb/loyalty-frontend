import React from 'react';
import clsx from 'clsx';
import AppImage from './AppImage';

// Benedict coffee palette for bar animation (inspired by leaf PageLoader)
const BAR_COLORS = [
  'rgba(111, 78, 55, 1)', // deep coffee
  'rgba(153, 102, 51, 1)', // lighter coffee
  'rgba(201, 140, 74, 1)', // caramel
  'rgba(111, 78, 55, 1)', // deep coffee
];
const BAR_DELAYS = ['0s', '0.18s', '0.36s', '0.54s'];

const sizeConfig = {
  sm: { barHeight: 18 },
  md: { barHeight: 28 },
  lg: { barHeight: 40 },
};

const LogoLoader = ({ fullscreen = false, size = 'md', label = 'Loading', className = '' }) => {
  const config = sizeConfig[size] || sizeConfig.md;

  const content = (
    <div
      className="flex flex-col items-center justify-center"
      role="status"
      aria-label={label}
    >
      {/* Pure bar wave loader (Leaf-style) */}
      <div
        className="flex items-center"
        style={{ gap: 5, height: config.barHeight }}
      >
        {BAR_COLORS.map((color, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span
            key={i}
            className="logo-loader-bar"
            style={{
              height: config.barHeight,
              background: color,
              animationDelay: BAR_DELAYS[i],
            }}
          />
        ))}
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
