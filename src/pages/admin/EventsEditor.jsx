import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { formatDateDDMMYYYY, formatDateForInput, parseDateDDMMYYYY, getMonthAbbr } from '../../utils/formatDate';
import { getApiUrl } from '../../config/api';
import { adminApiRequest } from '../../utils/adminApiClient';


const EventsEditor = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filter, setFilter] = useState({ type: '', month: '' });
  const [formData, setFormData] = useState({
    date: '',
    month: '',
    performer: '',
    time: '',
    type: 'pianist',
    customType: '',
    isHighlighted: false,
    description: '',
    location: 'Мирабад',
    isActive: true,
    displayOrder: 0,
  });
  const [eventImageFile, setEventImageFile] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.month) params.append('month', filter.month);
      const queryString = params.toString();
      const endpoint = queryString ? `admin/events?${queryString}` : 'admin/events';
      const response = await adminApiRequest(endpoint, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Fetch events error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.type, filter.month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) { alert('Дата обязательна. Формат: dd/mm/yyyy'); return; }
    if (!formData.performer) { alert('Исполнитель обязателен.'); return; }
    if (!formData.time) { alert('Время обязательно.'); return; }
    if (formData.type === 'custom' && !formData.customType) { alert('Введите тип события.'); return; }

    try {
      const endpoint = editingEvent ? `admin/events/${editingEvent.id}` : 'admin/events';
      const method = editingEvent ? 'PUT' : 'POST';
      const formDataToSend = new FormData();

      const parsedDate = parseDateDDMMYYYY(formData.date);
      if (!parsedDate) { alert('Неверный формат даты. Используйте dd/mm/yyyy'); return; }

      formDataToSend.append('month', formData.month || getMonthAbbr(parsedDate));
      formDataToSend.append('date', formData.date.trim());
      formDataToSend.append('performer', formData.performer.trim());
      formDataToSend.append('time', formData.time.trim());

      if (formData.type === 'custom' && formData.customType) {
        formDataToSend.append('customType', formData.customType.trim());
        formDataToSend.append('type', 'custom');
      } else {
        formDataToSend.append('type', formData.type || 'pianist');
      }

      formDataToSend.append('isHighlighted', formData.isHighlighted ? 'true' : 'false');
      formDataToSend.append('description', (formData.description || '').trim());
      formDataToSend.append('location', (formData.location || 'Мирабад').trim());
      formDataToSend.append('isActive', formData.isActive !== false ? 'true' : 'false');
      formDataToSend.append('displayOrder', String(parseInt(formData.displayOrder) || 0));

      if (eventImageFile) formDataToSend.append('eventImage', eventImageFile);

      const response = await adminApiRequest(endpoint, { method, body: formDataToSend });
      const responseData = await response.json();

      if (response.ok) {
        await fetchEvents();
        setShowModal(false);
        resetForm();
      } else {
        alert(`Ошибка: ${responseData.error || responseData.message || 'Failed to save event'}`);
      }
    } catch (error) {
      alert(`Ошибка соединения: ${error.message}`);
    }
  };

  const handleEventImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setEventImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить это событие?')) return;
    try {
      const response = await adminApiRequest(`admin/events/${id}`, { method: 'DELETE' });
      if (response.ok) await fetchEvents();
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    const isCustomType = !['pianist', 'singer'].includes(event.type);
    setFormData({
      date: event.date ? formatDateDDMMYYYY(event.date) : '',
      month: event.month || '',
      performer: event.performer || '',
      time: event.time || '',
      type: isCustomType ? 'custom' : event.type,
      customType: isCustomType ? event.type : '',
      isHighlighted: event.is_highlighted || false,
      description: event.description || '',
      location: event.location || 'Мирабад',
      isActive: event.is_active !== undefined ? event.is_active : true,
      displayOrder: event.display_order || 0,
    });
    setEventImagePreview(event.image_url || null);
    setEventImageFile(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      date: '', month: '', performer: '', time: '', type: 'pianist',
      customType: '', isHighlighted: false, description: '',
      location: 'Мирабад', isActive: true, displayOrder: 0,
    });
    setEventImageFile(null);
    setEventImagePreview(null);
  };

  const eventTypes = [
    { value: 'pianist', label: 'Пианист', icon: 'Music' },
    { value: 'singer', label: 'Вокалист', icon: 'Mic' },
    { value: 'custom', label: 'Другой тип', icon: 'Sparkles' },
  ];

  const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];

  const groupedEvents = events.reduce((acc, event) => {
    const date = event.date ? event.date.split('T')[0] : 'no-date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedEvents).sort();

  const getTypeInfo = (type) => {
    const known = { pianist: { label: 'Пианист', icon: 'Music' }, singer: { label: 'Вокалист', icon: 'Mic' } };
    return known[type] || { label: type, icon: 'Sparkles' };
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5";

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">События</h1>
          <p className="text-sm text-muted-foreground mt-1">{events.length} записей в афише</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Все типы</option>
            {eventTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select
            value={filter.month}
            onChange={(e) => setFilter({ ...filter, month: e.target.value })}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Все месяцы</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            <Icon name="Plus" size={16} />
            Добавить
          </button>
        </div>
      </div>

      {/* Empty state */}
      {sortedDates.length === 0 && (
        <div
          className="py-20 text-center rounded-2xl"
          style={{ background: '#f8efe0' }}
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#eedcbe' }}>
            <Icon name="Calendar" size={24} style={{ color: '#b07c45' }} />
          </div>
          <p className="text-lg text-foreground mb-1">Нет событий</p>
          <p className="text-sm text-muted-foreground mb-5">Создайте первое событие для афиши</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-5 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            Добавить событие
          </button>
        </div>
      )}

      {/* Events timeline */}
      {sortedDates.length > 0 && (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date}>
              {/* Date group header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-foreground">
                  {date === 'no-date' ? 'Без даты' : formatDateDDMMYYYY(date)}
                </span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{groupedEvents[date].length}</span>
              </div>

              {/* Event rows */}
              <div className="space-y-2">
                {groupedEvents[date].map((event) => {
                  const { label: typeLabel, icon: typeIcon } = getTypeInfo(event.type);

                  return (
                    <div
                      key={event.id}
                      className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-150"
                      style={{
                        background: event.is_highlighted ? '#f8efe0' : 'var(--color-card)',
                        border: `1px solid ${event.is_highlighted ? '#e8cfa0' : 'var(--color-border)'}`,
                      }}
                    >
                      {/* Type icon */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: event.is_highlighted ? '#eedcbe' : 'var(--color-muted)',
                          color: event.is_highlighted ? '#8b6a4e' : 'var(--color-muted-foreground)',
                        }}
                      >
                        <Icon name={typeIcon} size={16} />
                      </div>

                      {/* Thumbnail */}
                      {event.image_url && (
                        <img
                          src={event.image_url}
                          alt={event.performer}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-border"
                        />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground truncate">{event.performer}</span>
                          {event.is_highlighted && (
                            <span className="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded" style={{ background: '#eedcbe', color: '#8b6a4e' }}>
                              Рекомендуем
                            </span>
                          )}
                          <span
                            className={`text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded ${
                              event.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {event.is_active ? 'Активно' : 'Скрыто'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {typeLabel} · {event.location || 'Мирабад'}
                          {event.description && ` · ${event.description.slice(0, 40)}${event.description.length > 40 ? '…' : ''}`}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-sm text-foreground">{event.time}</div>
                        {event.month && <div className="text-xs text-muted-foreground">{event.month}</div>}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Редактировать"
                        >
                          <Icon name="Pencil" size={15} className="text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                          title="Удалить"
                        >
                          <Icon name="Trash2" size={15} className="text-destructive" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div
            className="bg-card w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl"
            style={{ maxHeight: '92vh' }}
          >
            {/* Modal header */}
            <div
              className="px-6 py-5 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <h2 className="text-xl text-foreground">
                {editingEvent ? 'Редактировать событие' : 'Новое событие'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Icon name="X" size={16} className="text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 80px)' }}>
              <div className="px-6 py-5 space-y-5">

                {/* Photo upload */}
                <div>
                  <label className={labelClass}>Фото (OCR-извлечение текста)</label>
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{ border: '1px dashed var(--color-border)' }}
                  >
                    {eventImagePreview ? (
                      <div className="relative">
                        <img src={eventImagePreview} alt="Preview" className="w-full object-cover" style={{ maxHeight: 160 }} />
                        <button
                          type="button"
                          onClick={() => { setEventImagePreview(null); setEventImageFile(null); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
                        >
                          <Icon name="X" size={14} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 py-6 cursor-pointer hover:bg-muted/50 transition-colors">
                        <Icon name="ImagePlus" size={22} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Нажмите для загрузки</span>
                        <input type="file" accept="image/*" onChange={handleEventImageChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Дата *</label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d/]/g, '');
                        if (value.length === 2 && !value.includes('/')) value = value + '/';
                        else if (value.length === 5 && value.split('/').length === 2) value = value + '/';
                        if (value.length <= 10) setFormData({ ...formData, date: value });
                      }}
                      placeholder="15/12/2024"
                      className={inputClass}
                      required
                      maxLength={10}
                    />
                    {formData.date && !parseDateDDMMYYYY(formData.date) && (
                      <p className="text-xs text-destructive mt-1">Неверный формат</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Время *</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                {/* Performer */}
                <div>
                  <label className={labelClass}>Исполнитель / Название *</label>
                  <input
                    type="text"
                    value={formData.performer}
                    onChange={(e) => setFormData({ ...formData, performer: e.target.value })}
                    placeholder="Самед, Сильвия, DJ Bacho..."
                    className={inputClass}
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className={labelClass}>Тип события *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {eventTypes.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: t.value, customType: t.value === 'custom' ? formData.customType : '' })}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all"
                        style={{
                          background: formData.type === t.value ? 'var(--color-primary)' : 'var(--color-muted)',
                          color: formData.type === t.value ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                        }}
                      >
                        <Icon name={t.icon} size={16} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {formData.type === 'custom' && (
                    <input
                      type="text"
                      value={formData.customType}
                      onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                      placeholder="DJ, Акустика, Стенд-ап..."
                      className={`${inputClass} mt-2`}
                      required
                    />
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className={labelClass}>Локация</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Мирабад"
                    className={inputClass}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Дополнительная информация о событии"
                    className={inputClass}
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                </div>

                {/* Toggles */}
                <div
                  className="flex items-center gap-6 py-4 px-4 rounded-xl"
                  style={{ background: 'var(--color-muted)' }}
                >
                  {[
                    { key: 'isActive', label: 'Активно', icon: 'Eye' },
                    { key: 'isHighlighted', label: 'Рекомендуем', icon: 'Star' },
                  ].map(({ key, label, icon }) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer flex-1">
                      <div
                        className="w-10 h-6 rounded-full relative transition-colors flex-shrink-0"
                        style={{ background: formData[key] ? 'var(--color-primary)' : 'var(--color-border)' }}
                        onClick={() => setFormData({ ...formData, [key]: !formData[key] })}
                      >
                        <div
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                          style={{ left: formData[key] ? 22 : 4 }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground">{label}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal footer */}
              <div
                className="px-6 py-4 flex gap-3"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                >
                  {editingEvent ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsEditor;
