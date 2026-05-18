import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { getApiUrl } from '../../../config/api';
import DetailModal from './DetailModal';


const isVisibleToTier = (visibleTo, userTier) => {
  if (!visibleTo || visibleTo === 'all') return true;
  if (!userTier) return true;
  return visibleTo.split(',').includes(userTier);
};

const NewsBanner = ({ userTier }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsBanners = async () => {
      try {
        const response = await fetch(getApiUrl('content/news'));
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.banners && data.banners.length > 0) {
            const filtered = data.banners.filter(b => isVisibleToTier(b.visible_to, userTier));
            setNewsItems(filtered.map(banner => ({
              id: banner.id,
              icon: banner.icon || 'Coffee',
              iconImageUrl: banner.icon_image_url || null,
              title: banner.title,
              description: banner.description,
              backgroundColor: banner.background_color || '#c89864',
              showButton: banner.show_button || false,
              buttonText: banner.button_text,
              buttonAction: banner.button_action,
              detailTitle: banner.detail_title || '',
              detailBody: banner.detail_body || '',
              detailImages: banner.detail_images || '[]',
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching news banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsBanners();
  }, []);

  useEffect(() => {
    if (newsItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % newsItems.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [newsItems.length]);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const dist = touchStart - touchEnd;
    if (dist > 50) setCurrentIndex(prev => (prev + 1) % newsItems.length);
    if (dist < -50) setCurrentIndex(prev => (prev - 1 + newsItems.length) % newsItems.length);
  };

  if (loading || newsItems.length === 0) return null;

  const item = newsItems[currentIndex];

  // Derive a slightly darker shade for text/accents from the bg color
  const bg = item.backgroundColor;

  return (
    <>
    <div className="mb-6">
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="rounded-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing relative"
        style={{ backgroundColor: bg }}
      >
        {/* Subtle inner highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)' }}
        />

        <div className="relative p-5">
          {/* Icon + description row */}
          <div className="flex items-center gap-4 mb-4">
            {/* Icon — no white box for image icons, just a clean shadow ring */}
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl overflow-hidden shadow-lg"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
            >
              {item.iconImageUrl ? (
                <img src={item.iconImageUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.25)' }}>
                  <Icon name={item.icon} size={28} className="text-white" />
                </div>
              )}
            </div>

            {/* Text block */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white leading-tight mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-white/80 leading-snug line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>

          {/* Button */}
          {item.showButton && (
            <button
              onClick={() => {
                if (item.buttonAction === '__detail__' || item.detailTitle || item.detailBody) {
                  setDetailOpen(true); return;
                }
                if (!item.buttonAction) return;
                if (item.buttonAction.startsWith('/')) navigate(item.buttonAction);
                else window.open(item.buttonAction, '_blank');
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.95)', color: bg }}
            >
              {item.buttonText || 'Узнать больше'}
              <Icon name="ArrowRight" size={15} />
            </button>
          )}
        </div>

        {/* Pagination dots */}
        {newsItems.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-4">
            {newsItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Баннер ${i + 1}`}
                style={{
                  height: 4,
                  width: i === currentIndex ? 24 : 6,
                  borderRadius: 9999,
                  background: i === currentIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                  transition: 'all 300ms',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>

    <DetailModal
      isOpen={detailOpen}
      onClose={() => setDetailOpen(false)}
      title={item.detailTitle || item.title}
      body={item.detailBody}
      images={item.detailImages}
    />
    </>
  );
};

export default NewsBanner;
