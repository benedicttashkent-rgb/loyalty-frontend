import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import { adminApiRequest } from '../../utils/adminApiClient';

const PromoCodesEditor = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('15');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [redemptions, setRedemptions] = useState({});
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);

  const [staffPin, setStaffPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinSaving, setPinSaving] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinSaved, setPinSaved] = useState(false);

  useEffect(() => {
    fetchPromoCodes();
    fetchStaffPin();
  }, []);

  const fetchStaffPin = async () => {
    try {
      const response = await adminApiRequest('admin/promo-codes/staff-pin', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStaffPin(data.pin || '');
          setPinInput(data.pin || '');
        }
      }
    } catch (e) {
      console.error('Fetch staff pin error:', e);
    }
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    const trimmed = pinInput.trim();
    if (!/^\d{4,8}$/.test(trimmed)) { setPinError('ПИН должен содержать от 4 до 8 цифр'); return; }
    setPinSaving(true);
    setPinError('');
    setPinSaved(false);
    try {
      const response = await adminApiRequest('admin/promo-codes/staff-pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: trimmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setStaffPin(data.pin);
        setPinSaved(true);
      } else {
        setPinError(data.error || 'Ошибка сохранения ПИН-кода');
      }
    } catch (e) {
      setPinError('Ошибка: ' + e.message);
    } finally {
      setPinSaving(false);
    }
  };

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const response = await adminApiRequest('admin/promo-codes', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setPromoCodes(data.promoCodes || []);
      }
    } catch (e) {
      console.error('Fetch promo codes error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    const percent = parseFloat(discountPercent);
    if (!trimmedCode) { setCreateError('Введите промокод'); return; }
    if (!percent || percent <= 0) { setCreateError('Введите процент скидки больше 0'); return; }
    setCreating(true);
    setCreateError('');
    try {
      const response = await adminApiRequest('admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmedCode, discountPercent: percent }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setCode('');
        setDiscountPercent('15');
        fetchPromoCodes();
      } else {
        setCreateError(data.error || 'Ошибка создания промокода');
      }
    } catch (e) {
      setCreateError('Ошибка: ' + e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (promo) => {
    try {
      const response = await adminApiRequest(`admin/promo-codes/${promo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !promo.active }),
      });
      if (response.ok) {
        fetchPromoCodes();
      }
    } catch (e) {
      console.error('Toggle promo code error:', e);
    }
  };

  const handleExpand = async (promo) => {
    if (expandedId === promo.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(promo.id);
    if (!redemptions[promo.id]) {
      setRedemptionsLoading(true);
      try {
        const response = await adminApiRequest(`admin/promo-codes/${promo.id}/redemptions`, { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRedemptions(prev => ({ ...prev, [promo.id]: data.redemptions || [] }));
          }
        }
      } catch (e) {
        console.error('Fetch redemptions error:', e);
      } finally {
        setRedemptionsLoading(false);
      }
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '—';
    if (phone.startsWith('998') && phone.length === 12) {
      const d = phone.slice(3);
      return `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Промокоды</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Гость вводит код в приложении и получает сертификат на скидку, показывает кассиру — кассир применяет скидку вручную на кассе. Каждый код можно использовать один раз на аккаунт.
        </p>
      </div>

      <form onSubmit={handleSavePin} className="rounded-2xl p-5 space-y-3 border" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <div className="text-sm font-semibold text-foreground">ПИН-код кассира</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Кассир вводит этот ПИН на экране сертификата гостя, чтобы применить скидку. После этого сертификат становится недействительным.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={pinInput}
            onChange={(e) => { setPinInput(e.target.value); setPinError(''); setPinSaved(false); }}
            placeholder="ПИН (4-8 цифр)"
            className="w-40 px-3 py-2 rounded-xl text-sm border tracking-widest focus:outline-none focus:ring-2 transition-colors"
            style={{ fontSize: 'max(16px, 1em)' }}
          />
          <button
            type="submit"
            disabled={pinSaving}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            style={{ background: 'var(--color-primary)' }}
          >
            {pinSaving
              ? <Icon name="Loader2" size={14} className="animate-spin" />
              : <Icon name="Save" size={14} />}
            Сохранить
          </button>
        </div>
        {pinError && <p className="text-xs text-red-600">{pinError}</p>}
        {pinSaved && !pinError && <p className="text-xs font-medium" style={{ color: '#16a34a' }}>Текущий ПИН: {staffPin}</p>}
      </form>

      <form onSubmit={handleCreate} className="rounded-2xl p-5 space-y-3 border" style={{ borderColor: 'var(--color-border)' }}>
        <div className="text-sm font-semibold text-foreground">Новый промокод</div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setCreateError(''); }}
            placeholder="Код (например SKIDKA15)"
            className="flex-1 min-w-[180px] px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-colors uppercase"
            style={{ fontSize: 'max(16px, 1em)' }}
          />
          <input
            type="number"
            min="1"
            max="100"
            value={discountPercent}
            onChange={(e) => { setDiscountPercent(e.target.value); setCreateError(''); }}
            placeholder="% скидки"
            className="w-32 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-colors"
            style={{ fontSize: 'max(16px, 1em)' }}
          />
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            style={{ background: 'var(--color-primary)' }}
          >
            {creating
              ? <Icon name="Loader2" size={14} className="animate-spin" />
              : <Icon name="Plus" size={14} />}
            Создать
          </button>
        </div>
        {createError && <p className="text-xs text-red-600">{createError}</p>}
      </form>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {loading ? (
          <div className="p-4 space-y-2 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded-xl" />)}
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="py-16 text-center">
            <Icon name="Ticket" size={28} className="mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">Промокодов пока нет</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {promoCodes.map((promo) => (
              <div key={promo.id}>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: promo.active ? '#16a34a20' : '#9ca3af20' }}
                    >
                      <Icon name="Ticket" size={18} style={{ color: promo.active ? '#16a34a' : '#9ca3af' }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{promo.code}</div>
                      <div className="text-xs text-muted-foreground">
                        Скидка {Number(promo.discount_percent)}% · использован {promo.redemption_count} раз
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExpand(promo)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      {expandedId === promo.id ? 'Скрыть' : 'Кто использовал'}
                    </button>
                    <button
                      onClick={() => handleToggleActive(promo)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                      style={{ background: promo.active ? '#ef4444' : '#16a34a' }}
                    >
                      {promo.active ? 'Деактивировать' : 'Активировать'}
                    </button>
                  </div>
                </div>
                {expandedId === promo.id && (
                  <div className="px-4 pb-4">
                    {redemptionsLoading && !redemptions[promo.id] ? (
                      <div className="text-xs text-muted-foreground">Загрузка...</div>
                    ) : (redemptions[promo.id] || []).length === 0 ? (
                      <div className="text-xs text-muted-foreground">Ещё никто не использовал</div>
                    ) : (
                      <div className="space-y-1.5">
                        {(redemptions[promo.id] || []).map((r) => (
                          <div key={r.id} className="flex items-center justify-between text-xs rounded-lg px-3 py-2" style={{ background: 'var(--color-muted)' }}>
                            <span className="font-medium text-foreground">
                              {r.name} {r.sur_name} · {formatPhone(r.phone)}
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(r.redeemed_at).toLocaleString('ru-RU')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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

export default PromoCodesEditor;
