import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import { adminApiRequest } from '../../utils/adminApiClient';

const serif = { fontFamily: "'Marcellus', serif" };

const NewsBannerEditor = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Coffee',
    backgroundColor: '#c89864',
    showButton: false,
    buttonText: '',
    buttonAction: '',
    isActive: true,
    displayOrder: 0,
  });
  const [iconImageFile, setIconImageFile] = useState(null);
  const [iconImagePreview, setIconImagePreview] = useState(null);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      const response = await adminApiRequest('admin/news', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setBanners(data.banners);
      }
    } catch (error) {
      console.error('Fetch banners error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingBanner ? `admin/news/${editingBanner.id}` : 'admin/news';
      const method = editingBanner ? 'PUT' : 'POST';
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      if (iconImageFile) formDataToSend.append('iconImage', iconImageFile);
      const response = await adminApiRequest(endpoint, { method, body: formDataToSend });
      if (response.ok) {
        await fetchBanners();
        setShowModal(false);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Ошибка при сохранении');
      }
    } catch (error) {
      alert('Ошибка соединения');
    }
  };

  const handleIconImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setIconImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот баннер?')) return;
    try {
      const response = await adminApiRequest(`admin/news/${id}`, { method: 'DELETE' });
      if (response.ok) await fetchBanners();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      icon: banner.icon || 'Coffee',
      backgroundColor: banner.background_color || '#c89864',
      showButton: banner.show_button || false,
      buttonText: banner.button_text || '',
      buttonAction: banner.button_action || '',
      isActive: banner.is_active !== undefined ? banner.is_active : true,
      displayOrder: banner.display_order || 0,
    });
    setIconImagePreview(banner.icon_image_url || null);
    setIconImageFile(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '', description: '', icon: 'Coffee',
      backgroundColor: '#c89864', showButton: false,
      buttonText: '', buttonAction: '', isActive: true, displayOrder: 0,
    });
    setIconImageFile(null);
    setIconImagePreview(null);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5";

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={serif}>Баннеры</h1>
          <p className="text-sm text-muted-foreground mt-1">{banners.length} баннеров на главной</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={16} />
          Добавить
        </button>
      </div>

      {/* Empty */}
      {banners.length === 0 && (
        <div className="py-20 text-center rounded-2xl" style={{ background: '#f8efe0' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#eedcbe' }}>
            <Icon name="Megaphone" size={24} style={{ color: '#b07c45' }} />
          </div>
          <p className="text-lg text-foreground mb-1" style={serif}>Нет баннеров</p>
          <p className="text-sm text-muted-foreground mb-5">Добавьте первый баннер для главной</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-5 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            Добавить баннер
          </button>
        </div>
      )}

      {/* Banner list */}
      {banners.length > 0 && (
        <div className="space-y-3">
          {banners.map(banner => (
            <div
              key={banner.id}
              className="group flex items-stretch gap-0 rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--color-border)' }}
            >
              {/* Color strip preview */}
              <div
                className="w-2 flex-shrink-0"
                style={{ background: banner.background_color || '#c89864' }}
              />

              {/* Banner preview mini */}
              <div
                className="flex items-center gap-3 p-4 flex-shrink-0"
                style={{
                  background: banner.background_color || '#c89864',
                  minWidth: 120,
                  maxWidth: 160,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.25)' }}
                >
                  {banner.icon_image_url ? (
                    <img src={banner.icon_image_url} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <Icon name={banner.icon || 'Coffee'} size={20} className="text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-white text-xs font-semibold truncate leading-tight" style={serif}>
                    {banner.title}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 flex items-center gap-4 px-4 py-3 bg-card">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground truncate">{banner.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded ${
                        banner.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {banner.is_active ? 'Активен' : 'Скрыт'}
                    </span>
                    {banner.show_button && (
                      <span className="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        Кнопка
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Редактировать"
                  >
                    <Icon name="Pencil" size={15} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    title="Удалить"
                  >
                    <Icon name="Trash2" size={15} className="text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div
            className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl"
            style={{ maxHeight: '92vh' }}
          >
            {/* Modal header */}
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-xl text-foreground" style={serif}>
                {editingBanner ? 'Редактировать баннер' : 'Новый баннер'}
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

                {/* Live preview */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: formData.backgroundColor }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.25)' }}
                    >
                      {iconImagePreview ? (
                        <img src={iconImagePreview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <Icon name={formData.icon || 'Coffee'} size={20} className="text-white" />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm leading-snug" style={serif}>
                        {formData.title || 'Заголовок баннера'}
                      </div>
                      <div className="text-white/80 text-xs mt-0.5">
                        {formData.description || 'Описание появится здесь'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className={labelClass}>Заголовок *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Например: Специальное предложение"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Описание *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Текст баннера для пользователей"
                    className={inputClass}
                    rows={3}
                    style={{ resize: 'none' }}
                    required
                  />
                </div>

                {/* Color + Icon */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Цвет фона</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5 bg-background"
                      />
                      <input
                        type="text"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className={inputClass}
                        placeholder="#c89864"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Иконка (Lucide)</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="Coffee"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Icon image upload */}
                <div>
                  <label className={labelClass}>Изображение иконки (заменяет иконку)</label>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px dashed var(--color-border)' }}>
                    {iconImagePreview ? (
                      <div className="relative">
                        <img src={iconImagePreview} alt="Preview" className="w-full object-cover" style={{ maxHeight: 120 }} />
                        <button
                          type="button"
                          onClick={() => { setIconImagePreview(null); setIconImageFile(null); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
                        >
                          <Icon name="X" size={14} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 py-5 cursor-pointer hover:bg-muted/50 transition-colors">
                        <Icon name="ImagePlus" size={20} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Загрузить изображение</span>
                        <input type="file" accept="image/*" onChange={handleIconImageChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Toggles */}
                <div
                  className="flex items-center gap-6 py-4 px-4 rounded-xl"
                  style={{ background: 'var(--color-muted)' }}
                >
                  {[
                    { key: 'isActive', label: 'Активен' },
                    { key: 'showButton', label: 'Показать кнопку' },
                  ].map(({ key, label }) => (
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
                      <span className="text-xs font-medium text-foreground">{label}</span>
                    </label>
                  ))}
                </div>

                {/* Button fields */}
                {formData.showButton && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={labelClass}>Текст кнопки</label>
                      <input
                        type="text"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        placeholder="Узнать больше"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Ссылка кнопки</label>
                      <input
                        type="text"
                        value={formData.buttonAction}
                        onChange={(e) => setFormData({ ...formData, buttonAction: e.target.value })}
                        placeholder="/promotions-page или https://..."
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid var(--color-border)' }}>
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
                  {editingBanner ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsBannerEditor;
