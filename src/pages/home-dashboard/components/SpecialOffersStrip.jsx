import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../../config/api';

const SpecialOffersStrip = () => {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(getApiUrl('content/news'));
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.banners?.length) {
          // Only show banners that have an image — those are the "offer" cards
          const withImages = data.banners.filter(b => b.icon_image_url);
          setOffers(withImages);
        }
      } catch (_) {}
    };
    load();
  }, []);

  if (!offers.length) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-foreground mb-3">
        Специальные предложения
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {offers.map(offer => (
          <div
            key={offer.id}
            className="flex-shrink-0 w-56 h-36 rounded-2xl overflow-hidden relative"
            style={{ background: offer.background_color || '#1a1a1a' }}
          >
            {/* Food photo — right side, fading into dark on left */}
            <img
              src={offer.icon_image_url}
              alt={offer.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay: dark on left for text, transparent on right for image */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.82) 45%, rgba(0,0,0,0.15) 100%)',
              }}
            />
            {/* Text content */}
            <div className="absolute inset-0 p-3 flex flex-col justify-between">
              <p className="text-white text-xs font-semibold leading-tight line-clamp-1">
                Benedict Café
              </p>
              <div>
                <p className="text-white text-sm font-bold leading-snug line-clamp-3 mb-1">
                  {offer.title}
                </p>
                {offer.description && (
                  <p className="text-white/60 text-xs line-clamp-1">{offer.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialOffersStrip;
