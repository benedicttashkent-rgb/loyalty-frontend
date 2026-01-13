import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import BottomTabNavigation from '../../components/navigation/BottomTabNavigation';
import { formatDateDDMMYYYY, formatDateWithMonth } from '../../utils/formatDate';
import { getApiUrl } from '../../config/api';

const PromotionsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(getApiUrl('content/events'));
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.events) {
            // Map API data to component format
            const mappedEvents = data.events.map(event => {
              const eventDate = event.date ? new Date(event.date) : null;
              const dateFormatted = eventDate ? formatDateWithMonth(eventDate) : { dayMonth: '', month: '' };
              
              return {
                id: event.id,
                date: dateFormatted.dayMonth,
                month: event.month || dateFormatted.month,
                performer: event.performer,
                time: event.time || '',
                type: event.type || 'pianist',
                highlighted: event.is_highlighted || false,
                location: event.location || 'Мирабад',
              };
            });
            setEvents(mappedEvents);
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback: empty array if API fails
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const getPerformerIcon = (type) => {
    if (type === 'pianist') return 'Music';
    if (type === 'singer') return 'Mic';
    return 'Calendar'; // Default icon for custom types
  };

  const getPerformerColor = (type, highlighted) => {
    if (highlighted) {
      if (type === 'pianist') return 'from-[#99836c] to-[#7a6857]';
      if (type === 'singer') return 'from-[#d4a574] to-[#b8956a]';
      return 'from-primary to-primary/80';
    }
    if (type === 'pianist') return 'bg-[#99836c]/10 border-[#99836c]/20';
    if (type === 'singer') return 'bg-[#d4a574]/10 border-[#d4a574]/20';
    return 'bg-primary/10 border-primary/20';
  };

  const getPerformerLabel = (type) => {
    if (type === 'pianist') return 'Пианист';
    if (type === 'singer') return 'Вокалист';
    return type; // Return custom type as is
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
      {/* Header with gradient */}
      <div className="sticky top-0 shadow-lg z-10 bg-gradient-to-r from-accent via-[#c89864] to-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-full transition-all bg-white/20 hover:bg-white/30 hover:scale-110 active:scale-95"
              aria-label="Вернуться назад"
            >
              <Icon name="ArrowLeft" size={24} className="text-white" />
            </button>
            <h1 className="text-xl font-semibold text-white drop-shadow-md">
              Дайджест Событий
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section with gradient and animation */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block mb-4">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-3 text-primary drop-shadow-md">
              ДАЙДЖЕСТ СОБЫТИЙ<br />
              <span className="text-2xl md:text-3xl font-semibold text-primary/90">
                филиала Мирабад
              </span>
            </h2>
            <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 mt-2"></div>
                </div>
              </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка событий...</p>
          </div>
        )}

        {/* Events Schedule */}
        {!loading && (
          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((event, index) => {
                const isHighlighted = event.highlighted;
                const colorClass = getPerformerColor(event.type, isHighlighted);
                
                return (
                  <div
                    key={event.id || index}
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-slide-up ${
                      isHighlighted
                        ? `bg-gradient-to-r ${colorClass} border-primary/40 shadow-md`
                        : `${colorClass} hover:border-primary/30`
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    {/* Shimmer effect for highlighted events */}
                    {isHighlighted && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    )}
                    
                    <div className="relative p-4 flex items-center justify-between gap-4">
                      {/* Date Badge */}
                  <div className={`flex-shrink-0 ${
                    isHighlighted 
                      ? 'bg-white/30 backdrop-blur-sm' 
                      : 'bg-white/50 backdrop-blur-sm'
                  } rounded-lg px-4 py-2 min-w-[70px] text-center border ${
                    isHighlighted ? 'border-white/40' : 'border-white/30'
                  }`}>
                    <div className={`text-xs font-semibold ${
                      isHighlighted ? 'text-white' : 'text-foreground'
                    }`}>
                      {event.date ? event.date.split('.')[0] : '-'}
                    </div>
                    <div className={`text-[10px] font-medium ${
                      isHighlighted ? 'text-white/80' : 'text-muted-foreground'
                    }`}>
                      {event.month || (event.date && event.date.includes('.') ? (() => {
                        const [day, month] = event.date.split('.');
                        const monthNames = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];
                        return monthNames[parseInt(month) - 1] || '';
                      })() : '') || 'ДЕК'}
                    </div>
                  </div>

                  {/* Performer Info */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isHighlighted 
                        ? 'bg-white/30 backdrop-blur-sm' 
                        : event.type === 'pianist'
                          ? 'bg-[#99836c]/20' 
                          : event.type === 'singer'
                          ? 'bg-[#d4a574]/20'
                          : 'bg-primary/20'
                    }`}>
                      <Icon 
                        name={getPerformerIcon(event.type)} 
                        size={20} 
                        className={
                          isHighlighted 
                            ? 'text-white' 
                            : event.type === 'pianist'
                              ? 'text-[#99836c]' 
                              : event.type === 'singer'
                              ? 'text-[#d4a574]'
                              : 'text-primary'
                        } 
                      />
                </div>
                <div className="flex-1">
                      <div className={`font-semibold text-base ${
                        isHighlighted ? 'text-white' : 'text-foreground'
                      }`}>
                        {event.performer}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        isHighlighted ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        {getPerformerLabel(event.type)}
                      </div>
              </div>
            </div>

                  {/* Time Badge */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isHighlighted 
                      ? 'bg-white/30 backdrop-blur-sm' 
                      : 'bg-white/60 backdrop-blur-sm'
                  } border ${
                    isHighlighted ? 'border-white/40' : 'border-white/40'
                  }`}>
                    <Icon 
                      name="Clock" 
                      size={16} 
                      className={
                        isHighlighted ? 'text-white' : 'text-foreground'
                      } 
                    />
                    <span className={`text-sm font-bold ${
                      isHighlighted ? 'text-white' : 'text-foreground'
                    }`}>
                      {event.time}
                    </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-foreground mb-2">Нет событий</p>
                <p className="text-sm text-muted-foreground">События появятся здесь позже</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomTabNavigation />
    </div>
  );
};

export default PromotionsPage;
