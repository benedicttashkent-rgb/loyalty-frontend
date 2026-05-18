import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { adminApiRequest } from '../../../utils/adminApiClient';

export const APP_ROUTES = [
  { label: 'Главная страница', value: '/home-dashboard' },
  { label: 'Меню — Заказ с собой', value: '/food-ordering-menu' },
  { label: 'Мои награды / Каталог', value: '/rewards-catalog' },
  { label: 'Мой профиль', value: '/user-profile-management' },
  { label: 'Акции и промо', value: '/promotions-page' },
  { label: 'Филиалы / О нас', value: '/about-branch-locations' },
  { label: 'Внешняя ссылка (вставить URL вручную)', value: '__custom__' },
];

export const RoutePicker = ({ value, onChange }) => {
  const isCustom = value && !APP_ROUTES.some(r => r.value === value && r.value !== '__custom__');
  const selectVal = isCustom && value ? '__custom__' : (value || '');

  return (
    <div className="space-y-2">
      <select
        value={selectVal}
        onChange={e => onChange(e.target.value === '__custom__' ? '' : e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        style={{ fontSize: 'max(16px, 1em)' }}
      >
        <option value="">— Не открывать страницу —</option>
        {APP_ROUTES.map(r => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      {(selectVal === '__custom__' || isCustom) && (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="https://... или /путь"
          className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ fontSize: 'max(16px, 1em)' }}
        />
      )}
    </div>
  );
};

// Reusable detail content section for both editors
const DetailFormSection = ({ detailTitle, detailBody, detailImages, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const images = (() => { try { return JSON.parse(detailImages || '[]'); } catch { return []; } })();

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await adminApiRequest('admin/upload-detail-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        const updated = JSON.stringify([...images, data.url]);
        onChange('detailImages', updated);
      }
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const removeImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    onChange('detailImages', JSON.stringify(updated));
  };

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Окно при нажатии (необязательно)
      </p>
      <p className="text-xs text-muted-foreground -mt-1">
        Если заполнено — при нажатии откроется окно с подробностями вместо перехода на страницу.
      </p>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Заголовок окна</label>
        <input
          type="text"
          value={detailTitle || ''}
          onChange={e => onChange('detailTitle', e.target.value)}
          placeholder="Например: Скидка 20% на завтраки"
          className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ fontSize: 'max(16px, 1em)' }}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Текст</label>
        <textarea
          value={detailBody || ''}
          onChange={e => onChange('detailBody', e.target.value)}
          placeholder="Условия акции, описание, что нужно сделать..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          style={{ fontSize: 'max(16px, 1em)' }}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">Фото (до 5 штук)</label>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {images.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white"
                >
                  <Icon name="X" size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length < 5 && (
          <label className="cursor-pointer">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
              {uploading
                ? <><Icon name="Loader2" size={14} className="animate-spin" /> Загрузка...</>
                : <><Icon name="ImagePlus" size={14} /> Добавить фото</>}
            </div>
            <input type="file" accept="image/*" className="sr-only" disabled={uploading}
              onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
          </label>
        )}
      </div>
    </div>
  );
};

export default DetailFormSection;
