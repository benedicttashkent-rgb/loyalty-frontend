import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { adminApiRequest } from '../../../utils/adminApiClient';

const INTERNAL_ROUTES = [
  { label: 'Главная страница', value: '/home-dashboard' },
  { label: 'Меню — Заказ с собой', value: '/food-ordering-menu' },
  { label: 'Мои награды / Каталог', value: '/rewards-catalog' },
  { label: 'Мой профиль', value: '/user-profile-management' },
  { label: 'Акции и промо', value: '/promotions-page' },
  { label: 'Филиалы / О нас', value: '/about-branch-locations' },
];

const isInternal = (val) => val && INTERNAL_ROUTES.some(r => r.value === val);

const DetailInlineForm = ({ detailTitle, detailBody, detailImages, onDetailChange }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const images = (() => { try { return JSON.parse(detailImages || '[]'); } catch { return []; } })();

  const uploadImage = async (file) => {
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await adminApiRequest('admin/upload-detail-image', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        onDetailChange('detailImages', JSON.stringify([...images, data.url]));
      } else {
        setUploadError(data.error || 'Не удалось загрузить фото');
      }
    } catch (e) {
      console.error('Upload error:', e);
      setUploadError('Ошибка соединения при загрузке');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx) => {
    onDetailChange('detailImages', JSON.stringify(images.filter((_, i) => i !== idx)));
  };

  return (
    <div className="space-y-3 p-3 rounded-xl border border-border" style={{ background: 'var(--color-muted)' }}>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Заголовок окна</label>
        <input
          type="text"
          value={detailTitle || ''}
          onChange={e => onDetailChange('detailTitle', e.target.value)}
          placeholder="Например: Скидка 20% на завтраки"
          className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ fontSize: 'max(16px, 1em)' }}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Текст</label>
        <textarea
          value={detailBody || ''}
          onChange={e => onDetailChange('detailBody', e.target.value)}
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
                  type="button"
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
          <>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:bg-background transition-colors disabled:opacity-50"
            >
              {uploading
                ? <><Icon name="Loader2" size={14} className="animate-spin" /> Загрузка...</>
                : <><Icon name="ImagePlus" size={14} /> Добавить фото</>}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={e => { if (e.target.files[0]) uploadImage(e.target.files[0]); }}
            />
            {uploadError && (
              <p className="text-xs text-destructive mt-1">{uploadError}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const RoutePicker = ({ value, onChange, detailTitle, detailBody, detailImages, onDetailChange }) => {
  const type = !value ? 'none' : value === '__detail__' ? 'detail' : isInternal(value) ? 'internal' : 'external';

  return (
    <div className="space-y-2">
      <div className="flex rounded-lg overflow-hidden border border-border">
        {[
          { id: 'none', label: 'Ничего' },
          { id: 'internal', label: 'Страница' },
          { id: 'external', label: 'Ссылка' },
          { id: 'detail', label: 'Окно при нажатии' },
        ].map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              if (opt.id === 'none') onChange('');
              else if (opt.id === 'internal') onChange(INTERNAL_ROUTES[0].value);
              else if (opt.id === 'external') onChange('https://');
              else onChange('__detail__');
            }}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${type === opt.id ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {type === 'internal' && (
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ fontSize: 'max(16px, 1em)' }}
        >
          {INTERNAL_ROUTES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      )}

      {type === 'external' && (
        <input
          type="url"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="https://instagram.com/benedict_cafe"
          className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ fontSize: 'max(16px, 1em)' }}
        />
      )}

      {type === 'detail' && onDetailChange && (
        <DetailInlineForm
          detailTitle={detailTitle}
          detailBody={detailBody}
          detailImages={detailImages}
          onDetailChange={onDetailChange}
        />
      )}
    </div>
  );
};

export default RoutePicker;
