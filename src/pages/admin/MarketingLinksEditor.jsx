import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import { adminApiRequest } from '../../utils/adminApiClient';
import { inputClass, labelClass, primaryButtonClass, errorTextClass, hintTextClass, requiredMark } from './components/formPrimitives';

const MarketingLinksEditor = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [label, setLabel] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [qrById, setQrById] = useState({});
  const [qrLoadingId, setQrLoadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await adminApiRequest('admin/marketing-links', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setLinks(data.links || []);
      }
    } catch (e) {
      console.error('Fetch marketing links error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmedLabel = label.trim();
    const trimmedUrl = targetUrl.trim();
    if (!trimmedLabel) { setCreateError('Введите название'); return; }
    if (!/^https?:\/\//i.test(trimmedUrl)) { setCreateError('Ссылка должна начинаться с http:// или https://'); return; }

    setCreating(true);
    setCreateError('');
    try {
      const response = await adminApiRequest('admin/marketing-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: trimmedLabel, targetUrl: trimmedUrl }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setLabel('');
        setTargetUrl('');
        fetchLinks();
      } else {
        setCreateError(data.error || 'Ошибка создания ссылки');
      }
    } catch (e) {
      setCreateError('Ошибка: ' + e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (link) => {
    if (!confirm(`Удалить ссылку "${link.label}"? Статистика переходов будет потеряна.`)) return;
    try {
      const response = await adminApiRequest(`admin/marketing-links/${link.id}`, { method: 'DELETE' });
      if (response.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== link.id));
        setQrById((prev) => {
          const next = { ...prev };
          delete next[link.id];
          return next;
        });
      }
    } catch (e) {
      console.error('Delete marketing link error:', e);
    }
  };

  const startRename = (link) => {
    setRenamingId(link.id);
    setRenameValue(link.label);
  };

  const submitRename = async (link) => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === link.label) { setRenamingId(null); return; }
    try {
      const response = await adminApiRequest(`admin/marketing-links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: trimmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setLinks((prev) => prev.map((l) => (l.id === link.id ? data.link : l)));
      }
    } catch (e) {
      console.error('Rename marketing link error:', e);
    } finally {
      setRenamingId(null);
    }
  };

  const handleCopy = async (link) => {
    try {
      await navigator.clipboard.writeText(link.short_url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (e) {
      console.error('Copy error:', e);
    }
  };

  const toggleQr = async (link) => {
    if (qrById[link.id]) {
      setQrById((prev) => {
        const next = { ...prev };
        delete next[link.id];
        return next;
      });
      return;
    }
    setQrLoadingId(link.id);
    try {
      const response = await adminApiRequest(`admin/marketing-links/${link.id}/qr`, { method: 'GET' });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setQrById((prev) => ({ ...prev, [link.id]: data.qrImage }));
      }
    } catch (e) {
      console.error('Generate QR error:', e);
    } finally {
      setQrLoadingId(null);
    }
  };

  const handleDownload = (link) => {
    const qrImage = qrById[link.id];
    if (!qrImage) return;
    const a = document.createElement('a');
    a.href = qrImage;
    a.download = `qr-${link.code}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ссылки и QR-коды</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Создайте короткую ссылку на бот в Telegram, распечатайте QR-код и разместите его где угодно —
          сколько людей отсканировали и перешли, будет видно здесь.
        </p>
      </div>

      <form onSubmit={handleCreate} className="rounded-2xl p-5 space-y-3 border" style={{ borderColor: 'var(--color-border)' }}>
        <div className="text-sm font-semibold text-foreground">Новая ссылка</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Название{requiredMark}</label>
            <input
              type="text"
              value={label}
              onChange={(e) => { setLabel(e.target.value); setCreateError(''); }}
              placeholder="Например: Стол у входа, Instagram bio"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Куда ведёт (ссылка на Telegram-бота){requiredMark}</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => { setTargetUrl(e.target.value); setCreateError(''); }}
              placeholder="https://t.me/benedict_loyalty_bot?start=table4"
              className={inputClass}
            />
          </div>
        </div>
        {createError ? <p className={errorTextClass}>{createError}</p> : (
          <p className={hintTextClass}>
            Используйте параметр ?start=... чтобы понимать в самом боте, откуда пришёл гость.
          </p>
        )}
        <button type="submit" disabled={creating} className={`${primaryButtonClass} w-auto px-5 flex items-center gap-2`}>
          {creating ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Plus" size={14} />}
          Создать
        </button>
      </form>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {loading ? (
          <div className="p-4 space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}
          </div>
        ) : links.length === 0 ? (
          <div className="py-16 text-center">
            <Icon name="QrCode" size={28} className="mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">Ссылок пока нет</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {links.map((link) => (
              <div key={link.id} className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#f8efe0' }}>
                      <Icon name="Link2" size={18} style={{ color: '#8b6a4e' }} />
                    </div>
                    <div className="min-w-0">
                      {renamingId === link.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => submitRename(link)}
                          onKeyDown={(e) => { if (e.key === 'Enter') submitRename(link); if (e.key === 'Escape') setRenamingId(null); }}
                          className="text-sm font-semibold text-foreground bg-transparent border-b border-primary focus:outline-none"
                        />
                      ) : (
                        <button
                          onClick={() => startRename(link)}
                          className="text-sm font-semibold text-foreground hover:underline text-left truncate flex items-center gap-1.5"
                          title="Нажмите, чтобы переименовать"
                        >
                          {link.label}
                          <Icon name="Pencil" size={11} className="text-muted-foreground flex-shrink-0" />
                        </button>
                      )}
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{link.short_url}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">→ {link.target_url}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground leading-none">{link.click_count}</div>
                      <div className="text-[10px] tracking-widest uppercase text-muted-foreground mt-0.5">переходов</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(link)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        {copiedId === link.id ? 'Скопировано' : 'Копировать'}
                      </button>
                      <button
                        onClick={() => toggleQr(link)}
                        disabled={qrLoadingId === link.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        {qrLoadingId === link.id ? <Icon name="Loader2" size={12} className="animate-spin" /> : <Icon name="QrCode" size={12} />}
                        {qrById[link.id] ? 'Скрыть QR' : 'Показать QR'}
                      </button>
                      <button
                        onClick={() => handleDelete(link)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Удалить"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {qrById[link.id] && (
                  <div className="mt-4 flex items-center gap-4 rounded-xl p-4" style={{ background: 'var(--color-muted)' }}>
                    <img src={qrById[link.id]} alt={`QR код для ${link.label}`} className="w-32 h-32 rounded-lg bg-white p-1" />
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Распечатайте и разместите этот QR-код. Каждое сканирование засчитывается автоматически.
                      </p>
                      <button
                        onClick={() => handleDownload(link)}
                        className={`${primaryButtonClass} w-auto px-4 flex items-center gap-2`}
                      >
                        <Icon name="Download" size={14} />
                        Скачать PNG
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingLinksEditor;
