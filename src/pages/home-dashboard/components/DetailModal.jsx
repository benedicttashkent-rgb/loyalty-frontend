import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const DetailModal = ({ isOpen, onClose, title, body, images = [] }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const touchStartX = useRef(null);

  const imgs = typeof images === 'string'
    ? (() => { try { return JSON.parse(images); } catch { return []; } })()
    : (Array.isArray(images) ? images : []);

  const hasImages = imgs.length > 0;

  useEffect(() => {
    if (isOpen) {
      setImgIdx(0);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || imgs.length < 2) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      setImgIdx(i => diff > 0 ? (i + 1) % imgs.length : (i - 1 + imgs.length) % imgs.length);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{
        background: visible ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(6px)' : 'none',
        transition: 'background 300ms, backdrop-filter 300ms',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg flex flex-col overflow-hidden"
        style={{
          borderRadius: '28px 28px 0 0',
          background: 'var(--color-card)',
          maxHeight: '90dvh',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        }}
      >
        {/* Hero image */}
        {hasImages && (
          <div
            className="relative flex-shrink-0 overflow-hidden select-none"
            style={{ height: 260, borderRadius: '28px 28px 0 0' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Images */}
            <div className="relative w-full h-full">
              {imgs.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    opacity: i === imgIdx ? 1 : 0,
                    transition: 'opacity 300ms ease',
                    pointerEvents: 'none',
                  }}
                />
              ))}
            </div>

            {/* Bottom gradient */}
            <div
              className="absolute inset-x-0 bottom-0"
              style={{ height: 100, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex items-center justify-center"
              aria-label="Закрыть"
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <Icon name="X" size={16} className="text-white" />
            </button>

            {/* Dot pagination */}
            {imgs.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {imgs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    aria-label={`Фото ${i + 1}`}
                    style={{
                      width: i === imgIdx ? 20 : 6,
                      height: 6,
                      borderRadius: 9999,
                      background: i === imgIdx ? 'white' : 'rgba(255,255,255,0.45)',
                      transition: 'all 250ms ease',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
          </div>

          {/* Close button when no image */}
          {!hasImages && (
            <div className="flex justify-end px-5 pt-2">
              <button
                onClick={onClose}
                aria-label="Закрыть"
                className="flex items-center justify-center rounded-full transition-colors hover:bg-muted"
                style={{ width: 36, height: 36, background: 'var(--color-muted)' }}
              >
                <Icon name="X" size={16} className="text-muted-foreground" />
              </button>
            </div>
          )}

          <div className="px-6 pb-10" style={{ paddingTop: hasImages ? 20 : 8 }}>
            {/* Title */}
            <h2
              className="font-bold text-foreground leading-tight"
              style={{ fontSize: 22, letterSpacing: '-0.3px', marginBottom: body ? 16 : 0 }}
            >
              {title}
            </h2>

            {/* Body */}
            {body && (
              <p
                className="text-foreground whitespace-pre-line"
                style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--color-muted-foreground)', opacity: 0.9 }}
              >
                {body}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
