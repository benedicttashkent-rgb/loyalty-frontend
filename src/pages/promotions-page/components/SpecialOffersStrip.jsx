import React, { useState, useEffect, useMemo } from 'react';
import SmoothImage from '../../../components/SmoothImage';
import { useNavigate } from 'react-router-dom';
import { readCache, fetchContent } from '../../../utils/apiCache';
import DetailModal from './DetailModal';
import Icon from '../../../components/AppIcon';

const SpecialOffersStrip = ({ userTier }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(() => readCache('content/special-offers'));
  const [activeOffer, setActiveOffer] = useState(null);

  useEffect(() => {
    fetchContent('special-offers').then(setData).catch(() => {});
  }, []);

  const offers = useMemo(() => {
    if (!data?.success || !data.offers?.length) return [];
    return data.offers.filter(o => {
      if (!o.visible_to || o.visible_to === 'all') return true;
      if (!userTier) return true;
      return o.visible_to.split(',').includes(userTier);
    });
  }, [data, userTier]);

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
        <h2 className="font-display text-2xl text-foreground mb-4">
          Спецпредложения
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {offers.map(offer => {
            const tappable = offer.detail_title || offer.detail_body || offer.button_action;
            return (
              <div
                key={offer.id}
                onClick={() => handleTap(offer)}
                className={`flex-shrink-0 w-64 h-40 rounded-2xl overflow-hidden relative ${tappable ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
                style={{ background: offer.background_color || '#1a1a1a' }}
              >
                {offer.image_url && (
                  <SmoothImage src={offer.image_url} alt={offer.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.82) 45%, rgba(0,0,0,0.15) 100%)' }} />
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <span />
                  <div>
                    <p className="text-white text-sm font-bold leading-snug line-clamp-2 mb-1">{offer.title}</p>
                    {offer.description && <p className="text-white/60 text-xs line-clamp-1 mb-2">{offer.description}</p>}
                    {tappable && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}>
                        {offer.button_text || 'Узнать больше'}
                        <Icon name="ArrowRight" size={11} />
                      </span>
                    )}
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
