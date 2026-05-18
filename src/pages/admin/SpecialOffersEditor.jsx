import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import { adminApiRequest } from '../../utils/adminApiClient';
import { RoutePicker } from './components/DetailFormSection';

const SpecialOffersEditor = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', backgroundColor: '#1a1a1a', displayOrder: 0, isActive: true, buttonAction: '', detailTitle: '', detailBody: '', detailImages: '[]' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await adminApiRequest('admin/special-offers', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setOffers(data.offers || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', backgroundColor: '#1a1a1a', displayOrder: offers.length, isActive: true, buttonAction: '', detailTitle: '', detailBody: '', detailImages: '[]' });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (offer) => {
    setEditing(offer);
    setForm({
      title: offer.title || '',
      description: offer.description || '',
      backgroundColor: offer.background_color || '#1a1a1a',
      displayOrder: offer.display_order || 0,
      isActive: offer.is_active,
      buttonAction: offer.button_action || '',
      detailTitle: offer.detail_title || '',
      detailBody: offer.detail_body || '',
      detailImages: offer.detail_images || '[]',
    });
    setImageFile(null);
    setImagePreview(offer.image_url || null);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Введите название');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('backgroundColor', form.backgroundColor);
      fd.append('displayOrder', form.displayOrder);
      fd.append('isActive', form.isActive);
      if (imageFile) fd.append('image', imageFile);

      const url = editing ? `admin/special-offers/${editing.id}` : 'admin/special-offers';
      const method = editing ? 'PUT' : 'POST';
      const res = await adminApiRequest(url, { method, body: fd });
      if (res.ok) {
        setShowForm(false);
        fetchOffers();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Ошибка сохранения');
      }
    } catch (e) { alert('Ошибка: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить предложение?')) return;
    setDeleting(id);
    try {
      const res = await adminApiRequest(`admin/special-offers/${id}`, { method: 'DELETE' });
      if (res.ok) fetchOffers();
    } catch (e) { console.error(e); }
    finally { setDeleting(null); }
  };

  const toggleActive = async (offer) => {
    const fd = new FormData();
    fd.append('isActive', !offer.is_active);
    const res = await adminApiRequest(`admin/special-offers/${offer.id}`, { method: 'PUT', body: fd });
    if (res.ok) fetchOffers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Спецпредложения</h1>
          <p className="text-sm text-muted-foreground mt-1">Карточки в разделе «Специальные предложения» на главной</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={15} />
          Добавить
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
        </div>
      ) : offers.length === 0 ? (
        <div className="py-20 text-center bg-card rounded-2xl border border-border">
          <Icon name="Tag" size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-base text-foreground mb-1">Нет предложений</p>
          <p className="text-sm text-muted-foreground">Нажмите «Добавить» чтобы создать первое</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map(offer => (
            <div key={offer.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-stretch gap-0">
                {/* Image preview */}
                <div
                  className="w-28 flex-shrink-0 relative"
                  style={{ background: offer.background_color || '#1a1a1a' }}
                >
                  {offer.image_url && (
                    <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover absolute inset-0" />
                  )}
                  {!offer.image_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon name="Image" size={24} className="text-white/40" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{offer.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${offer.is_active ? 'bg-green-50 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                        {offer.is_active ? 'Активно' : 'Скрыто'}
                      </span>
                    </div>
                    {offer.description && <p className="text-xs text-muted-foreground line-clamp-2">{offer.description}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(offer)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-muted transition-colors">
                      <Icon name="Pencil" size={12} /> Изменить
                    </button>
                    <button onClick={() => toggleActive(offer)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-muted transition-colors">
                      <Icon name={offer.is_active ? 'EyeOff' : 'Eye'} size={12} />
                      {offer.is_active ? 'Скрыть' : 'Показать'}
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      disabled={deleting === offer.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors ml-auto"
                    >
                      <Icon name="Trash2" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-card rounded-2xl w-full max-w-md shadow-xl border border-border overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">{editing ? 'Редактировать' : 'Новое предложение'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Фото блюда / акции</label>
                <label className="cursor-pointer">
                  <div
                    className="w-full h-36 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative"
                    style={{ background: imagePreview ? form.backgroundColor : undefined }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Icon name="ImagePlus" size={28} className="mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Нажмите чтобы загрузить</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Название *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Например: -20% на завтраки"
                  className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ fontSize: 'max(16px, 1em)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Описание</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Краткое описание акции"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  style={{ fontSize: 'max(16px, 1em)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Цвет фона</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.backgroundColor} onChange={e => setForm(f => ({ ...f, backgroundColor: e.target.value }))}
                      className="w-10 h-9 rounded-lg border border-border cursor-pointer bg-background p-0.5" />
                    <span className="text-xs text-muted-foreground font-mono">{form.backgroundColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Порядок</label>
                  <input type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ fontSize: 'max(16px, 1em)' }} />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm text-foreground">Активно (показывать на главной)</span>
              </label>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Действие кнопки</label>
                <RoutePicker
                  value={form.buttonAction}
                  onChange={val => setForm(f => ({ ...f, buttonAction: val }))}
                  detailTitle={form.detailTitle}
                  detailBody={form.detailBody}
                  detailImages={form.detailImages}
                  onDetailChange={(key, val) => setForm(f => ({ ...f, [key]: val }))}
                />
              </div>
            </div>

            <div className="px-5 pb-5 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors">
                Отмена
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {saving ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Check" size={15} />}
                {editing ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialOffersEditor;
