import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { getApiUrl } from '../../../config/api';

const PromoCodeCard = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certificate, setCertificate] = useState(null);

  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) { setError('Введите промокод'); return; }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('customers/promocode/redeem'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setCertificate(data.certificate);
        setOpen(false);
      } else {
        setError(data.error || 'Ошибка активации промокода');
      }
    } catch (e) {
      setError('Ошибка: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (certificate) {
    return (
      <div className="rounded-2xl p-5 space-y-2 text-center" style={{ background: '#f2f0fb', border: '2px dashed #7b6fb5' }}>
        <Icon name="Ticket" size={28} style={{ color: '#7b6fb5', margin: '0 auto' }} />
        <div className="text-2xl font-bold" style={{ color: '#7b6fb5' }}>-{certificate.discountPercent}%</div>
        <div className="text-sm font-semibold text-foreground">Сертификат «{certificate.code}»</div>
        <div className="text-xs text-muted-foreground">Покажите этот экран кассиру для применения скидки. Код уже использован и больше не действует.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 space-y-3" style={{ background: '#f2f0fb' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#7b6fb520' }}>
            <Icon name="Ticket" size={18} style={{ color: '#7b6fb5' }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Есть промокод?</div>
            <div className="text-xs text-muted-foreground">Получите разовый сертификат на скидку</div>
          </div>
        </div>
        {!open && (
          <button
            onClick={() => { setOpen(true); setError(''); }}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: '#7b6fb5' }}
          >
            Ввести код
          </button>
        )}
      </div>

      {open && (
        <div className="space-y-2">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(''); }}
            placeholder="Введите промокод"
            className="w-full px-3 py-2 rounded-xl text-sm bg-white border focus:outline-none focus:ring-2 transition-colors uppercase"
            style={{ borderColor: '#7b6fb540', fontSize: 'max(16px, 1em)' }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleRedeem}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
              style={{ background: '#7b6fb5' }}
            >
              {loading
                ? <Icon name="Loader2" size={14} className="animate-spin" />
                : <Icon name="Check" size={14} />}
              Получить сертификат
            </button>
            <button
              onClick={() => { setOpen(false); setCode(''); setError(''); }}
              className="px-3 py-2 rounded-xl text-sm font-medium border transition-colors"
              style={{ borderColor: '#7b6fb540', color: '#7b6fb5' }}
            >
              Отмена
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default PromoCodeCard;
