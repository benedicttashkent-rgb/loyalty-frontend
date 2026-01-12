import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const NewsBanner = ({ onClose }) => {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const bannerRef = useRef(null);
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch news banners from API
  useEffect(() => {
    const fetchNewsBanners = async () => {
      try {
        const response = await fetch('/api/content/news');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.banners && data.banners.length > 0) {
            // Map API data to component format
            const mappedBanners = data.banners.map(banner => ({
              id: banner.id,
              type: banner.type || 'coffee',
              icon: banner.icon || 'Coffee',
              iconImageUrl: banner.icon_image_url || null,
              title: banner.title,
              description: banner.description,
              gradient: banner.gradient || 'from-[#d4a574] via-[#c89864] to-[#8a7560]',
              backgroundColor: banner.background_color || '#d4a574',
              showButton: banner.show_button || false,
              buttonText: banner.button_text,
              buttonAction: banner.button_action
            }));
            setNewsItems(mappedBanners);
          } else {
            // Fallback: default banner if no banners from API
            setNewsItems([{
              id: 1,
              type: 'coffee',
              icon: 'Coffee',
              title: 'Дарим Кофе За Регистрацию',
              description: 'Подойдите к любому сотруднику ресторана и покажите QR-код для получения бесплатного кофе на выбор.',
              gradient: 'from-[#d4a574] via-[#c89864] to-[#8a7560]',
              showButton: false
            }]);
          }
        }
      } catch (error) {
        console.error('Error fetching news banners:', error);
        // Fallback: default banner on error
        setNewsItems([{
          id: 1,
          type: 'coffee',
          icon: 'Coffee',
          title: 'Дарим Кофе За Регистрацию',
          description: 'Подойдите к любому сотруднику ресторана и покажите QR-код для получения бесплатного кофе на выбор.',
          gradient: 'from-[#d4a574] via-[#c89864] to-[#8a7560]',
          showButton: false
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsBanners();
  }, []);

  const currentNews = newsItems.length > 0 ? newsItems[currentNewsIndex] : null;

  // Auto-rotate news every 10 seconds (increased from 6)
  useEffect(() => {
    if (newsItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [newsItems.length]);

  // Don't render if loading or no news items
  if (loading) {
    return null; // or a loading skeleton
  }

  if (!currentNews || newsItems.length === 0) {
    return null;
  }

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
    }
    if (isRightSwipe) {
      setCurrentNewsIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
    }
  };

  return (
    <>
      <div className="relative mb-6 animate-fade-in">
        {/* Main Banner */}
        <div 
          ref={bannerRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`${currentNews.gradient ? `bg-gradient-to-br ${currentNews.gradient}` : ''} rounded-2xl p-6 shadow-2xl border-2 border-white/20 relative overflow-hidden group hover:shadow-3xl transition-all duration-300 cursor-grab active:cursor-grabbing select-none`}
          style={!currentNews.gradient ? { backgroundColor: currentNews.backgroundColor } : {}}
        >
          {/* Animated Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none animate-pulse" />
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
        
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
            <div className="flex items-start gap-4 mb-4">
              {/* Icon with glow effect */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-xl animate-pulse" />
                <div className="relative w-14 h-14 rounded-xl bg-white/25 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow-xl overflow-hidden">
                  {currentNews.iconImageUrl ? (
                    <img 
                      src={currentNews.iconImageUrl} 
                      alt={currentNews.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name={currentNews.icon} size={28} className="text-white drop-shadow-lg" />
                  )}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white drop-shadow-lg mb-2 leading-tight">
                  {currentNews.title}
                </h3>
                <p className="text-white/95 text-sm leading-relaxed drop-shadow-md">
                  {currentNews.description}
                </p>
            </div>
            </div>

            {/* Action Button - only show if needed */}
            {currentNews.showButton && (
              <button
                onClick={currentNews.action}
                className="w-full bg-white/95 hover:bg-white backdrop-blur-sm text-primary font-bold py-3 px-4 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl border-2 border-white/50"
              >
                <span>{currentNews.actionText}</span>
                <Icon name="ArrowRight" size={18} className="text-primary" />
              </button>
            )}
          </div>

          {/* News Indicators */}
          {newsItems.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
              {newsItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentNewsIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentNewsIndex
                      ? 'bg-white w-8 shadow-lg'
                      : 'bg-white/40 w-1.5 hover:bg-white/60'
                  }`}
                  aria-label={`Показать новость ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-accent/30 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary/30 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
    </>
  );
};

export default NewsBanner;
