import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../../config/api';
import DetailModal from './DetailModal';

const SpecialOffersStrip = ({ userTier }) => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [activeOffer, setActiveOffer] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(getApiUrl('content/special-offers'));
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.offers?.length) {
          const visible = data.offers.filter(o => {
            if (!o.visible_to || o.visible_to === 'all') return true;
            if (!userTier) return true;
            return o.visible_to.split(',').includes(userTier);
          });
          setOffers(visible);
        }
      } catch (_) {}
    };
    load();
  }, [userTier]);

  if (!offers.length) return null;

  const handleTap = (offer) => {
    if (offer.button_action === '__detail__' || offer.detail_title || offer.detail_body) {
      setActiveOffer(offer); return;
    }
    if (!offer.button_action) return;
    if (offer.button_action.startsWith('/')) navigate(offer.button_action);
    else window.open(offer.button_action, '_blank');
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-3">
          Специальные предложения
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {offers.map(offer => {
            const tappable = offer.detail_title || offer.detail_body || offer.button_action;
            return (
              <div
                key={offer.id}
                onClick={() => handleTap(offer)}
                className={`flex-shrink-0 w-56 h-36 rounded-2xl overflow-hidden relative ${tappable ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
                style={{ background: offer.background_color || '#1a1a1a' }}
              >
                {offer.image_url && (
                  <img src={offer.image_url} alt={offer.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.82) 45%, rgba(0,0,0,0.15) 100%)' }} />
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <p className="text-white text-xs font-semibold leading-tight line-clamp-1">Benedict Café</p>
                  <div>
                    <p className="text-white text-sm font-bold leading-snug line-clamp-3 mb-1">{offer.title}</p>
                    {offer.description && <p className="text-white/60 text-xs line-clamp-1">{offer.description}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeOffer && (
        <DetailModal
          isOpen={!!activeOffer}
          onClose={() => setActiveOffer(null)}
          title={activeOffer.detail_title || activeOffer.title}
          body={activeOffer.detail_body}
          images={activeOffer.detail_images}
        />
      )}
    </>
  );
};

export default SpecialOffersStrip;
