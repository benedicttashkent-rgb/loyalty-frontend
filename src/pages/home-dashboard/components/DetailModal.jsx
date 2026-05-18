import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DetailModal = ({ isOpen, onClose, title, body, images = [] }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = typeof images === 'string' ? (() => { try { return JSON.parse(images); } catch { return []; } })() : images;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card w-full max-w-md rounded-t-3xl max-h-[85vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-lg font-bold text-foreground leading-tight pr-4">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Image gallery */}
        {imgs.length > 0 && (
          <div className="px-5 mb-4">
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video">
              <img src={imgs[imgIdx]} alt="" className="w-full h-full object-cover" />
              {imgs.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"
                  >
                    <Icon name="ChevronLeft" size={16} />
                  </button>
                  <button
                    onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"
                  >
                    <Icon name="ChevronRight" size={16} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {imgs.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className="rounded-full transition-all"
                        style={{ width: i === imgIdx ? 16 : 6, height: 6, background: i === imgIdx ? 'white' : 'rgba(255,255,255,0.5)' }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Body text */}
        {body && (
          <div className="px-5 pb-8">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{body}</p>
          </div>
        )}

        {!body && <div className="pb-8" />}
      </div>
    </div>
  );
};

export default DetailModal;
