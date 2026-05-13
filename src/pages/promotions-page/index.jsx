import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import BottomTabNavigation from '../../components/navigation/BottomTabNavigation';
import { formatDateWithMonth } from '../../utils/formatDate';
import { getApiUrl } from '../../config/api';

const serif = { fontFamily: "'Marcellus', serif" };
const sans = { fontFamily: "'Raleway', sans-serif" };

const monthNames = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];

const PromotionsPage = () => {
  const navigate = useNavigate();
  const { newsId } = useParams();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDetailView = Boolean(newsId);
  const detailEvent = location.state?.event || (newsId && events.find(e => String(e.id) === String(newsId)));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(getApiUrl('content/events'));
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.events) {
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
                description: event.description || event.details || '',
                imageUrl: event.image_url || null,
              };
            });
            setEvents(mappedEvents);
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getTypeIcon = (type) => {
    if (type === 'pianist') return 'Music';
    if (type === 'singer') return 'Mic';
    return 'Sparkles';
  };

  const getTypeLabel = (type) => {
    if (type === 'pianist') return 'Пианист';
    if (type === 'singer') return 'Вокалист';
    return type;
  };

  const getDayFromDate = (date) => {
    if (!date) return '–';
    const parts = date.split('.');
    return parts[0] || '–';
  };

  const getMonthFromDate = (date, month) => {
    if (month) return month;
    if (!date) return '';
    const parts = date.split('.');
    const idx = parseInt(parts[1]) - 1;
    return monthNames[idx] || '';
  };

  return (
    <div className="min-h-screen bg-background pb-24" style={sans}>

      {/* Header */}
      <div
        className="sticky top-0 z-10"
        style={{ background: 'linear-gradient(135deg, #8b6a4e 0%, #99836c 50%, #c89864 100%)' }}
      >
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.18)' }}
              aria-label="Назад"
            >
              <Icon name="ArrowLeft" size={20} className="text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl text-white leading-none" style={{ ...serif, letterSpacing: '0.02em' }}>
                {isDetailView ? 'Событие' : 'Афиша'}
              </h1>
              <p className="text-xs text-white/70 mt-0.5 tracking-widest uppercase" style={sans}>
                Benedict Cafe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail view */}
      {isDetailView && (
        <div className="max-w-2xl mx-auto px-4 py-8">
          {loading && !location.state?.event && (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Загрузка...</p>
            </div>
          )}
          {!loading && !detailEvent && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground mb-4">Событие не найдено</p>
              <button
                type="button"
                onClick={() => navigate('/promotions-page')}
                className="text-primary font-medium text-sm"
              >
                Вернуться к афише
              </button>
            </div>
          )}
          {detailEvent && (
            <article>
              {/* Date & meta header */}
              <div className="flex items-start gap-6 mb-8">
                <div className="text-center" style={{ minWidth: 56 }}>
                  <div
                    className="text-5xl leading-none text-foreground"
                    style={{ ...serif }}
                  >
                    {getDayFromDate(detailEvent.date)}
                  </div>
                  <div className="text-xs tracking-widest text-muted-foreground mt-1 uppercase">
                    {getMonthFromDate(detailEvent.date, detailEvent.month)}
                  </div>
                </div>
                <div
                  className="w-px self-stretch"
                  style={{ background: 'var(--color-border)', marginTop: 6 }}
                />
                <div className="flex-1 pt-1">
                  <h2 className="text-2xl font-semibold text-foreground leading-tight mb-1" style={serif}>
                    {detailEvent.performer}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs tracking-widest uppercase px-2 py-0.5 rounded"
                      style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}
                    >
                      {getTypeLabel(detailEvent.type)}
                    </span>
                    {detailEvent.highlighted && (
                      <span
                        className="text-xs tracking-widest uppercase px-2 py-0.5 rounded"
                        style={{ background: '#f5ead8', color: '#8b6a4e' }}
                      >
                        Рекомендуем
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {detailEvent.imageUrl && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={detailEvent.imageUrl}
                    alt={detailEvent.performer}
                    className="w-full object-cover"
                    style={{ maxHeight: 280 }}
                  />
                </div>
              )}

              {/* Info grid */}
              <div
                className="grid grid-cols-2 gap-px mb-8"
                style={{ background: 'var(--color-border)', borderRadius: 12, overflow: 'hidden' }}
              >
                {[
                  { icon: 'Clock', label: 'Время', value: detailEvent.time || '—' },
                  { icon: 'MapPin', label: 'Филиал', value: detailEvent.location || 'Мирабад' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-background p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name={icon} size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground tracking-wider uppercase">{label}</span>
                    </div>
                    <div className="font-semibold text-foreground">{value}</div>
                  </div>
                ))}
              </div>

              {detailEvent.description && (
                <div>
                  <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3">О событии</p>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap" style={{ lineHeight: 1.7 }}>
                    {detailEvent.description}
                  </p>
                </div>
              )}
            </article>
          )}
          <BottomTabNavigation />
        </div>
      )}

      {/* List view */}
      {!isDetailView && (
        <div className="max-w-2xl mx-auto px-4 py-6">

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-0">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-5 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <div className="text-center" style={{ minWidth: 48 }}>
                    <div className="h-8 w-10 bg-muted rounded animate-pulse mx-auto mb-1" />
                    <div className="h-3 w-8 bg-muted rounded animate-pulse mx-auto" />
                  </div>
                  <div className="flex-1">
                    <div className="h-5 w-36 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-14 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Events program */}
          {!loading && events.length > 0 && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6">
                {events.length} {events.length === 1 ? 'событие' : events.length < 5 ? 'события' : 'событий'}
              </p>
              <div>
                {events.map((event, index) => {
                  const day = getDayFromDate(event.date);
                  const month = getMonthFromDate(event.date, event.month);
                  const isHighlighted = event.highlighted;

                  return (
                    <button
                      type="button"
                      key={event.id || index}
                      onClick={() => navigate(`/promotions-page/${event.id}`, { state: { event } })}
                      className="w-full text-left transition-all duration-200 active:scale-[0.99]"
                      style={{
                        display: 'block',
                        padding: isHighlighted ? 0 : 0,
                        marginBottom: isHighlighted ? 2 : 0,
                        animationDelay: `${index * 40}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      <div
                        className={`flex items-center gap-5 py-5 transition-colors duration-150 ${
                          isHighlighted ? 'rounded-xl px-4 my-1' : 'hover:bg-muted/40 rounded-lg px-2 -mx-2'
                        }`}
                        style={isHighlighted
                          ? { background: '#f8efe0', borderBottom: 'none' }
                          : { borderBottom: '1px solid var(--color-border)' }
                        }
                      >
                        {/* Date column */}
                        <div className="text-center flex-shrink-0" style={{ minWidth: 48 }}>
                          <div
                            className="text-3xl leading-none"
                            style={{
                              ...serif,
                              color: isHighlighted ? '#8b6a4e' : 'var(--color-foreground)',
                            }}
                          >
                            {day}
                          </div>
                          <div
                            className="text-[10px] tracking-widest uppercase mt-0.5"
                            style={{ color: isHighlighted ? '#b07c45' : 'var(--color-muted-foreground)' }}
                          >
                            {month}
                          </div>
                        </div>

                        {/* Divider */}
                        <div
                          className="self-stretch w-px flex-shrink-0"
                          style={{ background: isHighlighted ? '#d4a574' : 'var(--color-border)' }}
                        />

                        {/* Performer */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className="font-semibold text-base leading-tight truncate"
                              style={{ color: isHighlighted ? '#3d2810' : 'var(--color-foreground)' }}
                            >
                              {event.performer}
                            </span>
                            {isHighlighted && (
                              <Icon name="Star" size={12} style={{ color: '#b07c45', flexShrink: 0 }} />
                            )}
                          </div>
                          <div
                            className="text-xs tracking-widest uppercase"
                            style={{ color: isHighlighted ? '#b07c45' : 'var(--color-muted-foreground)' }}
                          >
                            {getTypeLabel(event.type)}
                          </div>
                        </div>

                        {/* Time + location */}
                        <div className="text-right flex-shrink-0">
                          <div
                            className="font-semibold text-base"
                            style={{ ...serif, color: isHighlighted ? '#3d2810' : 'var(--color-foreground)' }}
                          >
                            {event.time}
                          </div>
                          <div
                            className="text-[10px] tracking-wider mt-0.5"
                            style={{ color: isHighlighted ? '#b07c45' : 'var(--color-muted-foreground)' }}
                          >
                            {event.location}
                          </div>
                        </div>

                        <Icon
                          name="ChevronRight"
                          size={16}
                          style={{ color: isHighlighted ? '#b07c45' : 'var(--color-border)', flexShrink: 0 }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && events.length === 0 && (
            <div className="py-20 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: '#f8efe0' }}
              >
                <Icon name="Music" size={28} style={{ color: '#b07c45' }} />
              </div>
              <h3 className="text-lg text-foreground mb-2" style={serif}>
                Событий пока нет
              </h3>
              <p className="text-sm text-muted-foreground">
                Следите за обновлениями афиши
              </p>
            </div>
          )}
        </div>
      )}

      {!isDetailView && <BottomTabNavigation />}
    </div>
  );
};

export default PromotionsPage;
