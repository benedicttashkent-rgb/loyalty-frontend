import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { formatDateDDMMYYYY, formatDateForInput, parseDateDDMMYYYY, getMonthAbbr } from '../../utils/formatDate';

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
    customType: '', // For custom event types
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
      let url = '/api/admin/events';
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.month) params.append('month', filter.month);
      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEvents(data.events || []);
        }
      }
    } catch (error) {
      console.error('Fetch events error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter.type || filter.month) {
      fetchEvents();
    } else {
      fetchEvents(); // Always fetch when filters are cleared
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.type, filter.month]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.date) {
      alert('Дата обязательна. Введите дату в формате dd/mm/yyyy (например: 15/12/2024)');
      return;
    }

    if (!formData.performer) {
      alert('Исполнитель обязателен. Введите имя исполнителя или название события.');
      return;
    }

    if (!formData.time) {
      alert('Время обязательно. Введите время события (например: 20:00)');
      return;
    }

    if (formData.type === 'custom' && !formData.customType) {
      alert('Тип события обязателен. Введите тип события (например: DJ, Музыкант, и т.д.)');
      return;
    }

    try {
      const url = editingEvent
        ? `/api/admin/events/${editingEvent.id}`
        : '/api/admin/events';
      
      const method = editingEvent ? 'PUT' : 'POST';

      // Use FormData for file uploads
      const formDataToSend = new FormData();

      // Validate and send date in dd/mm/yyyy format as entered by user
      // Backend will parse it to yyyy-mm-dd
      const parsedDate = parseDateDDMMYYYY(formData.date);
      if (!parsedDate) {
        alert('Неверный формат даты. Используйте формат dd/mm/yyyy (например: 15/12/2024)');
        return;
      }
      
      // Extract month abbreviation if not provided
      if (!formData.month) {
        const monthAbbr = getMonthAbbr(parsedDate);
        formDataToSend.append('month', monthAbbr);
      } else {
        formDataToSend.append('month', formData.month);
      }
      
      // Send date in dd/mm/yyyy format - backend will parse it
      formDataToSend.append('date', formData.date.trim());
      formDataToSend.append('performer', formData.performer.trim());
      formDataToSend.append('time', formData.time.trim());
      
      // Use custom type if type is 'custom', otherwise use type
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

      console.log('[EventsEditor] Sending FormData:', {
        date: formData.date,
        month: formData.month,
        performer: formData.performer,
        time: formData.time,
        type: formData.type,
        customType: formData.customType
      });

      // Add event image file if selected
      if (eventImageFile) {
        formDataToSend.append('eventImage', eventImageFile);
      }

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formDataToSend,
      });

      const responseData = await response.json();
      
      if (response.ok) {
        await fetchEvents();
        setShowModal(false);
        resetForm();
      } else {
        const errorMessage = responseData.error || responseData.message || 'Failed to save event';
        alert(`Ошибка: ${errorMessage}`);
        console.error('Event save error:', responseData);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Ошибка соединения: ${error.message || 'Failed to save event'}`);
    }
  };

  const handleEventImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Note: For OCR/text extraction from image, this would require additional processing
      // on the backend. For now, we just upload the image and admin can manually enter event details.
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchEvents();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete event');
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
    // Set preview if image exists
    if (event.image_url) {
      setEventImagePreview(event.image_url);
    } else {
      setEventImagePreview(null);
    }
    setEventImageFile(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
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
    setEventImageFile(null);
    setEventImagePreview(null);
  };

  const eventTypes = [
    { value: 'pianist', label: 'Пианист', icon: 'Music' },
    { value: 'singer', label: 'Вокалист', icon: 'Mic' },
    { value: 'custom', label: 'Другой (ввести свой)', icon: 'User' },
  ];

  const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = event.date ? event.date.split('T')[0] : 'no-date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedEvents).sort();

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">События</h1>
          <p className="text-muted-foreground">Управление дайджестом событий</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 border border-input rounded-lg bg-background"
          >
            <option value="">Все типы</option>
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select
            value={filter.month}
            onChange={(e) => setFilter({ ...filter, month: e.target.value })}
            className="px-3 py-2 border border-input rounded-lg bg-background"
          >
            <option value="">Все месяцы</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Icon name="Plus" size={20} />
            Добавить Событие
          </button>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium text-foreground mb-2">Нет событий</p>
          <p className="text-sm text-muted-foreground mb-4">Создайте первое событие для дайджеста</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Добавить Событие
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-bold text-lg text-foreground mb-4">
                {date === 'no-date' ? 'Без даты' : formatDateDDMMYYYY(date)}
              </h3>
              <div className="space-y-3">
                {groupedEvents[date].map((event) => {
                  // Determine event type display
                  const isKnownType = ['pianist', 'singer'].includes(event.type);
                  const eventType = isKnownType ? eventTypes.find(t => t.value === event.type) : null;
                  const typeLabel = eventType ? eventType.label : event.type;
                  const typeIcon = eventType ? eventType.icon : 'Calendar';
                  const typeColor = event.type === 'pianist' ? 'bg-[#99836c]/20 text-[#99836c]' : 
                                   event.type === 'singer' ? 'bg-[#d4a574]/20 text-[#d4a574]' :
                                   'bg-primary/20 text-primary';
                  
                  return (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        event.is_highlighted
                          ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-primary/40'
                          : 'bg-background border-border'
                      }`}
                    >
                      {event.image_url && (
                        <div className="mb-3">
                          <img 
                            src={event.image_url} 
                            alt={event.performer} 
                            className="w-full max-w-xs h-32 object-cover rounded-lg border border-border"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-lg ${typeColor}`}>
                            <Icon 
                              name={typeIcon} 
                              size={20} 
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-foreground">{event.performer}</h4>
                              {event.is_highlighted && (
                                <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-medium">
                                  Рекомендуется
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                event.is_active ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'
                              }`}>
                                {event.is_active ? 'Активно' : 'Неактивно'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {typeLabel} • {event.location || 'Мирабад'}
                            </p>
                            {event.description && (
                              <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-foreground">{event.time}</div>
                            {event.month && (
                              <div className="text-xs text-muted-foreground">{event.month}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                          >
                            <Icon name="Edit" size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                          >
                            <Icon name="Trash2" size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingEvent ? 'Редактировать Событие' : 'Добавить Событие'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Фото События (Загрузить) - Для извлечения текста из фото (OCR)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEventImageChange}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  />
                  {eventImagePreview && (
                    <div className="mt-2">
                      <img 
                        src={eventImagePreview} 
                        alt="Event preview" 
                        className="w-full max-w-md object-cover rounded-lg border border-border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Preview - Text extraction from image will be processed on backend</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Дата (dd/mm/yyyy) *</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d/]/g, ''); // Only allow digits and /
                      
                      // Auto-format as user types: dd/mm/yyyy
                      if (value.length === 2 && !value.includes('/')) {
                        value = value + '/';
                      } else if (value.length === 5 && value.split('/').length === 2) {
                        value = value + '/';
                      }
                      
                      // Limit to 10 characters (dd/mm/yyyy)
                      if (value.length <= 10) {
                        setFormData({ ...formData, date: value });
                      }
                    }}
                    onBlur={(e) => {
                      // Validate date format on blur
                      const value = e.target.value.trim();
                      if (value && !parseDateDDMMYYYY(value)) {
                        // Don't clear, but show hint
                        console.warn('Invalid date format:', value);
                      }
                    }}
                    placeholder="15/12/2024"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    required
                    maxLength={10}
                    pattern="\d{2}/\d{2}/\d{4}"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Формат: dd/mm/yyyy (например: 15/12/2024)</p>
                  {formData.date && !parseDateDDMMYYYY(formData.date) && (
                    <p className="text-xs text-red-500 mt-1">⚠️ Неверный формат даты</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Время *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Месяц (для отображения)</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                >
                  <option value="">Авто (из даты)</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Месяц будет автоматически извлечен из даты, если не указан</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Локация</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    placeholder="Мирабад"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Порядок отображения</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Исполнитель/Название События *</label>
                <input
                  type="text"
                  value={formData.performer}
                  onChange={(e) => setFormData({ ...formData, performer: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  placeholder="Например: Самед (пианист), Сильвия (вокал), или любое другое событие"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Можно ввести любое название события, не только пианиста/вокалиста</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Тип События *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        type: e.target.value,
                        customType: e.target.value === 'custom' ? formData.customType : ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {formData.type === 'custom' && (
                    <input
                      type="text"
                      value={formData.customType}
                      onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                      placeholder="Введите тип события (например: DJ, Музыкант, и т.д.)"
                      className="w-full mt-2 px-3 py-2 border border-input rounded-lg bg-background"
                      required={formData.type === 'custom'}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Порядок отображения</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  rows={2}
                  placeholder="Дополнительная информация о событии"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Активно</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHighlighted}
                    onChange={(e) => setFormData({ ...formData, isHighlighted: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Рекомендуемое (выделено)</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  {editingEvent ? 'Обновить' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-input rounded-lg hover:bg-muted"
                >
                  Отмена
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

