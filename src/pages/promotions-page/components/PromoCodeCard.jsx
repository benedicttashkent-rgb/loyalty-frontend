import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { getApiUrl } from '../../../config/api';

const PromoCodeCard = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [pin, setPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

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

  const handleCashierConfirm = async () => {
    const trimmedPin = pin.trim();
    if (!trimmedPin) { setPinError('Кассир должен ввести ПИН-код'); return; }
    setPinLoading(true);
    setPinError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('customers/promocode/confirm'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ redemptionId: certificate.redemptionId, pin: trimmedPin }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setConfirmed(true);
      } else {
        setPinError(data.error || 'Ошибка подтверждения');
      }
    } catch (e) {
      setPinError('Ошибка: ' + e.message);
    } finally {
      setPinLoading(false);
    }
  };

  if (certificate) {
    if (confirmed) {
      return (
        <div className="rounded-2xl p-5 space-y-2 text-center mb-6" style={{ background: '#f3f4f6' }}>
          <Icon name="CheckCircle2" size={28} style={{ color: '#9ca3af', margin: '0 auto' }} />
          <div className="text-sm font-semibold text-muted-foreground">Сертификат «{certificate.code}» использован</div>
          <div className="text-xs text-muted-foreground">Скидка {certificate.discountPercent}% применена кассиром.</div>
        </div>
      );
    }
    return (
      <div className="rounded-2xl p-5 space-y-3 text-center mb-6" style={{ background: '#f8efe0', border: '2px dashed #8b6a4e' }}>
        <Icon name="Ticket" size={28} style={{ color: '#8b6a4e', margin: '0 auto' }} />
        <div className="text-2xl font-bold" style={{ color: '#8b6a4e' }}>-{certificate.discountPercent}%</div>
        <div className="text-sm font-semibold text-foreground">Сертификат «{certificate.code}»</div>
        <div className="text-xs text-muted-foreground">Покажите этот экран кассиру. Кассир введёт ПИН-код ниже, чтобы применить скидку — после этого сертификат станет недействительным.</div>
        <div className="space-y-3 pt-1">
          <div
            className="w-full px-3 py-2.5 rounded-xl text-lg font-semibold bg-white border text-center tracking-[0.5em]"
            style={{ borderColor: '#8b6a4e40', minHeight: 44 }}
          >
            {pin ? '•'.repeat(pin.length) : <span className="text-sm font-normal text-muted-foreground tracking-normal">ПИН-код кассира</span>}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => { if (pin.length < 8) setPin(pin + digit); setPinError(''); }}
                className="py-2.5 rounded-xl text-lg font-semibold bg-white border transition-colors active:scale-95"
                style={{ borderColor: '#8b6a4e40', color: '#8b6a4e' }}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setPin(''); setPinError(''); }}
              className="py-2.5 rounded-xl text-xs font-medium border transition-colors active:scale-95"
              style={{ borderColor: '#8b6a4e40', color: '#8b6a4e' }}
            >
              Очистить
            </button>
            <button
              type="button"
              onClick={() => { if (pin.length < 8) setPin(pin + '0'); setPinError(''); }}
              className="py-2.5 rounded-xl text-lg font-semibold bg-white border transition-colors active:scale-95"
              style={{ borderColor: '#8b6a4e40', color: '#8b6a4e' }}
            >
              0
            </button>
            <button
              type="button"
              onClick={() => { setPin(pin.slice(0, -1)); setPinError(''); }}
              className="py-2.5 rounded-xl flex items-center justify-center border transition-colors active:scale-95"
              style={{ borderColor: '#8b6a4e40', color: '#8b6a4e' }}
              aria-label="Стереть"
            >
              <Icon name="Delete" size={18} />
            </button>
          </div>

          <button
            onClick={handleCashierConfirm}
            disabled={pinLoading}
            className="w-full px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
            style={{ background: '#8b6a4e' }}
          >
            {pinLoading
              ? <Icon name="Loader2" size={14} className="animate-spin" />
              : <Icon name="Check" size={14} />}
            Применить скидку
          </button>
          {pinError && <p className="text-xs text-red-600">{pinError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 space-y-3 mb-6" style={{ background: '#f8efe0' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#8b6a4e20' }}>
            <Icon name="Ticket" size={18} style={{ color: '#8b6a4e' }} />
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
            style={{ background: '#8b6a4e' }}
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
            style={{ borderColor: '#8b6a4e40', fontSize: 'max(16px, 1em)' }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleRedeem}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
              style={{ background: '#8b6a4e' }}
            >
              {loading
                ? <Icon name="Loader2" size={14} className="animate-spin" />
                : <Icon name="Check" size={14} />}
              Получить сертификат
            </button>
            <button
              onClick={() => { setOpen(false); setCode(''); setError(''); }}
              className="px-3 py-2 rounded-xl text-sm font-medium border transition-colors"
              style={{ borderColor: '#8b6a4e40', color: '#8b6a4e' }}
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
