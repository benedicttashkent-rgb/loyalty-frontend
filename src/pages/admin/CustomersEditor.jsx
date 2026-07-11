import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import { formatDateDDMMYYYY } from '../../utils/formatDate';
import { adminApiRequest } from '../../utils/adminApiClient';


const TIER_CONFIG = {
  Bronze:   { color: '#cd7f32', bg: '#fdf3e7', label: 'Bronze' },
  Silver:   { color: '#9ca3af', bg: '#f3f4f6', label: 'Silver' },
  Gold:     { color: '#d4a574', bg: '#fef9f0', label: 'Gold' },
  Platinum: { color: '#8b6a4e', bg: '#f8efe0', label: 'Platinum' },
};

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const formatHour = (h) => `${String(h).padStart(2, '0')}:00`;

const CustomersEditor = () => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailTab, setDetailTab] = useState('info');
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [balanceAction, setBalanceAction] = useState(null); // 'add' | 'subtract'
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState('');
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoOrderAmount, setPromoOrderAmount] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [sortBy, sortOrder]);

  const fetchStats = async () => {
    try {
      const response = await adminApiRequest('admin/customers/stats', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setStats(data.stats);
      }
    } catch (e) {
      console.error('Fetch stats error:', e);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '999999',
        search: search.trim(),
        sortBy,
        sortOrder,
        includeBalance: 'true',
      });
      const response = await adminApiRequest(`admin/customers?${params}`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setCustomers(data.customers || []);
      }
    } catch (e) {
      console.error('Fetch customers error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleCustomerClick = async (customer) => {
    try {
      const response = await adminApiRequest(`admin/customers/${customer.id}`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedCustomer(data.customer);
          setDetailTab('info');
          setInsights(null);
          setBalanceAction(null);
          setBalanceAmount('');
          setBalanceError('');
          setPromoOpen(false);
          setPromoCode('');
          setPromoOrderAmount('');
          setPromoError('');
          setPromoSuccess('');
          setShowDetails(true);
        }
      }
    } catch (e) {
      console.error('Fetch customer details error:', e);
    }
  };

  const fetchInsights = async (customerId) => {
    if (insights) return;
    setInsightsLoading(true);
    try {
      const response = await adminApiRequest(`admin/customers/${customerId}/insights`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setInsights(data.insights);
      }
    } catch (e) {
      console.error('Fetch insights error:', e);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    setDeleting(true);
    try {
      const response = await adminApiRequest(`admin/customers/${selectedCustomer.id}`, { method: 'DELETE' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowDetails(false);
          setSelectedCustomer(null);
          setInsights(null);
          setDeleteConfirm(false);
          fetchCustomers();
          fetchStats();
        } else {
          alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
        }
      } else {
        const err = await response.json().catch(() => ({}));
        alert('Ошибка: ' + (err.error || 'Неизвестная ошибка'));
      }
    } catch (e) {
      console.error('Delete customer error:', e);
      alert('Ошибка удаления: ' + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleBalanceAdjust = async () => {
    const amount = parseFloat(balanceAmount);
    if (!amount || amount <= 0) { setBalanceError('Введите сумму больше 0'); return; }
    setBalanceLoading(true);
    setBalanceError('');
    try {
      const response = await adminApiRequest(`admin/customers/${selectedCustomer.id}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, operation: balanceAction }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setSelectedCustomer(prev => ({ ...prev, balance: data.balance ?? (balanceAction === 'add' ? prev.balance + amount : prev.balance - amount) }));
        setBalanceAction(null);
        setBalanceAmount('');
        fetchCustomers();
      } else {
        setBalanceError(data.error || 'Ошибка операции');
      }
    } catch (e) {
      setBalanceError('Ошибка: ' + e.message);
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleApplyPromoCode = async () => {
    const code = promoCode.trim();
    const orderAmount = parseFloat(promoOrderAmount);
    if (!code) { setPromoError('Введите промокод'); return; }
    if (!orderAmount || orderAmount <= 0) { setPromoError('Введите сумму заказа больше 0'); return; }
    setPromoLoading(true);
    setPromoError('');
    setPromoSuccess('');
    try {
      const response = await adminApiRequest(`admin/customers/${selectedCustomer.id}/promocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setSelectedCustomer(prev => ({ ...prev, balance: data.balance ?? prev.balance }));
        setPromoSuccess(`Начислено ${data.bonusAmount?.toLocaleString('ru-RU')} сум кэшбэка`);
        setPromoCode('');
        setPromoOrderAmount('');
        setPromoOpen(false);
        fetchCustomers();
      } else {
        setPromoError(data.error || 'Ошибка операции');
      }
    } catch (e) {
      setPromoError('Ошибка: ' + e.message);
    } finally {
      setPromoLoading(false);
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

  const formatBalance = (balance) => {
    if (balance === null || balance === undefined) return '—';
    return balance.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const getVisitFrequency = (lastVisitDate, visitCount, createdAt) => {
    if (!visitCount || visitCount === 0) {
      return { label: 'Нет визитов', color: '#9ca3af', bg: '#f3f4f6' };
    }

    const daysSinceLast = lastVisitDate
      ? Math.floor((Date.now() - new Date(lastVisitDate)) / 86400000)
      : null;

    if (visitCount === 1) {
      if (daysSinceLast === null || daysSinceLast > 90)
        return { label: 'Не вернулся', color: '#ef4444', bg: '#fef2f2' };
      return { label: 'Зашёл однажды', color: '#5b7fa6', bg: '#eef3fa' };
    }

    // avgInterval = days between first registration and last visit / (visits - 1)
    const spanDays = Math.max(1, Math.floor(
      (new Date(lastVisitDate) - new Date(createdAt || lastVisitDate)) / 86400000
    ));
    const avgInterval = spanDays / (visitCount - 1);
    const overdueRatio = daysSinceLast / avgInterval;

    // Health status takes priority — is this customer overdue vs their own pattern?
    if (overdueRatio >= 3)   return { label: 'Перестал ходить', color: '#ef4444', bg: '#fef2f2' };
    if (overdueRatio >= 1.5) return { label: 'Под угрозой',     color: '#f97316', bg: '#fff7ed' };
    if (overdueRatio >= 1.0) return { label: 'Скоро ожидается', color: '#f59e0b', bg: '#fffbeb' };

    // Within normal window — show their frequency pattern
    if (avgInterval <= 7)  return { label: 'Каждую неделю',  color: '#16a34a', bg: '#f0fdf4' };
    if (avgInterval <= 14) return { label: 'Раз в 2 недели', color: '#22c55e', bg: '#f0fdf4' };
    if (avgInterval <= 35) return { label: 'Раз в месяц',    color: '#3b82f6', bg: '#eff6ff' };
    if (avgInterval <= 70) return { label: 'Раз в 2 месяца', color: '#f59e0b', bg: '#fffbeb' };
    return                        { label: 'Изредка',         color: '#9ca3af', bg: '#f3f4f6' };
  };

  const getInitials = (name, surname) => {
    const n = (name || '').trim()[0] || '';
    const s = (surname || '').trim()[0] || '';
    return (n + s).toUpperCase() || '?';
  };

  const avatarColors = ['#8b6a4e', '#7c9885', '#5b7fa6', '#9d7bb5', '#c17b7b', '#7b8a4e'];
  const getAvatarColor = (id) => avatarColors[(id || 0) % avatarColors.length];

  if (loading && customers.length === 0) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
        </div>
        <div className="h-14 bg-muted rounded-2xl" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Клиенты</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {customers.length > 0 ? `${customers.length} клиентов в базе` : 'Загрузка...'}
          </p>
        </div>
        <button
          onClick={() => { fetchCustomers(); fetchStats(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
        >
          <Icon name="RefreshCw" size={15} className={loading ? 'animate-spin' : ''} />
          Обновить
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Всего клиентов',
              value: stats.total,
              sub: stats.newCustomers ? `${stats.newCustomers} новых` : null,
              icon: 'Users',
              accent: '#8b6a4e',
              bg: '#f8efe0',
            },
            {
              label: 'Новые клиенты',
              value: stats.newCustomers,
              sub: stats.total ? `${Math.round((stats.newCustomers / stats.total) * 100)}% от всех` : null,
              icon: 'UserPlus',
              accent: '#7c9885',
              bg: '#f0f7f3',
            },
            {
              label: 'С iiko',
              value: stats.withIiko,
              sub: stats.total ? `${Math.round((stats.withIiko / stats.total) * 100)}% подключены` : null,
              icon: 'CheckCircle',
              accent: '#5b7fa6',
              bg: '#eef3fa',
            },
            {
              label: 'С Telegram',
              value: stats.withTelegram,
              sub: stats.total ? `${Math.round((stats.withTelegram / stats.total) * 100)}% подключены` : null,
              icon: 'Send',
              accent: '#7b6fb5',
              bg: '#f2f0fb',
            },
          ].map(({ label, value, sub, icon, accent, bg }) => (
            <div key={label} className="rounded-2xl p-5" style={{ background: bg }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}20` }}>
                  <Icon name={icon} size={18} style={{ color: accent }} />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{value ?? '—'}</div>
              <div className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</div>
              {sub && <div className="text-xs mt-1 font-medium" style={{ color: accent }}>{sub}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Search & Sort */}
      <div className="bg-card rounded-2xl p-4" style={{ border: '1px solid var(--color-border)' }}>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Имя, фамилия, телефон, номер карты..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            <option value="created_at">По дате регистрации</option>
            <option value="name">По имени</option>
            <option value="sur_name">По фамилии</option>
            <option value="last_visit_date">По последнему визиту</option>
            <option value="visit_count">По кол-ву визитов</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            <option value="DESC">Сначала новые</option>
            <option value="ASC">Сначала старые</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Icon name="Search" size={15} />
            Найти
          </button>
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-card rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        {loading && customers.length > 0 && (
          <div className="px-5 py-2 text-xs text-muted-foreground flex items-center gap-2 border-b border-border" style={{ background: '#fef9f0' }}>
            <Icon name="RefreshCw" size={12} className="animate-spin" />
            Обновление...
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Клиент</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Телефон</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Баланс</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Статус / Тир</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Визиты</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wide uppercase">Регистрация</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="py-20 text-center">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f8efe0' }}>
                        <Icon name="Users" size={24} style={{ color: '#8b6a4e' }} />
                      </div>
                      <p className="text-base text-foreground mb-1">Клиенты не найдены</p>
                      <p className="text-sm text-muted-foreground">Попробуйте изменить поисковый запрос</p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const freq = getVisitFrequency(customer.last_visit_date, customer.visit_count, customer.created_at);
                  const tier = TIER_CONFIG[customer.tier];
                  const initials = getInitials(customer.name, customer.sur_name);
                  const avatarBg = getAvatarColor(customer.id);
                  return (
                    <tr
                      key={customer.id}
                      onClick={() => handleCustomerClick(customer)}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      {/* Name + avatar */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white"
                            style={{ background: avatarBg }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground text-sm leading-tight">
                              {[customer.name, customer.sur_name].filter(Boolean).join(' ') || '—'}
                            </div>
                            {customer.card_number && (
                              <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                                {customer.card_number}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              {customer.telegram_chat_id && (
                                <Icon name="Send" size={11} className="text-blue-400" title="Telegram подключён" />
                              )}
                              {customer.iiko_customer_id && (
                                <Icon name="CheckCircle" size={11} className="text-green-500" title="iiko подключён" />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                        {formatPhone(customer.phone)}
                      </td>

                      {/* Balance */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold" style={{ color: '#8b6a4e' }}>
                          {formatBalance(customer.balance)}
                        </span>
                        {customer.balance != null && (
                          <span className="text-xs text-muted-foreground ml-1">сум</span>
                        )}
                      </td>

                      {/* Status / Tier */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium w-fit"
                            style={
                              customer.is_new_customer
                                ? { background: '#f0fdf4', color: '#16a34a' }
                                : { background: '#eff6ff', color: '#2563eb' }
                            }
                          >
                            {customer.is_new_customer ? 'Новый' : 'Постоянный'}
                          </span>
                          {tier && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium w-fit"
                              style={{ background: tier.bg, color: tier.color }}
                            >
                              {tier.label}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Visits */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-foreground">
                          {customer.visit_count || 0}×
                        </div>
                        {customer.last_visit_date && (
                          <span
                            className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium"
                            style={{ background: freq.bg, color: freq.color }}
                          >
                            {freq.label}
                          </span>
                        )}
                        {customer.last_visit_date && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {formatDateDDMMYYYY(customer.last_visit_date)}
                          </div>
                        )}
                      </td>

                      {/* Registration */}
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateDDMMYYYY(customer.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {customers.length > 0 && (
          <div className="px-5 py-3" style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
            <span className="text-xs text-muted-foreground">
              {customers.length} клиентов
            </span>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowDetails(false); setSelectedCustomer(null); setInsights(null); setDeleteConfirm(false); setBalanceAction(null); setBalanceAmount(''); setBalanceError(''); setPromoOpen(false); setPromoCode(''); setPromoOrderAmount(''); setPromoError(''); setPromoSuccess(''); } }}
        >
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl" style={{ border: '1px solid var(--color-border)' }}>

            {/* Modal header */}
            <div className="flex items-center gap-4 p-6 pb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                style={{ background: getAvatarColor(selectedCustomer.id) }}
              >
                {getInitials(selectedCustomer.name, selectedCustomer.sur_name)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  {[selectedCustomer.name, selectedCustomer.sur_name].filter(Boolean).join(' ') || '—'}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">{formatPhone(selectedCustomer.phone)}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {selectedCustomer.is_new_customer ? (
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium" style={{ background: '#f0fdf4', color: '#16a34a' }}>Новый</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium" style={{ background: '#eff6ff', color: '#2563eb' }}>Постоянный</span>
                  )}
                  {TIER_CONFIG[selectedCustomer.tier] && (
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{ background: TIER_CONFIG[selectedCustomer.tier].bg, color: TIER_CONFIG[selectedCustomer.tier].color }}
                    >
                      {TIER_CONFIG[selectedCustomer.tier].label}
                    </span>
                  )}
                  {selectedCustomer.telegram_chat_id && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                      <Icon name="Send" size={10} />
                      Telegram
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setShowDetails(false); setSelectedCustomer(null); setInsights(null); setDeleteConfirm(false); setBalanceAction(null); setBalanceAmount(''); setBalanceError(''); setPromoOpen(false); setPromoCode(''); setPromoOrderAmount(''); setPromoError(''); setPromoSuccess(''); }}
                className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0 text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 border-b border-border">
              {[
                { id: 'info',     label: 'Профиль',   icon: 'User' },
                { id: 'insights', label: 'Аналитика', icon: 'BarChart2' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setDetailTab(tab.id);
                    if (tab.id === 'insights') fetchInsights(selectedCustomer.id);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    detailTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={tab.icon} size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Delete footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3" style={{ background: 'var(--color-muted)' }}>
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Icon name="Trash2" size={14} />
                  Удалить клиента
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-red-600 font-medium flex-1">Удалить без возможности восстановления?</span>
                  <button
                    onClick={handleDeleteCustomer}
                    disabled={deleting}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {deleting ? <Icon name="Loader2" size={13} className="animate-spin" /> : <Icon name="Trash2" size={13} />}
                    Да, удалить
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* Profile tab */}
              {detailTab === 'info' && (
                <div className="space-y-5">
                  {/* Balance hero */}
                  <div className="rounded-2xl p-5 space-y-4" style={{ background: '#f8efe0' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Баланс лояльности</div>
                        <div className="text-3xl font-bold" style={{ color: '#8b6a4e' }}>
                          {formatBalance(selectedCustomer.balance)} <span className="text-lg font-normal">сум</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#8b6a4e20' }}>
                        <Icon name="Wallet" size={22} style={{ color: '#8b6a4e' }} />
                      </div>
                    </div>

                    {/* Balance action buttons */}
                    {!balanceAction && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setBalanceAction('add'); setBalanceAmount(''); setBalanceError(''); }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                          style={{ background: '#7c9885' }}
                        >
                          <Icon name="Plus" size={15} />
                          Пополнить
                        </button>
                        <button
                          onClick={() => { setBalanceAction('subtract'); setBalanceAmount(''); setBalanceError(''); }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                          style={{ background: '#c17b7b' }}
                        >
                          <Icon name="Minus" size={15} />
                          Списать
                        </button>
                      </div>
                    )}

                    {/* Inline balance form */}
                    {balanceAction && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold" style={{ color: balanceAction === 'add' ? '#7c9885' : '#c17b7b' }}>
                          {balanceAction === 'add' ? '+ Пополнение баланса' : '− Списание с баланса'}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            value={balanceAmount}
                            onChange={(e) => { setBalanceAmount(e.target.value); setBalanceError(''); }}
                            placeholder="Сумма в сумах"
                            className="flex-1 px-3 py-2 rounded-xl text-sm bg-white border focus:outline-none focus:ring-2 transition-colors"
                            style={{ borderColor: '#8b6a4e40', fontSize: 'max(16px, 1em)' }}
                            autoFocus
                          />
                          <button
                            onClick={handleBalanceAdjust}
                            disabled={balanceLoading}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                            style={{ background: balanceAction === 'add' ? '#7c9885' : '#c17b7b' }}
                          >
                            {balanceLoading
                              ? <Icon name="Loader2" size={14} className="animate-spin" />
                              : <Icon name="Check" size={14} />}
                            ОК
                          </button>
                          <button
                            onClick={() => { setBalanceAction(null); setBalanceAmount(''); setBalanceError(''); }}
                            className="px-3 py-2 rounded-xl text-sm font-medium border transition-colors"
                            style={{ borderColor: '#8b6a4e40', color: '#8b6a4e' }}
                          >
                            Отмена
                          </button>
                        </div>
                        {balanceError && (
                          <p className="text-xs text-red-600">{balanceError}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Promo code — one-time-per-customer cashback */}
                  <div className="rounded-2xl p-5 space-y-3" style={{ background: '#f2f0fb' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#7b6fb520' }}>
                          <Icon name="Ticket" size={18} style={{ color: '#7b6fb5' }} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">Промокод</div>
                          <div className="text-xs text-muted-foreground">Разовый кэшбэк по рекламному коду</div>
                        </div>
                      </div>
                      {!promoOpen && (
                        <button
                          onClick={() => { setPromoOpen(true); setPromoError(''); setPromoSuccess(''); }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
                          style={{ background: '#7b6fb5' }}
                        >
                          Применить
                        </button>
                      )}
                    </div>

                    {promoOpen && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                            placeholder="Код (например SKIDKA15)"
                            className="flex-1 px-3 py-2 rounded-xl text-sm bg-white border focus:outline-none focus:ring-2 transition-colors uppercase"
                            style={{ borderColor: '#7b6fb540', fontSize: 'max(16px, 1em)' }}
                            autoFocus
                          />
                          <input
                            type="number"
                            min="1"
                            value={promoOrderAmount}
                            onChange={(e) => { setPromoOrderAmount(e.target.value); setPromoError(''); }}
                            placeholder="Сумма заказа"
                            className="w-36 px-3 py-2 rounded-xl text-sm bg-white border focus:outline-none focus:ring-2 transition-colors"
                            style={{ borderColor: '#7b6fb540', fontSize: 'max(16px, 1em)' }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleApplyPromoCode}
                            disabled={promoLoading}
                            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
                            style={{ background: '#7b6fb5' }}
                          >
                            {promoLoading
                              ? <Icon name="Loader2" size={14} className="animate-spin" />
                              : <Icon name="Check" size={14} />}
                            Начислить кэшбэк
                          </button>
                          <button
                            onClick={() => { setPromoOpen(false); setPromoCode(''); setPromoOrderAmount(''); setPromoError(''); setPromoSuccess(''); }}
                            className="px-3 py-2 rounded-xl text-sm font-medium border transition-colors"
                            style={{ borderColor: '#7b6fb540', color: '#7b6fb5' }}
                          >
                            Отмена
                          </button>
                        </div>
                        {promoError && <p className="text-xs text-red-600">{promoError}</p>}
                      </div>
                    )}
                    {!promoOpen && promoSuccess && (
                      <p className="text-xs font-medium" style={{ color: '#16a34a' }}>{promoSuccess}</p>
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3.5" style={{ background: 'var(--color-muted)' }}>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Icon name="MapPin" size={12} />
                        Визитов
                      </div>
                      <div className="text-xl font-bold text-foreground">{selectedCustomer.visit_count || 0}</div>
                      {selectedCustomer.last_visit_date && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Последний: {formatDateDDMMYYYY(selectedCustomer.last_visit_date)}
                        </div>
                      )}
                    </div>
                    <div className="rounded-xl p-3.5" style={{ background: 'var(--color-muted)' }}>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Icon name="Calendar" size={12} />
                        Дата регистрации
                      </div>
                      <div className="text-base font-semibold text-foreground">
                        {formatDateDDMMYYYY(selectedCustomer.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Personal info */}
                  <div className="space-y-0 rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                    {[
                      { icon: 'User',       label: 'Имя',            value: [selectedCustomer.name, selectedCustomer.sur_name].filter(Boolean).join(' ') || '—' },
                      { icon: 'Phone',      label: 'Телефон',        value: formatPhone(selectedCustomer.phone) },
                      { icon: 'Mail',       label: 'Email',          value: selectedCustomer.email || '—' },
                      { icon: 'Cake',       label: 'Дата рождения',  value: selectedCustomer.birth_date ? formatDateDDMMYYYY(selectedCustomer.birth_date) : '—' },
                      { icon: 'CreditCard', label: 'Карта лояльности', value: selectedCustomer.card_number || '—', mono: true },
                    ].map(({ icon, label, value, mono }, i, arr) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 px-4 py-3"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                      >
                        <Icon name={icon} size={15} className="text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{label}</span>
                        <span className={`text-sm text-foreground ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
                      </div>
                    ))}
                    {selectedCustomer.iiko_customer_id && (
                      <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <Icon name="CheckCircle" size={15} className="text-green-500 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground w-36 flex-shrink-0">iiko ID</span>
                        <span className="text-xs text-foreground font-mono">{selectedCustomer.iiko_customer_id}</span>
                      </div>
                    )}
                    {selectedCustomer.telegram_chat_id && (
                      <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <Icon name="Send" size={15} className="text-blue-400 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground w-36 flex-shrink-0">Telegram</span>
                        <span className="text-xs text-foreground font-mono">{selectedCustomer.telegram_chat_id}</span>
                      </div>
                    )}
                  </div>

                  {/* iiko wallets */}
                  {selectedCustomer.iikoInfo?.walletBalances?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Кошельки iiko</div>
                      <div className="space-y-1.5">
                        {selectedCustomer.iikoInfo.walletBalances.map((w, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: 'var(--color-muted)' }}>
                            <span className="text-sm text-foreground">{w.name}</span>
                            <span className="text-sm font-semibold" style={{ color: '#8b6a4e' }}>
                              {(w.balance || 0).toLocaleString('ru-RU')} сум
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Insights tab */}
              {detailTab === 'insights' && (
                <div>
                  {insightsLoading && (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}

                  {!insightsLoading && !insights && (
                    <div className="py-20 text-center">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f8efe0' }}>
                        <Icon name="ShoppingBag" size={24} style={{ color: '#8b6a4e' }} />
                      </div>
                      <p className="text-base text-foreground mb-1">Нет данных</p>
                      <p className="text-sm text-muted-foreground">У клиента нет завершённых заказов</p>
                    </div>
                  )}

                  {!insightsLoading && insights && (
                    <div className="space-y-5">
                      {/* Summary */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Заказов всего',      value: insights.totalOrders,                                    icon: 'ShoppingBag', accent: '#8b6a4e', bg: '#f8efe0' },
                          { label: 'За 30 дней',         value: insights.ordersLast30,                                   icon: 'Calendar',    accent: '#5b7fa6', bg: '#eef3fa' },
                          { label: 'Общий чек',          value: `${insights.totalSpend.toLocaleString('ru-RU')} сум`,    icon: 'TrendingUp',  accent: '#7c9885', bg: '#f0f7f3' },
                          { label: 'Средний чек',        value: `${insights.avgOrderValue.toLocaleString('ru-RU')} сум`, icon: 'Receipt',     accent: '#9d7bb5', bg: '#f2f0fb' },
                        ].map(({ label, value, icon, accent, bg }) => (
                          <div key={label} className="rounded-xl p-4" style={{ background: bg }}>
                            <div className="flex items-center gap-2 mb-2">
                              <Icon name={icon} size={14} style={{ color: accent }} />
                              <span className="text-xs text-muted-foreground">{label}</span>
                            </div>
                            <p className="text-lg font-bold" style={{ color: accent }}>{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Fav day & time */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--color-muted)' }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fef9f0' }}>
                            <Icon name="Star" size={16} style={{ color: '#d4a574' }} />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Любимый день</div>
                            <div className="text-lg font-bold text-foreground">{DAY_NAMES[insights.favoriteDay]}</div>
                          </div>
                        </div>
                        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--color-muted)' }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eef3fa' }}>
                            <Icon name="Clock" size={16} style={{ color: '#5b7fa6' }} />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Любимое время</div>
                            <div className="text-lg font-bold text-foreground">{formatHour(insights.favoriteHour)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Top dishes */}
                      {insights.topItems.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Icon name="Utensils" size={12} />
                            Любимые блюда
                          </div>
                          <div className="space-y-2.5">
                            {insights.topItems.map((item, i) => {
                              const pct = Math.round((item.totalQty / insights.topItems[0].totalQty) * 100);
                              return (
                                <div key={item.name}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-foreground flex items-center gap-1.5">
                                      {i === 0 && <Icon name="Trophy" size={12} style={{ color: '#d4a574' }} />}
                                      {item.name}
                                    </span>
                                    <span className="text-xs font-medium text-muted-foreground">×{item.totalQty}</span>
                                  </div>
                                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-muted)' }}>
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{ width: `${pct}%`, background: '#8b6a4e' }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Ratings */}
                      {insights.ratings.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Icon name="Star" size={12} />
                            Оценки блюд
                          </div>
                          <div className="space-y-2">
                            {insights.ratings.map((r, i) => (
                              <div key={i} className="flex items-center justify-between text-sm px-4 py-2.5 rounded-xl" style={{ background: 'var(--color-muted)' }}>
                                <span className="text-foreground truncate flex-1 mr-3">{r.item_name}</span>
                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                  {Array.from({ length: 5 }).map((_, s) => (
                                    <Icon key={s} name="Star" size={12} style={{ color: s < r.rating ? '#f59e0b' : 'var(--color-muted-foreground)', opacity: s < r.rating ? 1 : 0.3 }} />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersEditor;
